import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { config } from "./config";
import {
  classifyResponse, nextHealthState, shouldAutoRetire,
  type HealthRecord, type LiveStatus,
} from "./lib/health";
import { setFrontmatterField } from "./lib/frontmatter";

export interface ProjectMeta { slug: string; file: string; liveUrl: string; status: LiveStatus }
export interface HealthReport {
  checked: number;
  down: { slug: string; liveUrl: string }[];
  autoRetired: { slug: string; file: string; from: LiveStatus }[];
  // Set when every checked link reported down — almost always a runner-network
  // failure rather than reality, so no state is written and nothing is retired.
  skippedAllDown?: boolean;
}
type FetchResult = { ok: boolean; httpStatus?: number };
type FetchImpl = (url: string, signal?: AbortSignal) => Promise<FetchResult>;

export function readProjects(dir: string): ProjectMeta[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const file = join(dir, f);
      const { data } = matter(readFileSync(file, "utf8"));
      return { slug: String(data.slug ?? f.replace(/\.mdx$/, "")), file, liveUrl: data.liveUrl, status: data.status as LiveStatus };
    })
    .filter((p) => typeof p.liveUrl === "string" && p.liveUrl.length > 0);
}

const realFetch: FetchImpl = async (url, signal) => {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", signal });
    return { ok: res.ok, httpStatus: res.status };
  } catch {
    return { ok: false };
  }
};

export async function probe(url: string, retries: number, timeoutMs: number, fetchImpl: FetchImpl = realFetch): Promise<"up" | "down"> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    const res = await fetchImpl(url, ac.signal);
    clearTimeout(timer);
    if (classifyResponse(res) === "up") return "up";
    if (attempt < retries - 1) await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }
  return "down";
}

/**
 * Apply already-gathered up/down results to the persisted health state.
 * Free of network I/O — the up/down signal is supplied by the caller (the local
 * probe for dev, or the agent's WebFetch tool in the cloud sandbox where node
 * fetch is blocked). Results are keyed by project slug; projects with no result
 * are left untouched.
 */
export function applyResults(opts: {
  projects: ProjectMeta[];
  results: Record<string, "up" | "down">;
  stateFile: string;
  today: string;
  dryRun: boolean;
}): HealthReport {
  const { projects, results, stateFile, today, dryRun } = opts;
  const checked = projects.filter((p) => results[p.slug] !== undefined);

  // Safety valve: if every checked link is down, it's overwhelmingly more likely
  // the runner can't reach the internet than that every project died at once.
  // Write nothing and retire nothing — this makes a mass false-retirement impossible.
  const allDown = checked.length > 0 && checked.every((p) => results[p.slug] === "down");
  if (allDown) {
    return { checked: checked.length, down: [], autoRetired: [], skippedAllDown: true };
  }

  const state: Record<string, HealthRecord> = existsSync(stateFile)
    ? JSON.parse(readFileSync(stateFile, "utf8"))
    : {};
  const report: HealthReport = { checked: checked.length, down: [], autoRetired: [] };

  for (const p of checked) {
    const result = results[p.slug];
    const record = nextHealthState(state[p.slug], { liveUrl: p.liveUrl, result }, today);
    state[p.slug] = record;
    if (result === "down") report.down.push({ slug: p.slug, liveUrl: p.liveUrl });
    if (shouldAutoRetire(record, p.status, today, config.downtimeThresholdDays)) {
      report.autoRetired.push({ slug: p.slug, file: p.file, from: p.status });
      if (!dryRun) {
        let src = readFileSync(p.file, "utf8");
        src = setFrontmatterField(src, "status", "learned");
        src = setFrontmatterField(src, "badgeTone", "green");
        writeFileSync(p.file, src);
      }
    }
  }

  if (!dryRun) writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n");
  return report;
}

/**
 * Local/dev path: probe each live link with node fetch, then apply the results.
 * In the cloud sandbox node fetch is blocked, so use `--list` + the WebFetch tool
 * + `--apply` instead (see automation/projects-agent.md).
 */
export async function runHealthCheck(opts: {
  projectsDir: string; stateFile: string; today: string; dryRun: boolean;
  fetchImpl?: FetchImpl; retries?: number; timeoutMs?: number;
}): Promise<HealthReport> {
  const retries = opts.retries ?? config.liveLinkRetries;
  const timeoutMs = opts.timeoutMs ?? config.liveLinkTimeoutMs;
  const projects = readProjects(opts.projectsDir);
  const results: Record<string, "up" | "down"> = {};
  for (const p of projects) {
    results[p.slug] = await probe(p.liveUrl, retries, timeoutMs, opts.fetchImpl);
  }
  return applyResults({ projects, results, stateFile: opts.stateFile, today: opts.today, dryRun: opts.dryRun });
}

if (process.argv[1] && process.argv[1].endsWith("check-health.ts")) {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const projectsDir = join(process.cwd(), "content/projects");
  const stateFile = join(process.cwd(), "data/health-state.json");
  const today = new Date().toISOString().slice(0, 10);

  if (argv.includes("--list")) {
    // Emit the projects + live URLs for the agent to check via WebFetch. No network.
    console.log(JSON.stringify(readProjects(projectsDir), null, 2));
  } else {
    const applyIdx = argv.indexOf("--apply");
    if (applyIdx !== -1) {
      // Apply agent-gathered results: JSON file mapping slug -> "up" | "down".
      const file = argv[applyIdx + 1];
      const results = JSON.parse(readFileSync(file, "utf8")) as Record<string, "up" | "down">;
      const report = applyResults({ projects: readProjects(projectsDir), results, stateFile, today, dryRun });
      console.log(JSON.stringify(report, null, 2));
    } else {
      runHealthCheck({ projectsDir, stateFile, today, dryRun }).then((report) => {
        console.log(JSON.stringify(report, null, 2));
      });
    }
  }
}

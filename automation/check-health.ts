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

export async function runHealthCheck(opts: {
  projectsDir: string; stateFile: string; today: string; dryRun: boolean;
  fetchImpl?: FetchImpl; retries?: number; timeoutMs?: number;
}): Promise<HealthReport> {
  const retries = opts.retries ?? config.liveLinkRetries;
  const timeoutMs = opts.timeoutMs ?? config.liveLinkTimeoutMs;
  const state: Record<string, HealthRecord> = existsSync(opts.stateFile)
    ? JSON.parse(readFileSync(opts.stateFile, "utf8"))
    : {};
  const projects = readProjects(opts.projectsDir);
  const report: HealthReport = { checked: 0, down: [], autoRetired: [] };

  for (const p of projects) {
    report.checked++;
    const result = await probe(p.liveUrl, retries, timeoutMs, opts.fetchImpl);
    const record = nextHealthState(state[p.slug], { liveUrl: p.liveUrl, result }, opts.today);
    state[p.slug] = record;
    if (result === "down") report.down.push({ slug: p.slug, liveUrl: p.liveUrl });
    if (shouldAutoRetire(record, p.status, opts.today, config.downtimeThresholdDays)) {
      report.autoRetired.push({ slug: p.slug, file: p.file, from: p.status });
      if (!opts.dryRun) {
        let src = readFileSync(p.file, "utf8");
        src = setFrontmatterField(src, "status", "learned");
        src = setFrontmatterField(src, "badgeTone", "green");
        writeFileSync(p.file, src);
      }
    }
  }

  if (!opts.dryRun) writeFileSync(opts.stateFile, JSON.stringify(state, null, 2) + "\n");
  return report;
}

if (process.argv[1] && process.argv[1].endsWith("check-health.ts")) {
  const dryRun = process.argv.includes("--dry-run");
  runHealthCheck({
    projectsDir: join(process.cwd(), "content/projects"),
    stateFile: join(process.cwd(), "data/health-state.json"),
    today: new Date().toISOString().slice(0, 10),
    dryRun,
  }).then((report) => {
    console.log(JSON.stringify(report, null, 2));
  });
}

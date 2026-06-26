import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runHealthCheck } from "./check-health";

let dir: string;
let projectsDir: string;
let stateFile: string;

const mdx = (slug: string, status: string, url: string, badgeTone = "green") => `---
title: "${slug}"
slug: "${slug}"
date: "2026-01-01"
status: ${status}
badgeTone: ${badgeTone}
liveUrl: "${url}"
summary: "s"
featured: false
---
Body.
`;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "keeper-"));
  projectsDir = join(dir, "projects");
  mkdirSync(projectsDir);
  stateFile = join(dir, "health-state.json");
  writeFileSync(join(projectsDir, "alpha.mdx"), mdx("alpha", "active", "https://up.example"));
  writeFileSync(join(projectsDir, "beta.mdx"), mdx("beta", "active", "https://down.example", "accent"));
});

afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("runHealthCheck", () => {
  it("flags down projects and auto-retires long-dead ones", async () => {
    // beta already down for 8 days in prior state
    writeFileSync(stateFile, JSON.stringify({
      beta: { liveUrl: "https://down.example", lastStatus: "down", firstSeenDown: "2026-06-18", lastChecked: "2026-06-25" },
    }));
    const fetchImpl = async (url: string) =>
      url.includes("down") ? { ok: false, httpStatus: 503 } : { ok: true, httpStatus: 200 };

    const report = await runHealthCheck({
      projectsDir, stateFile, today: "2026-06-26", dryRun: false, fetchImpl, retries: 1, timeoutMs: 1000,
    });

    expect(report.checked).toBe(2);
    expect(report.down.map((d) => d.slug)).toContain("beta");
    expect(report.autoRetired.map((r) => r.slug)).toContain("beta");
    // MDX rewritten
    const betaMdx = readFileSync(join(projectsDir, "beta.mdx"), "utf8");
    expect(betaMdx).toContain("status: learned");
    expect(betaMdx).toContain("badgeTone: green");
    // state persisted
    const state = JSON.parse(readFileSync(stateFile, "utf8"));
    expect(state.alpha.lastStatus).toBe("up");
    expect(state.beta.firstSeenDown).toBe("2026-06-18");
  });

  it("dry-run writes nothing", async () => {
    const fetchImpl = async () => ({ ok: false, httpStatus: 500 });
    const before = readFileSync(join(projectsDir, "beta.mdx"), "utf8");
    await runHealthCheck({
      projectsDir, stateFile, today: "2026-06-26", dryRun: true, fetchImpl, retries: 1, timeoutMs: 1000,
    });
    expect(readFileSync(join(projectsDir, "beta.mdx"), "utf8")).toBe(before);
    expect(existsSync(stateFile)).toBe(false);
  });
});

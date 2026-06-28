import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runHealthCheck, applyResults, readProjects } from "./check-health";

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

  it("dry-run writes nothing, even when there are changes to apply", async () => {
    // Seed beta down >7d so it WOULD auto-retire — proves dry-run blocks both
    // the MDX rewrite and the state write. alpha up so the safety valve is inactive.
    writeFileSync(stateFile, JSON.stringify({
      beta: { liveUrl: "https://down.example", lastStatus: "down", firstSeenDown: "2026-06-18", lastChecked: "2026-06-25" },
    }));
    const fetchImpl = async (url: string) =>
      url.includes("down") ? { ok: false, httpStatus: 503 } : { ok: true, httpStatus: 200 };
    const beforeBeta = readFileSync(join(projectsDir, "beta.mdx"), "utf8");
    const beforeState = readFileSync(stateFile, "utf8");

    const report = await runHealthCheck({
      projectsDir, stateFile, today: "2026-06-26", dryRun: true, fetchImpl, retries: 1, timeoutMs: 1000,
    });

    expect(report.autoRetired.map((r) => r.slug)).toContain("beta"); // computed
    expect(readFileSync(join(projectsDir, "beta.mdx"), "utf8")).toBe(beforeBeta); // not written
    expect(readFileSync(stateFile, "utf8")).toBe(beforeState); // not written
  });
});

describe("applyResults safety valve", () => {
  it("when ALL checked links are down, writes nothing and flags skippedAllDown", () => {
    const report = applyResults({
      projects: readProjects(projectsDir),
      results: { alpha: "down", beta: "down" },
      stateFile, today: "2026-06-26", dryRun: false,
    });
    expect(report.skippedAllDown).toBe(true);
    expect(report.down).toEqual([]);
    expect(report.autoRetired).toEqual([]);
    expect(existsSync(stateFile)).toBe(false); // nothing written
  });

  it("does NOT trigger when at least one link is up", () => {
    const report = applyResults({
      projects: readProjects(projectsDir),
      results: { alpha: "up", beta: "down" },
      stateFile, today: "2026-06-26", dryRun: false,
    });
    expect(report.skippedAllDown).toBeUndefined();
    expect(report.down.map((d) => d.slug)).toEqual(["beta"]);
    expect(existsSync(stateFile)).toBe(true);
  });
});

describe("applyResults (agent-gathered results path)", () => {
  it("applies up/down results and auto-retires per persisted state", () => {
    writeFileSync(stateFile, JSON.stringify({
      beta: { liveUrl: "https://down.example", lastStatus: "down", firstSeenDown: "2026-06-18", lastChecked: "2026-06-25" },
    }));
    const report = applyResults({
      projects: readProjects(projectsDir),
      results: { alpha: "up", beta: "down" },
      stateFile, today: "2026-06-26", dryRun: false,
    });
    expect(report.checked).toBe(2);
    expect(report.autoRetired.map((r) => r.slug)).toContain("beta");
    expect(readFileSync(join(projectsDir, "beta.mdx"), "utf8")).toContain("status: learned");
    const state = JSON.parse(readFileSync(stateFile, "utf8"));
    expect(state.alpha.lastStatus).toBe("up");
    expect(state.beta.firstSeenDown).toBe("2026-06-18");
  });

  it("ignores projects with no result (unchecked)", () => {
    const report = applyResults({
      projects: readProjects(projectsDir),
      results: { alpha: "up" }, // beta unchecked
      stateFile, today: "2026-06-26", dryRun: false,
    });
    expect(report.checked).toBe(1);
    const state = JSON.parse(readFileSync(stateFile, "utf8"));
    expect(state.alpha).toBeDefined();
    expect(state.beta).toBeUndefined();
  });
});

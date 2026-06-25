# Website Keeper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily automation that detects new book purchases in Gmail and adds them to the reading library with validated covers, checks project live-link health and auto-retires long-dead projects, and opens at most one combined PR per run — only when something changed.

**Architecture:** A scheduled Claude agent (the orchestrator) loads checked-in instruction files and dispatches two isolated sub-agents (Books, Projects). Correctness-critical, deterministic logic (slug derivation, health-state math, frontmatter edits) lives in tested TypeScript modules under `automation/lib/` and a runnable `automation/check-health.ts` script. Judgment-heavy work (reading purchase emails, visually validating covers, writing the PR) lives in markdown instruction files the agents follow at runtime.

**Tech Stack:** TypeScript, Node 26, Vitest (test runner), tsx (script runner), Next.js 16 + Contentlayer (existing site), `gh` CLI (PRs), Claude Google Workspace MCP connector (Gmail).

## Global Constraints

- Node version: **26.x** (already installed).
- Do **not** touch `data/shelf.ts` (manual "currently reading"/"listening" lists).
- New book entries append to `data/library.ts` only; bump the count in `app/reading/page.tsx`.
- Cover files: `public/images/books/<slug>.jpg`; `<slug>` from `bookSlug()` (Task 2).
- Gmail processed-label name: **`website-processed`**.
- Downtime threshold: **7 days**, counted from `firstSeenDown`.
- Live-link retries: **3** with backoff; **"down"** = non-2xx/3xx, connection failure, or timeout on all retries.
- Auto-retire applies only when current status is `active`, `stable`, or `shipped`; never to `retired`/`abandoned`/`dead`/`acquired`/`learned`. New status = `learned`, `badgeTone` = `green`.
- **Never auto-merge** PRs. PR branch name: `auto/website-update-YYYY-MM-DD`.
- All new code is TypeScript with explicit types; follow existing 2-space indentation.
- Commit after each task.

---

## File Structure

**New — tested TypeScript:**
- `automation/config.ts` — tunables + types (sources, label, thresholds, retries).
- `automation/lib/slug.ts` — `bookSlug()`, `uniqueSlug()`.
- `automation/lib/library-entry.ts` — `formatLibraryEntry()`, `isDuplicate()`, `bumpReadingCount()`.
- `automation/lib/health.ts` — health types, `classifyResponse()`, `nextHealthState()`, `shouldAutoRetire()`.
- `automation/lib/frontmatter.ts` — `setFrontmatterField()`.
- `automation/check-health.ts` — runnable script wiring health.ts + frontmatter.ts over project MDX.

**New — agent instructions (prose):**
- `automation/books-agent.md`, `automation/projects-agent.md`, `automation/website-keeper.md`.

**New — state/docs:**
- `data/health-state.json` — per-project health history (seeded in Task 8).
- `automation/README.md` — how it runs, how to schedule, how to tune.

**Modified:** `package.json` (devDeps + scripts), `data/library.ts`, `app/reading/page.tsx`, `content/projects/*.mdx` (at runtime only).

---

## Task 1: Test tooling + automation config

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `automation/config.ts`
- Test: `automation/config.test.ts`

**Interfaces:**
- Produces: `automation/config.ts` default export `config` with shape:
  ```ts
  export type BookFormat = "Kindle" | "Audible" | "Physical";
  export interface PurchaseSource {
    id: string;            // "amazon-kindle"
    label: string;         // human name
    format: BookFormat;
    gmailQuery: string;    // Gmail search fragment, excludes processed label at call site
  }
  export interface KeeperConfig {
    processedLabel: string;
    downtimeThresholdDays: number;
    liveLinkRetries: number;
    liveLinkTimeoutMs: number;
    coverSourcesOrder: string[];      // ["google-books","itunes","open-library","duckduckgo"]
    purchaseSources: PurchaseSource[];
  }
  export const config: KeeperConfig;
  ```

- [ ] **Step 1: Add dev dependencies and scripts**

Modify `package.json` `devDependencies` (add) and `scripts` (add `test`):
```json
"scripts": {
  "dev": "next dev --webpack",
  "build": "next build --webpack",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "keeper:health": "tsx automation/check-health.ts"
}
```
Add to `devDependencies`: `"vitest": "^3.2.0"`, `"tsx": "^4.20.0"`, `"gray-matter": "^4.0.3"`.

- [ ] **Step 2: Install**

Run: `npm install`
Expected: installs without error; `node_modules/.bin/vitest` and `node_modules/.bin/tsx` exist.

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["automation/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 4: Write the failing test**

`automation/config.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { config } from "./config";

describe("keeper config", () => {
  it("has the agreed defaults", () => {
    expect(config.processedLabel).toBe("website-processed");
    expect(config.downtimeThresholdDays).toBe(7);
    expect(config.liveLinkRetries).toBe(3);
    expect(config.coverSourcesOrder).toEqual([
      "google-books", "itunes", "open-library", "duckduckgo",
    ]);
  });

  it("maps every purchase source to a valid format", () => {
    const valid = new Set(["Kindle", "Audible", "Physical"]);
    expect(config.purchaseSources.length).toBeGreaterThan(0);
    for (const s of config.purchaseSources) {
      expect(valid.has(s.format)).toBe(true);
      expect(s.gmailQuery.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test -- automation/config.test.ts`
Expected: FAIL — cannot find module `./config`.

- [ ] **Step 6: Create `automation/config.ts`**

```ts
export type BookFormat = "Kindle" | "Audible" | "Physical";

export interface PurchaseSource {
  id: string;
  label: string;
  format: BookFormat;
  gmailQuery: string;
}

export interface KeeperConfig {
  processedLabel: string;
  downtimeThresholdDays: number;
  liveLinkRetries: number;
  liveLinkTimeoutMs: number;
  coverSourcesOrder: string[];
  purchaseSources: PurchaseSource[];
}

export const config: KeeperConfig = {
  processedLabel: "website-processed",
  downtimeThresholdDays: 7,
  liveLinkRetries: 3,
  liveLinkTimeoutMs: 10000,
  coverSourcesOrder: ["google-books", "itunes", "open-library", "duckduckgo"],
  purchaseSources: [
    {
      id: "amazon-kindle",
      label: "Amazon Kindle",
      format: "Kindle",
      gmailQuery: 'from:(digital-no-reply@amazon.in OR digital-no-reply@amazon.com) subject:(Kindle OR "digital order")',
    },
    {
      id: "audible",
      label: "Audible",
      format: "Audible",
      gmailQuery: 'from:(donotreply@audible.com OR account@audible.in OR no-reply@audible.com)',
    },
    {
      id: "amazon-physical",
      label: "Amazon (physical)",
      format: "Physical",
      gmailQuery: 'from:(order-update@amazon.in OR auto-confirm@amazon.in OR shipment-tracking@amazon.in) subject:(ordered OR shipped OR delivered)',
    },
    {
      id: "other-retailers",
      label: "Other book retailers",
      format: "Physical",
      gmailQuery: 'from:(kobo.com OR play.google.com OR apple.com) subject:(book OR order OR receipt)',
    },
  ],
};
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -- automation/config.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts automation/config.ts automation/config.test.ts
git commit -m "feat(keeper): add test tooling and automation config"
```

---

## Task 2: Book slug derivation

**Files:**
- Create: `automation/lib/slug.ts`
- Test: `automation/lib/slug.test.ts`

**Interfaces:**
- Produces:
  - `bookSlug(title: string): string` — lowercase, non-alphanumeric runs → `-`, trimmed, hard-truncated to 60 chars, trailing `-` trimmed.
  - `uniqueSlug(base: string, exists: (slug: string) => boolean): string` — appends `-2`, `-3`, … until `exists` returns false.

- [ ] **Step 1: Write the failing test**

`automation/lib/slug.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { bookSlug, uniqueSlug } from "./slug";

describe("bookSlug", () => {
  it("slugifies a simple title", () => {
    expect(bookSlug("Atomic Habits")).toBe("atomic-habits");
  });

  it("turns apostrophes and punctuation into single hyphens", () => {
    expect(bookSlug("A Midsummer Night's Dream")).toBe("a-midsummer-night-s-dream");
  });

  it("collapses runs and trims edges", () => {
    expect(bookSlug("  Range:  Why Generalists... ")).toBe("range-why-generalists");
  });

  it("hard-truncates to 60 chars matching the existing convention", () => {
    const title =
      "Discourse on the Method of Rightly Conducting One's Reason and of Seeking Truth in the Sciences";
    const slug = bookSlug(title);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug).toBe("discourse-on-the-method-of-rightly-conducting-one-s-reason-a");
  });

  it("never leaves a trailing hyphen after truncation", () => {
    // 'X' placed so char 61 is a hyphen boundary
    const slug = bookSlug("a".repeat(59) + " bbbb");
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("uniqueSlug", () => {
  it("returns base when unused", () => {
    expect(uniqueSlug("dune", () => false)).toBe("dune");
  });

  it("appends a counter when taken", () => {
    const taken = new Set(["dune", "dune-2"]);
    expect(uniqueSlug("dune", (s) => taken.has(s))).toBe("dune-3");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- automation/lib/slug.test.ts`
Expected: FAIL — cannot find module `./slug`.

- [ ] **Step 3: Implement `automation/lib/slug.ts`**

```ts
const MAX_SLUG_LEN = 60;

export function bookSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.slice(0, MAX_SLUG_LEN).replace(/-+$/g, "");
}

export function uniqueSlug(base: string, exists: (slug: string) => boolean): string {
  if (!exists(base)) return base;
  let n = 2;
  while (exists(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- automation/lib/slug.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add automation/lib/slug.ts automation/lib/slug.test.ts
git commit -m "feat(keeper): add book slug derivation"
```

---

## Task 3: Library entry formatting, dedup, and reading-count bump

**Files:**
- Create: `automation/lib/library-entry.ts`
- Test: `automation/lib/library-entry.test.ts`

**Interfaces:**
- Consumes: `BookFormat` from `automation/config.ts`.
- Produces:
  - `interface NewBook { title: string; author: string; acquired: string; format: BookFormat; cover?: string }`
  - `interface ExistingBook { title: string; author: string; format: string }`
  - `formatLibraryEntry(book: NewBook): string` — one line matching existing `data/library.ts` style, e.g. `  { title: "X", author: "Y", acquired: "2026-06-26", format: "Kindle", cover: "/images/books/x.jpg" },`. Omits `cover` when undefined.
  - `isDuplicate(book: NewBook, existing: ExistingBook[]): boolean` — case-insensitive, trimmed match on title+author+format.
  - `bumpReadingCount(pageSource: string, delta: number): string` — increments the integer in `A library of N books` in `app/reading/page.tsx` source.

- [ ] **Step 1: Write the failing test**

`automation/lib/library-entry.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatLibraryEntry, isDuplicate, bumpReadingCount } from "./library-entry";

describe("formatLibraryEntry", () => {
  it("formats an entry with a cover", () => {
    expect(
      formatLibraryEntry({
        title: "Dune", author: "Frank Herbert", acquired: "2026-06-26",
        format: "Kindle", cover: "/images/books/dune.jpg",
      }),
    ).toBe(
      '  { title: "Dune", author: "Frank Herbert", acquired: "2026-06-26", format: "Kindle", cover: "/images/books/dune.jpg" },',
    );
  });

  it("omits cover when absent", () => {
    expect(
      formatLibraryEntry({
        title: "Dune", author: "Frank Herbert", acquired: "2026-06-26", format: "Kindle",
      }),
    ).toBe(
      '  { title: "Dune", author: "Frank Herbert", acquired: "2026-06-26", format: "Kindle" },',
    );
  });

  it("escapes double quotes in title/author", () => {
    expect(
      formatLibraryEntry({
        title: 'The "Best" Book', author: "A", acquired: "2026-06-26", format: "Physical",
      }),
    ).toContain('title: "The \\"Best\\" Book"');
  });
});

describe("isDuplicate", () => {
  const existing = [{ title: "Atomic Habits", author: "James Clear", format: "Kindle" }];
  it("matches case-insensitively on title+author+format", () => {
    expect(isDuplicate(
      { title: "atomic habits", author: "JAMES CLEAR", acquired: "x", format: "Kindle" },
      existing,
    )).toBe(true);
  });
  it("treats a different format as not a duplicate", () => {
    expect(isDuplicate(
      { title: "Atomic Habits", author: "James Clear", acquired: "x", format: "Audible" },
      existing,
    )).toBe(false);
  });
});

describe("bumpReadingCount", () => {
  it("increments the library count in the page description", () => {
    const src = 'description: "A library of 167 books across Kindle, Audible, and physical shelves.",';
    expect(bumpReadingCount(src, 2)).toContain("A library of 169 books");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- automation/lib/library-entry.test.ts`
Expected: FAIL — cannot find module `./library-entry`.

- [ ] **Step 3: Implement `automation/lib/library-entry.ts`**

```ts
import type { BookFormat } from "../config";

export interface NewBook {
  title: string;
  author: string;
  acquired: string;
  format: BookFormat;
  cover?: string;
}

export interface ExistingBook {
  title: string;
  author: string;
  format: string;
}

function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function formatLibraryEntry(book: NewBook): string {
  const parts = [
    `title: ${quote(book.title)}`,
    `author: ${quote(book.author)}`,
    `acquired: ${quote(book.acquired)}`,
    `format: ${quote(book.format)}`,
  ];
  if (book.cover) parts.push(`cover: ${quote(book.cover)}`);
  return `  { ${parts.join(", ")} },`;
}

function norm(value: string): string {
  return value.trim().toLowerCase();
}

export function isDuplicate(book: NewBook, existing: ExistingBook[]): boolean {
  return existing.some(
    (e) =>
      norm(e.title) === norm(book.title) &&
      norm(e.author) === norm(book.author) &&
      norm(e.format) === norm(book.format),
  );
}

export function bumpReadingCount(pageSource: string, delta: number): string {
  return pageSource.replace(
    /A library of (\d+) books/,
    (_m, n: string) => `A library of ${Number(n) + delta} books`,
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- automation/lib/library-entry.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add automation/lib/library-entry.ts automation/lib/library-entry.test.ts
git commit -m "feat(keeper): add library entry formatting, dedup, count bump"
```

---

## Task 4: Health-state math

**Files:**
- Create: `automation/lib/health.ts`
- Test: `automation/lib/health.test.ts`

**Interfaces:**
- Produces:
  - `type LiveStatus = "active" | "stable" | "shipped" | "learned" | "acquired" | "retired" | "abandoned" | "dead";`
  - `interface HealthRecord { liveUrl: string; lastStatus: "up" | "down"; firstSeenDown: string | null; lastChecked: string }`
  - `classifyResponse(input: { ok: boolean; httpStatus?: number }): "up" | "down"` — `up` only when `ok` and status in 200–399.
  - `nextHealthState(prev: HealthRecord | undefined, check: { liveUrl: string; result: "up" | "down" }, today: string): HealthRecord` — sets/clears `firstSeenDown`.
  - `shouldAutoRetire(record: HealthRecord, currentStatus: LiveStatus, today: string, thresholdDays: number): boolean` — true when down ≥ threshold days and status is `active`/`stable`/`shipped`.

- [ ] **Step 1: Write the failing test**

`automation/lib/health.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { classifyResponse, nextHealthState, shouldAutoRetire } from "./health";

describe("classifyResponse", () => {
  it("counts 2xx/3xx as up", () => {
    expect(classifyResponse({ ok: true, httpStatus: 200 })).toBe("up");
    expect(classifyResponse({ ok: true, httpStatus: 301 })).toBe("up");
  });
  it("counts 4xx/5xx and failures as down", () => {
    expect(classifyResponse({ ok: false, httpStatus: 503 })).toBe("down");
    expect(classifyResponse({ ok: false })).toBe("down");
  });
});

describe("nextHealthState", () => {
  it("records firstSeenDown on first failure", () => {
    const next = nextHealthState(undefined, { liveUrl: "u", result: "down" }, "2026-06-26");
    expect(next.firstSeenDown).toBe("2026-06-26");
    expect(next.lastStatus).toBe("down");
  });
  it("keeps the original firstSeenDown on continued failure", () => {
    const prev = { liveUrl: "u", lastStatus: "down" as const, firstSeenDown: "2026-06-10", lastChecked: "2026-06-25" };
    const next = nextHealthState(prev, { liveUrl: "u", result: "down" }, "2026-06-26");
    expect(next.firstSeenDown).toBe("2026-06-10");
    expect(next.lastChecked).toBe("2026-06-26");
  });
  it("clears firstSeenDown when back up", () => {
    const prev = { liveUrl: "u", lastStatus: "down" as const, firstSeenDown: "2026-06-10", lastChecked: "2026-06-25" };
    const next = nextHealthState(prev, { liveUrl: "u", result: "up" }, "2026-06-26");
    expect(next.firstSeenDown).toBeNull();
    expect(next.lastStatus).toBe("up");
  });
});

describe("shouldAutoRetire", () => {
  const downSince = { liveUrl: "u", lastStatus: "down" as const, firstSeenDown: "2026-06-10", lastChecked: "2026-06-26" };
  it("retires a live-status project down >= 7 days", () => {
    expect(shouldAutoRetire(downSince, "active", "2026-06-26", 7)).toBe(true);
  });
  it("does not retire before the threshold", () => {
    expect(shouldAutoRetire({ ...downSince, firstSeenDown: "2026-06-24" }, "active", "2026-06-26", 7)).toBe(false);
  });
  it("never retires an already-terminal status", () => {
    expect(shouldAutoRetire(downSince, "dead", "2026-06-26", 7)).toBe(false);
    expect(shouldAutoRetire(downSince, "learned", "2026-06-26", 7)).toBe(false);
  });
  it("does not retire when currently up", () => {
    expect(shouldAutoRetire({ ...downSince, firstSeenDown: null }, "active", "2026-06-26", 7)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- automation/lib/health.test.ts`
Expected: FAIL — cannot find module `./health`.

- [ ] **Step 3: Implement `automation/lib/health.ts`**

```ts
export type LiveStatus =
  | "active" | "stable" | "shipped" | "learned"
  | "acquired" | "retired" | "abandoned" | "dead";

const RETIRABLE: ReadonlySet<LiveStatus> = new Set(["active", "stable", "shipped"]);

export interface HealthRecord {
  liveUrl: string;
  lastStatus: "up" | "down";
  firstSeenDown: string | null;
  lastChecked: string;
}

export function classifyResponse(input: { ok: boolean; httpStatus?: number }): "up" | "down" {
  if (input.ok && input.httpStatus !== undefined && input.httpStatus >= 200 && input.httpStatus < 400) {
    return "up";
  }
  return "down";
}

export function nextHealthState(
  prev: HealthRecord | undefined,
  check: { liveUrl: string; result: "up" | "down" },
  today: string,
): HealthRecord {
  if (check.result === "up") {
    return { liveUrl: check.liveUrl, lastStatus: "up", firstSeenDown: null, lastChecked: today };
  }
  const firstSeenDown = prev && prev.firstSeenDown ? prev.firstSeenDown : today;
  return { liveUrl: check.liveUrl, lastStatus: "down", firstSeenDown, lastChecked: today };
}

function daysBetween(fromISO: string, toISO: string): number {
  const ms = Date.parse(toISO) - Date.parse(fromISO);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function shouldAutoRetire(
  record: HealthRecord,
  currentStatus: LiveStatus,
  today: string,
  thresholdDays: number,
): boolean {
  if (!record.firstSeenDown) return false;
  if (!RETIRABLE.has(currentStatus)) return false;
  return daysBetween(record.firstSeenDown, today) >= thresholdDays;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- automation/lib/health.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add automation/lib/health.ts automation/lib/health.test.ts
git commit -m "feat(keeper): add health-state math"
```

---

## Task 5: Frontmatter field setter

**Files:**
- Create: `automation/lib/frontmatter.ts`
- Test: `automation/lib/frontmatter.test.ts`

**Interfaces:**
- Produces: `setFrontmatterField(source: string, field: string, value: string): string` — replaces the value of an existing top-level frontmatter key (handles quoted and unquoted values) inside the leading `---` block, leaving body and other keys untouched. Throws if the field is absent.

- [ ] **Step 1: Write the failing test**

`automation/lib/frontmatter.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { setFrontmatterField } from "./frontmatter";

const SRC = `---
title: "Stable Money Dashboard"
status: active
badgeTone: green
---

Body stays.
`;

describe("setFrontmatterField", () => {
  it("replaces an unquoted value", () => {
    const out = setFrontmatterField(SRC, "status", "learned");
    expect(out).toContain("status: learned");
    expect(out).not.toContain("status: active");
    expect(out).toContain("Body stays.");
    expect(out).toContain('title: "Stable Money Dashboard"');
  });

  it("only edits inside the frontmatter block", () => {
    const withBody = SRC + "\nstatus: active in body\n";
    const out = setFrontmatterField(withBody, "status", "learned");
    expect(out).toContain("status: active in body");
  });

  it("throws when the field is missing", () => {
    expect(() => setFrontmatterField(SRC, "missing", "x")).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- automation/lib/frontmatter.test.ts`
Expected: FAIL — cannot find module `./frontmatter`.

- [ ] **Step 3: Implement `automation/lib/frontmatter.ts`**

```ts
export function setFrontmatterField(source: string, field: string, value: string): string {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error("No frontmatter block found");
  const block = match[1];
  const lineRe = new RegExp(`^(${field}:\\s*).*$`, "m");
  if (!lineRe.test(block)) throw new Error(`Field not found in frontmatter: ${field}`);
  const newBlock = block.replace(lineRe, `$1${value}`);
  return source.replace(block, newBlock);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- automation/lib/frontmatter.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add automation/lib/frontmatter.ts automation/lib/frontmatter.test.ts
git commit -m "feat(keeper): add frontmatter field setter"
```

---

## Task 6: Health-check runner script

**Files:**
- Create: `automation/check-health.ts`
- Create: `automation/check-health.test.ts`

**Interfaces:**
- Consumes: `config`, `classifyResponse`, `nextHealthState`, `shouldAutoRetire`, `setFrontmatterField`.
- Produces:
  - `interface ProjectMeta { slug: string; file: string; liveUrl: string; status: LiveStatus }`
  - `readProjects(dir: string): ProjectMeta[]` — parses `content/projects/*.mdx` frontmatter (via `gray-matter`), returns only those with a `liveUrl`.
  - `probe(url: string, retries: number, timeoutMs: number): Promise<"up" | "down">` — fetches with retries/backoff; uses `classifyResponse`.
  - `runHealthCheck(opts: { projectsDir: string; stateFile: string; today: string; dryRun: boolean }): Promise<HealthReport>` where
    `interface HealthReport { checked: number; down: { slug: string; liveUrl: string }[]; autoRetired: { slug: string; file: string; from: LiveStatus }[] }`.
  - CLI entry: when run directly, calls `runHealthCheck` against `content/projects` and `data/health-state.json` with `today = new Date().toISOString().slice(0,10)` and prints the report as JSON. Supports `--dry-run` (no file writes).

**Note on testing:** `probe` performs real network I/O, so the test injects projects and stubs `probe` via a `fetchImpl` parameter rather than hitting the network. Pure decision logic is already covered in Task 4.

- [ ] **Step 1: Write the failing test**

`automation/check-health.test.ts`:
```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runHealthCheck } from "./check-health";

let dir: string;
let projectsDir: string;
let stateFile: string;

const mdx = (slug: string, status: string, url: string) => `---
title: "${slug}"
slug: "${slug}"
date: "2026-01-01"
status: ${status}
badgeTone: green
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
  writeFileSync(join(projectsDir, "beta.mdx"), mdx("beta", "active", "https://down.example"));
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
    expect(readFileSync(join(projectsDir, "beta.mdx"), "utf8")).toContain("status: learned");
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
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- automation/check-health.test.ts`
Expected: FAIL — cannot find module `./check-health`.

- [ ] **Step 3: Implement `automation/check-health.ts`**

```ts
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
type FetchImpl = (url: string) => Promise<FetchResult>;

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

const realFetch: FetchImpl = async (url) => {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    return { ok: res.ok, httpStatus: res.status };
  } catch {
    return { ok: false };
  }
};

export async function probe(url: string, retries: number, timeoutMs: number, fetchImpl: FetchImpl = realFetch): Promise<"up" | "down"> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.signal && ac.abort(), timeoutMs);
    const res = await fetchImpl(url);
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- automation/check-health.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: PASS — all suites green (config, slug, library-entry, health, frontmatter, check-health).

- [ ] **Step 6: Commit**

```bash
git add automation/check-health.ts automation/check-health.test.ts
git commit -m "feat(keeper): add health-check runner script"
```

---

## Task 7: Books agent instruction file

**Files:**
- Create: `automation/books-agent.md`

**Interfaces:**
- Consumes: `config.purchaseSources`, `config.processedLabel`, `config.coverSourcesOrder`; helpers `bookSlug`, `uniqueSlug`, `formatLibraryEntry`, `isDuplicate`, `bumpReadingCount`.
- Produces: a structured result the orchestrator reads — list of `{ title, author, format, acquired, coverFound: boolean }` plus a `missingCovers: string[]`.

This task produces a prose instruction file; there is no unit test. Verification is a structured self-review against the spec checklist (Step 2).

- [ ] **Step 1: Write `automation/books-agent.md`**

Write the file with these exact sections:

````markdown
# Sub-agent A — Books

You detect new book purchases in Gmail and add them to the website's reading library with a validated cover. You run as part of the daily Website Keeper. Work only inside the repo root.

## Inputs
- `automation/config.ts` → `purchaseSources` (Gmail queries + format), `processedLabel`, `coverSourcesOrder`.
- `data/library.ts` → existing books (for dedup).

## Steps

1. **Search Gmail.** For each source in `config.purchaseSources`, run a Gmail search using its `gmailQuery` AND `-label:website-processed` (exclude already-processed mail). Use the Google Workspace MCP Gmail tools (`search_threads`, `get_thread`).
2. **Extract** for each purchase: `title`, `author`, `acquired` (purchase date, `YYYY-MM-DD`), and `format` (from the source). For `amazon-physical` and `other-retailers`, inspect each order's line items and keep only the items that are books; ignore non-book goods.
3. **Dedup.** Load the existing `library` array. Skip any purchase where `isDuplicate({title,author,format}, existing)` is true (see `automation/lib/library-entry.ts`).
4. **Cover acquisition + validation** (per new book):
   a. Compute `slug = uniqueSlug(bookSlug(title), exists)` where `exists` checks `public/images/books/<slug>.jpg`.
   b. Query cover sources **in `coverSourcesOrder`**: Google Books API (`https://www.googleapis.com/books/v1/volumes?q=`), iTunes Search API (`https://itunes.apple.com/search?media=ebook|audiobook`), Open Library Covers (`https://covers.openlibrary.org`), then DuckDuckGo image search.
   c. Filter candidates by fuzzy-matching the returned title AND author to the purchase.
   d. **Visually inspect** the chosen image (download to a temp path and Read it). Confirm the cover's printed title/author/art matches THIS book and edition intent. Reject same-title-different-book and obvious wrong-edition images.
   e. On success, save the validated image to `public/images/books/<slug>.jpg` and set `cover: "/images/books/<slug>.jpg"`.
   f. If no source yields a validated cover, leave `cover` unset and add the title to `missingCovers`.
5. **Write library entries.** For each new book, append `formatLibraryEntry(book)` as a new line inside the `library` array in `data/library.ts` (keep the array's existing one-entry-per-line style; insert near entries of the same `format` grouping if obvious, else at the top of that format's block).
6. **Bump the count.** Apply `bumpReadingCount(pageSource, N)` to `app/reading/page.tsx` where N is the number of books added.
7. **Label processed mail.** ONLY after a book's entry is written, apply the `website-processed` Gmail label to its source thread (`label_thread`). Never label before writing — a mid-run failure must not lose a purchase.

## Output (return to orchestrator)
Return JSON:
```
{ "added": [ { "title": "...", "author": "...", "format": "Kindle", "acquired": "2026-06-26", "coverFound": true } ],
  "missingCovers": [ "Title without a cover" ] }
```

## Guardrails
- Never modify `data/shelf.ts`.
- Never invent an author; if unknown, use the source's value (may be empty string, matching existing entries).
- Do not commit; the orchestrator handles git and the PR.
````

- [ ] **Step 2: Verify against spec checklist**

Confirm the file covers every spec requirement for Sub-agent A. Tick each:
- [ ] Searches all configured sources, excludes `website-processed`.
- [ ] Physical/other-retailer line-item book filtering.
- [ ] Dedup against `library.ts`.
- [ ] Cover sources in priority order + fuzzy filter + visual confirm.
- [ ] Missing cover → entry still added + recorded for Important Note.
- [ ] Appends to `library.ts`, bumps `app/reading/page.tsx` count.
- [ ] Labels mail only after successful write.
- [ ] Returns structured result for the orchestrator.

If any item is unchecked, edit the file to cover it.

- [ ] **Step 3: Commit**

```bash
git add automation/books-agent.md
git commit -m "feat(keeper): add books sub-agent instructions"
```

---

## Task 8: Projects agent instruction file + seed health state

**Files:**
- Create: `automation/projects-agent.md`
- Create: `data/health-state.json`

**Interfaces:**
- Consumes: `automation/check-health.ts` (via `npm run keeper:health`).
- Produces: a structured result — `down: {slug, liveUrl}[]`, `autoRetired: {slug, from}[]` — that the orchestrator turns into "Important Updates" and the Project status section.

This task produces a prose instruction file plus a seeded state file. The script it wraps is already tested in Task 6.

- [ ] **Step 1: Seed `data/health-state.json` by running the checker once**

Run: `npm run keeper:health`
Expected: prints a JSON `HealthReport`; creates/updates `data/health-state.json` with one record per project that has a `liveUrl`. (If a project is currently down, that's fine — it records `firstSeenDown` as today, so the 7-day clock starts now, not retroactively.)

- [ ] **Step 2: Write `automation/projects-agent.md`**

````markdown
# Sub-agent B — Projects

You verify each project's live link and surface problems for the daily PR. The downtime math and auto-retire edits are handled by a tested script; your job is to run it and translate its report.

## Steps
1. **Run the health checker:** `npm run keeper:health`. It probes every `content/projects/*.mdx` that has a `liveUrl` (3 retries, backoff), updates `data/health-state.json`, and — for any project whose live link has been down ≥ 7 days while still holding a live status (`active`/`stable`/`shipped`) — rewrites that MDX's frontmatter to `status: learned`, `badgeTone: green`.
2. **Read the printed `HealthReport` JSON.** It has `checked`, `down[]`, and `autoRetired[]`.
3. **Translate for the orchestrator:**
   - `down[]` → "Important Updates" (currently-unreachable live links).
   - `autoRetired[]` → a Project status note: "<slug> auto-marked Learned after >7 days down."
4. Do NOT hand-edit downtime dates or statuses; only the script may. Do not commit; the orchestrator handles git and the PR.

## Output (return to orchestrator)
Return the script's report verbatim plus a one-line human summary, e.g.:
```
{ "checked": 7, "down": [ { "slug": "x", "liveUrl": "https://..." } ], "autoRetired": [ { "slug": "y", "from": "active" } ] }
```

## Guardrails
- If the checker exits non-zero, report the failure to the orchestrator; do not fabricate a report.
````

- [ ] **Step 3: Commit**

```bash
git add automation/projects-agent.md data/health-state.json
git commit -m "feat(keeper): add projects sub-agent instructions and seed health state"
```

---

## Task 9: Orchestrator instruction file + automation README

**Files:**
- Create: `automation/website-keeper.md`
- Create: `automation/README.md`

**Interfaces:**
- Consumes: `automation/books-agent.md`, `automation/projects-agent.md`, and both sub-agents' JSON results.
- Produces: at most one PR per run on branch `auto/website-update-YYYY-MM-DD`.

This task produces prose; verification is the spec checklist (Step 2) and a no-op dry run is exercised end-to-end in Task 10.

- [ ] **Step 1: Write `automation/website-keeper.md`**

````markdown
# Website Keeper — Orchestrator

You run once daily to keep chrisamattam.com current. You dispatch two isolated sub-agents, consolidate their results, and open at most ONE pull request — only if something changed.

## Procedure
1. **Sync main.** `git checkout main && git pull --ff-only`.
2. **Dispatch Sub-agent A (Books)** with `automation/books-agent.md`. Capture its JSON (`added`, `missingCovers`).
3. **Dispatch Sub-agent B (Projects)** with `automation/projects-agent.md`. Capture its JSON (`checked`, `down`, `autoRetired`).
   - The two are independent: if one fails, continue with the other and note the failure in the PR body.
4. **Decide whether to open a PR.** A PR is warranted if ANY of: `added` non-empty, `missingCovers` non-empty, `down` non-empty, `autoRetired` non-empty, OR a sub-agent failed with user-relevant info.
   - If none apply: run `git status` to confirm a clean tree, discard the seed/state-only diff with `git checkout -- data/health-state.json` ONLY if it is the sole change, and exit with no branch and no PR.
   - Note: a routine health check still updates `data/health-state.json` (lastChecked). If that file is the ONLY change, do not open a PR — leave it uncommitted/discarded so quiet days stay silent.
5. **Open the PR.**
   - `git checkout -b auto/website-update-$(date +%F)`.
   - Stage all changes (`data/library.ts`, `public/images/books/*`, `app/reading/page.tsx`, `content/projects/*.mdx`, `data/health-state.json`).
   - Commit: `chore(keeper): daily website update YYYY-MM-DD`.
   - Push and open the PR with `gh pr create` using the body template below. NEVER auto-merge.

## PR body template (top to bottom)
```
## ⚠️ Important Note
{ for each title in missingCovers: "- No cover image found for **<title>** — please add one manually." ; omit section if empty }

## ⚠️ Important Updates
{ for each d in down: "- Live link DOWN: **<slug>** (<liveUrl>)" ; omit section if empty }

## 📚 Reading updates
{ for each b in added: "- Added **<title>** — <author> (<format>)" + (b.coverFound ? " ✅ cover" : " ⚠️ no cover") ; "None" if empty }

## 🔧 Project status
- Checked {checked} live links.
{ for each r in autoRetired: "- **<slug>** auto-marked `Learned` after >7 days down (was `<from>`)." }
{ if a sub-agent failed: "- ⚠️ <agent> did not complete: <reason>." }
```

## Guardrails
- One PR per run, never auto-merged.
- If yesterday's auto PR is still open, today's branch is a separate dated branch — do not reuse or force-push it.
- Never touch `data/shelf.ts`.
````

- [ ] **Step 2: Write `automation/README.md`**

````markdown
# Website Keeper

Daily automation that (1) adds newly purchased books to the reading library with validated covers, and (2) checks project live links and auto-retires long-dead projects. Opens at most one PR per run, only on change. Never auto-merges.

## Components
- `website-keeper.md` — orchestrator (dispatches sub-agents, opens the PR).
- `books-agent.md` — Gmail → `data/library.ts` + covers.
- `projects-agent.md` — wraps `check-health.ts`.
- `config.ts` — tunables (Gmail queries, label, thresholds, retries, cover source order).
- `lib/` — tested helpers (slug, library-entry, health, frontmatter).
- `check-health.ts` — runnable health checker (`npm run keeper:health`).
- `../data/health-state.json` — per-project downtime history.

## Run the deterministic parts locally
- Tests: `npm test`
- Health check (writes state + auto-retire edits): `npm run keeper:health`
- Health check dry run: `npm run keeper:health -- --dry-run`

## Schedule it
Create a daily Claude routine (via the `/schedule` skill) whose instruction is:
"Follow automation/website-keeper.md in the chrisamattam-com repo." The routine runs as your
Claude, so it has your Google Workspace (Gmail) connector and can run git/gh.

## Tune it
Edit `automation/config.ts`:
- Add/adjust `purchaseSources` Gmail queries (sender/subject) as your retailers change.
- Change `downtimeThresholdDays`, `liveLinkRetries`, `liveLinkTimeoutMs`, or `coverSourcesOrder`.
````

- [ ] **Step 3: Verify orchestrator against spec checklist**

Confirm:
- [ ] Dispatches both sub-agents; isolates failures.
- [ ] Opens PR only on change; quiet day = no PR/branch and state-only diff discarded.
- [ ] PR body has Important Note + Important Updates pinned on top, then Reading + Project sections.
- [ ] Dated branch `auto/website-update-YYYY-MM-DD`; never auto-merge.

- [ ] **Step 4: Commit**

```bash
git add automation/website-keeper.md automation/README.md
git commit -m "feat(keeper): add orchestrator instructions and README"
```

---

## Task 10: End-to-end dry run & verification

**Files:** none created; this task verifies the assembled system.

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all suites PASS.

- [ ] **Step 2: Health checker dry run**

Run: `npm run keeper:health -- --dry-run`
Expected: prints a `HealthReport` JSON; `git status` shows NO changes to `content/projects/*.mdx` or `data/health-state.json`.

- [ ] **Step 3: Type-check the automation sources**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no type errors introduced by `automation/` files. (If `automation/` is excluded by `tsconfig`, run `npx tsc --noEmit automation/check-health.ts automation/config.ts automation/lib/*.ts` instead and confirm clean.)

- [ ] **Step 4: Build still works**

Run: `npm run build`
Expected: Next.js build succeeds (the new files are outside the app graph except `data/library.ts`/`app/reading/page.tsx`, which were only appended to).

- [ ] **Step 5: Confirm quiet-day behavior is documented and discardable**

Read `automation/website-keeper.md` step 4. Confirm it discards a state-only diff and exits without a PR. No code change; this is a final sanity read.

- [ ] **Step 6: Commit any incidental fixes**

```bash
git add -A
git commit -m "chore(keeper): end-to-end verification fixes" || echo "nothing to commit"
```

---

## Manual step after implementation (not a code task)

Schedule the routine yourself with the `/schedule` skill (it is user-triggered and billed):
a daily cloud agent whose prompt is *"Follow `automation/website-keeper.md` in the
chrisamattam-com repo."* This is intentionally not automated by the plan because scheduling
runs as your Claude with your Gmail connector and your billing.

---

## Self-Review

**Spec coverage:**
- Runtime = scheduled Claude agent → Task 9 README "Schedule it" + manual step. ✓
- Book sources (Kindle/Audible/physical/other) → `config.purchaseSources` (Task 1), books-agent (Task 7). ✓
- Dedup via `website-processed` label + title/author/format → Task 3 `isDuplicate`, Task 7 steps 1,3,7. ✓
- Cover sources in order + fuzzy + visual confirm → Task 7 step 4. ✓
- Missing cover → entry added + Important Note → Task 7 step 4f, Task 9 PR template. ✓
- Append to `library.ts` + bump count → Task 3 + Task 7 steps 5–6. ✓
- Health state file → Task 4 types, Task 6 persistence, Task 8 seed. ✓
- Live-link down → Important Updates → Task 6 report, Task 9 template. ✓
- Down >7d + stale status → auto `Learned`/green → Task 4 `shouldAutoRetire`, Task 5 setter, Task 6 application. ✓
- One combined PR, callouts pinned, never auto-merge, quiet day silent → Task 9. ✓
- Failure isolation → Task 9 step 3, PR template failure line. ✓
- Don't touch shelf.ts → Global Constraints + guardrails in Tasks 7,9. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code; prose files are fully written. ✓

**Type consistency:** `BookFormat` defined in `config.ts`, reused in `library-entry.ts`. `HealthRecord`/`LiveStatus` defined in `health.ts`, consumed in `check-health.ts`. `HealthReport` defined and used consistently. `bookSlug`/`uniqueSlug`/`formatLibraryEntry`/`isDuplicate`/`bumpReadingCount`/`setFrontmatterField`/`classifyResponse`/`nextHealthState`/`shouldAutoRetire`/`readProjects`/`probe`/`runHealthCheck` names match across definition and use. ✓

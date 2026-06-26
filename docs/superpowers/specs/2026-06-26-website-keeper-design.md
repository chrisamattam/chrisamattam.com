# Website Keeper — Design Spec

**Date:** 2026-06-26
**Status:** Approved, pending implementation plan

## Purpose

A daily automation that keeps the personal website (`chrisamattam.com`, Next.js + Contentlayer)
up to date without manual effort. It runs once per day, performs two independent maintenance
jobs, and opens **at most one** pull request per run — only when there is an actual change to
propose. On a quiet day it makes no PR and leaves no branch.

The two jobs:

1. **Books** — detect new book purchases in Gmail, add them to the reading library with a
   validated cover image.
2. **Projects** — check that each project's live link is healthy, surface outages, and
   auto-retire long-dead projects.

## Architecture & Runtime

A single **scheduled Claude agent** (cloud routine via `/schedule`) fires once daily. It acts
as the **orchestrator**: it loads a checked-in instruction file, dispatches **two sub-agents**
that work independently, collects their results, and decides whether to open one combined PR.

```
Daily trigger (scheduled routine)
        │
        ▼
   Orchestrator  (automation/website-keeper.md)
   ├─► Sub-agent A: Books     (Gmail → library.ts + covers)
   ├─► Sub-agent B: Projects  (liveUrl health → status/PR flags)
        │
        ▼
   Consolidate → if any change: one PR on a dated branch; else exit quietly
```

Design principles:

- Everything the agents need (instructions, config, state) lives **in the repo**, so the
  routine is self-contained and versioned.
- **No external secrets.** Gmail access comes through the user's Claude Google Workspace MCP
  connector (the routine runs as the user's Claude). GitHub operations use `gh`.
- The two sub-agents are **isolated**: a failure in one does not block the other.

### Why a scheduled Claude agent (not GitHub Actions / Vercel Cron)

The Gmail connector is the user's Claude.ai Google Workspace MCP, tied to the user's Claude —
not to an arbitrary server. A scheduled Claude routine natively has that connector plus the
ability to run `git`/`gh` and to visually inspect candidate cover images (multimodal). CI-based
runtimes would require a separate Gmail OAuth/service account and an LLM API key, and serverless
time limits make multimodal cover validation awkward.

## Files

### New files

| Path | Purpose |
|---|---|
| `automation/website-keeper.md` | Orchestrator instructions loaded each run. |
| `automation/books-agent.md` | Sub-agent A instructions. |
| `automation/projects-agent.md` | Sub-agent B instructions. |
| `automation/config.ts` | Tunables (see below). |
| `data/health-state.json` | Per-project live-link health history. |

### Edited existing files

| Path | When edited |
|---|---|
| `data/library.ts` | Append new book entries. |
| `public/images/books/<slug>.jpg` | New validated cover images. |
| `content/projects/*.mdx` | Status changes (auto-retire to `learned`). |
| `app/reading/page.tsx` | Bump the hardcoded book count in the page description. |

### `automation/config.ts` — tunables

- Gmail sender/subject patterns per source (Amazon Kindle, Audible, Amazon physical orders,
  other retailers).
- Source → format map (`Kindle` / `Audible` / `Physical`).
- Processed-label name: `website-processed`.
- Downtime threshold: `7` days.
- Live-link retry count: `3` (with backoff).

### `data/health-state.json` — shape

Keyed by project slug:

```json
{
  "stable-money-dashboard": {
    "liveUrl": "https://stable-money-pm-dashboard.vercel.app",
    "lastStatus": "up",
    "firstSeenDown": null,
    "lastChecked": "2026-06-26"
  }
}
```

## Sub-agent A — Books

1. **Find purchases:** search Gmail for configured senders/subjects, **excluding** anything
   carrying the `website-processed` label.
2. **Extract** title, author, format (by source), purchase date. For physical Amazon orders,
   identify which line items are books (orders mix books with other goods).
3. **Dedup** against `library.ts` by `title` + `author` + `format`.
4. **Cover acquisition + validation** (required):
   - Query sources in priority order: Google Books API → iTunes Search API →
     Open Library Covers → DuckDuckGo Image Search.
   - Fuzzy-match returned title/author to filter candidates.
   - **Visually inspect** the chosen image to confirm the cover's text/art matches the book
     before saving. This catches wrong-edition and same-title-different-book covers.
   - Save to `public/images/books/<slug>.jpg`, where `<slug>` follows the existing kebab
     convention used throughout `library.ts` (lowercase, hyphenated, apostrophes → `-`,
     truncated to the same length as existing entries).
5. **No cover found →** still add the book entry (omit the `cover` field) and record the title
   for the **"Important Note"** pinned at the top of the PR.
6. **Write:** append entries to `library.ts`, bump the count in `app/reading/page.tsx`, and
   apply the `website-processed` Gmail label to each processed email — **only after** the book
   is successfully written, so a mid-run failure never loses a purchase.

New purchases go to `data/library.ts` (the acquisitions library rendered by `/reading`) only.
The manual "currently reading" list in `data/shelf.ts` is **not** touched — buying a book is
not the same as starting to read it.

## Sub-agent B — Projects

1. For each project MDX with a `liveUrl`, fetch it with retries (default 3, backoff) to avoid
   transient blips. **"Down"** = non-2xx/3xx response, connection failure, or timeout on **all**
   retries.
2. **Update `health-state.json`:** if up, clear `firstSeenDown`; if down, set `firstSeenDown` on
   the first failure and leave it unchanged on subsequent failures. Always update `lastChecked`.
3. **Currently down →** list under **"Important Updates"** in the PR.
4. **Down > 7 days AND status still "live"** (`active` / `stable` / `shipped`) → auto-set
   `status: learned` and `badgeTone: green` in the MDX frontmatter. Already-terminal statuses
   (`retired` / `abandoned` / `dead` / `acquired` / `learned`) are left untouched.

## PR & Consolidation

- The orchestrator opens **one combined PR** only if there is a change, on branch
  `auto/website-update-YYYY-MM-DD`.
- PR body layout, top to bottom:
  1. **Important Note** — books added without a cover.
  2. **Important Updates** — projects whose live link is currently down.
  3. **📚 Reading updates** — books added (with/without cover).
  4. **🔧 Project status** — health summary and any auto-retire status changes.
- **Never auto-merged.** Always left for the user's review.
- If yesterday's auto-PR is still open, today's run targets a fresh dated branch (a separate
  PR); branches do not collide.
- **Quiet day** (no new books, all links up, no stale statuses) → no PR, no branch, no noise.

## Failure Handling

- Each sub-agent is isolated: if the books agent errors (e.g., a Gmail hiccup), the projects
  agent still runs, and vice-versa.
- Partial results still produce a PR for whatever succeeded; failures are reported in the PR
  body rather than silently dropped.
- The `website-processed` label is applied only after a book is successfully written.

## Decisions Locked In

- **Runtime:** scheduled Claude agent.
- **Book sources:** Kindle, Audible, physical (Amazon), other retailers — configurable.
- **Dedup:** Gmail `website-processed` label + title/author/format match against `library.ts`.
- **Cover validation:** metadata fuzzy-match + visual confirmation.
- **Health state:** committed `data/health-state.json`.
- **PR structure:** one combined PR per run.
- **Never auto-merge.**
- **"Down"** = non-2xx/3xx or timeout on all 3 retries.
- **7-day threshold** counted from `firstSeenDown`.

## Out of Scope (YAGNI)

- Editing `data/shelf.ts` "currently reading" / "listening" lists.
- Auto-merging PRs.
- Notifications beyond GitHub's native PR email.
- External state stores (Gist/KV).
- Reconstructing health history from git/PR archaeology.

# chrisamattam.com

Personal portfolio — Next.js 16 (App Router) · TypeScript · Contentlayer MDX · Tailwind v4 · Vercel.

Live at **[chrisamattam.com](https://chrisamattam.com)**.

---

## What makes this different

The site maintains itself. Three autonomous agents run on a daily schedule and keep content current — books, project statuses, and running data — without manual edits. A fourth agent powers a real-time AI chatbot that answers questions about the site and the work behind it.

All agents follow one design rule: **judgment work lives in Markdown instruction files; correctness-critical logic lives in tested TypeScript**. The agent reads prose instructions at runtime; the TypeScript CLI handles the atomic write and never breaks.

---

## Agents

### 1 · Website Keeper — Orchestrator
`automation/website-keeper.md`

A Claude Code cloud routine that runs daily. It dispatches the three sub-agents below in sequence, consolidates their results, and opens **at most one PR** — only when something actually changed. It never auto-merges.

---

### 2 · Books Agent
`automation/books-agent.md` · writes to `data/library.ts`

**Trigger:** daily, dispatched by the Keeper.

**What it does:**
1. Searches Gmail (via Google Workspace MCP) for book purchase receipts — Kindle, Audible, Amazon physical, other retailers.
2. Deduplicates against the existing library using `automation/lib/library-entry.ts`.
3. Finds and visually validates a cover image (Google Books → iTunes → Open Library → DuckDuckGo).
4. Writes the new entry via `automation/add-book.ts` — a deterministic CLI that inserts the correctly-escaped entry into `data/library.ts` and bumps the count in `app/reading/page.tsx` atomically.
5. Labels the Gmail thread `website-processed` only after a successful write.

**Output to orchestrator:** `{ added[], missingCovers[] }`

---

### 3 · Projects Agent
`automation/projects-agent.md` · writes to `data/health-state.json` + `content/projects/*.mdx`

**Trigger:** daily, dispatched by the Keeper.

**What it does:**
1. Lists all project live URLs with `npx tsx automation/check-health.ts --list` (no network — just reads the MDX frontmatter).
2. Checks each URL with `curl` (not Node `fetch` — the cloud sandbox proxy only passes `curl`).
3. Feeds the up/down results to `npx tsx automation/check-health.ts --apply results.json`, which updates `data/health-state.json` and auto-retires any project that has been down for more than 7 days (sets `status: learned`).
4. **Safety valve:** if every link reports down, nothing is written — a network failure in the runner cannot trigger a false mass-retirement.

**Output to orchestrator:** `{ checked, down[], autoRetired[] }`

---

### 4 · Running Agent
`automation/running-agent.md` · writes to `data/runs.ts`

**Trigger:** daily, dispatched by the Keeper (acts on the first of each month).

**What it does:**
1. Searches Google Drive (via Drive MCP) for the latest Google Takeout zip export from the previous calendar month.
2. Downloads the zip and extracts Google Fit session JSON files (`Takeout/Fit/All Sessions/`).
3. Filters sessions by activity type (7 = Running, 8 = Treadmill) and by the target month.
4. Computes the `MonthSummary`: total distance, median pace, run count, total time, and individual run rows — using tested helpers in `automation/lib/run-entry.ts`.
5. Writes the result via `automation/add-run.ts` — a deterministic CLI that appends the new month to `data/runs.ts` sorted chronologically, with a dedup guard.

**Setup required (once):** configure Google Takeout at takeout.google.com to export Fit data monthly to Google Drive.

**Output to orchestrator:** `{ added: MonthSummary | null, skipped, reason? }`

---

### 5 · AI Chatbot
`app/api/chat/route.ts` · `lib/chatPrompt.ts` · `lib/llm.ts`

**Trigger:** real-time, on every user message at `/chat`.

**What it does:**
1. At build time, `automation/compile-knowledge.ts` (run via `prebuild`) compiles all site content — projects, posts, reading list, timeline — into a single `data/site-knowledge.md` document (~3K tokens).
2. On each chat turn, the full knowledge document is injected into the LLM system prompt (no RAG — the corpus is small enough to fit in context).
3. The route streams a response from Cerebras (`gpt-oss-120b`) using the OpenAI-compatible SDK.
4. Server-side guards: 6 messages/minute rate limit, 20-turn session cap, fails closed if the knowledge file is missing.

The LLM provider and model are configurable via `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL` environment variables.

---

## Local development

```bash
npm run dev          # dev server (webpack) at localhost:3000
npm test             # vitest — automation helpers only
npm run keeper:health          # run health check locally
npm run keeper:health -- --dry-run  # dry run (no writes)
npm run compile-knowledge      # regenerate chatbot knowledge base
```

Build is pinned to **webpack** (`--webpack` in `vercel.json`) — do not switch to Turbopack.

## Deployment

Merges to `main` auto-deploy via the Vercel GitHub App. Manual deploy: `vercel --prod` from the repo root.

Environment variables required in `.env.local` (never committed):
- `LLM_API_KEY` — API key for the chatbot's LLM provider
- `LLM_BASE_URL` — provider base URL (defaults to Cerebras)
- `LLM_MODEL` — model name (defaults to `gpt-oss-120b`)

---

## Repo structure

```
app/              → Next.js pages and API routes
automation/       → agent instruction files + deterministic CLIs + tested helpers
  books-agent.md      ← Sub-agent A instructions (judgment)
  projects-agent.md   ← Sub-agent B instructions (judgment)
  running-agent.md    ← Sub-agent C instructions (judgment)
  website-keeper.md   ← Orchestrator instructions
  add-book.ts         ← Tested CLI: writes to data/library.ts
  add-run.ts          ← Tested CLI: writes to data/runs.ts
  check-health.ts     ← Tested CLI: --list and --apply modes
  compile-knowledge.ts← Builds chatbot knowledge base (runs at build time)
  lib/                ← Pure, unit-tested helper functions
  config.ts           ← Tunables: Gmail queries, thresholds, Takeout config
components/       → shared React components
content/          → MDX files (projects, posts, hikes, milestones)
data/             → typed data arrays (library, runs, journey, shelf, health-state)
lib/              → chatbot client (llm, chatPrompt, knowledge)
public/           → static assets (book covers, images)
```

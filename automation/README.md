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

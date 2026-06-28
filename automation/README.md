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

### Link checking in the cloud
The cloud sandbox blocks the Node script's outbound `fetch` (npm/GitHub egress works,
arbitrary sites don't), so `npm run keeper:health`'s built-in probe reports every link
as "down" there. In the cloud the projects agent instead:
1. `npx tsx automation/check-health.ts --list` — emit projects + live URLs (no network).
2. Check each URL with the **WebFetch tool** (which can reach public URLs).
3. `npx tsx automation/check-health.ts --apply <results.json>` — feed the up/down map
   (`{slug: "up"|"down"}`) into the tested state/auto-retire logic.

Safety valve: if **every** checked link is down, the apply step writes nothing and returns
`skippedAllDown` — a runner-network failure can never trigger a false mass auto-retire.

## Schedule it
Create a daily Claude routine (via the `/schedule` skill) whose instruction is:
"Follow automation/website-keeper.md in the chrisamattam-com repo." The routine runs as your
Claude, so it has your Google Workspace (Gmail) connector and can run git/gh.

## Tune it
Edit `automation/config.ts`:
- Add/adjust `purchaseSources` Gmail queries (sender/subject) as your retailers change.
- Change `downtimeThresholdDays`, `liveLinkRetries`, `liveLinkTimeoutMs`, or `coverSourcesOrder`.

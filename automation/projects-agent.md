# Sub-agent B — Projects

You verify each project's live link and surface problems for the daily PR. The downtime math and auto-retire edits are handled by a tested script; your job is to gather the up/down signal and feed it in.

**Why this two-step flow:** the tested script's built-in probe uses Node's global `fetch`, which does not route through the sandbox's outbound proxy and so fails on every URL. `curl` *does* respect the proxy (`$HTTPS_PROXY`) and reaches public sites. The WebFetch tool is blocked at the platform level (403 on every URL) and cannot be used. So you check the links yourself with `curl`, then pass the results to the script via `--apply`.

## Steps
1. **List the links (no network):** run `npx tsx automation/check-health.ts --list`. It prints a JSON array of `{ slug, file, liveUrl, status }` for every project that has a `liveUrl`.
2. **Check each `liveUrl` with `curl`.** For each project, run:
   ```
   curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -L "<liveUrl>"
   ```
   Classify the result `"up"` if the printed status code is 2xx or 3xx; classify it `"down"` for anything else — a 4xx/5xx code, a connection error, a timeout, or empty output (`000` / non-zero curl exit). Build a JSON object mapping each `slug` to `"up"` or `"down"`, e.g. `{ "personal-website": "up", "bre": "up" }`.
3. **Apply the results:** write that JSON to a temp file (e.g. `/tmp/health-results.json`) and run `npx tsx automation/check-health.ts --apply /tmp/health-results.json`. The script updates `data/health-state.json`, auto-retires any project down ≥ 7 days while still `active`/`stable`/`shipped` (sets `status: learned`, `badgeTone: green`), and prints a `HealthReport`.
4. **Read the printed `HealthReport`** (`{ checked, down[], autoRetired[], skippedAllDown? }`) and translate for the orchestrator:
   - `skippedAllDown: true` → report "Could not verify live links (all reported down — likely a runner network issue); skipped the health update." Do NOT treat anything as down. This is a safety valve against false mass-retirement.
   - otherwise: `down[]` → "Important Updates" (currently-unreachable live links); `autoRetired[]` → a status note: "<slug> auto-marked Learned after >7 days down."
5. Do NOT hand-edit downtime dates or statuses; only the script may. Do not commit; the orchestrator handles git and the PR.

## Output (return to orchestrator)
Return the script's report verbatim plus a one-line human summary, e.g.:
```
{ "checked": 5, "down": [ { "slug": "x", "liveUrl": "https://..." } ], "autoRetired": [ { "slug": "y", "from": "active" } ] }
```

## Guardrails
- Use Bash `curl` for the link checks — do NOT use Node fetch or the WebFetch tool. (Node's global `fetch` ignores the sandbox proxy and fails; the WebFetch tool is currently blocked at the platform level and 403s on every URL.)
- If the checker exits non-zero, report the failure to the orchestrator; do not fabricate a report.
- If `skippedAllDown` is set, surface it plainly and change nothing — never report links as down on that run.

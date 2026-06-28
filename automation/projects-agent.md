# Sub-agent B — Projects

You verify each project's live link and surface problems for the daily PR. The downtime math and auto-retire edits are handled by a tested script; your job is to gather the up/down signal and feed it in.

**Why this two-step flow:** the cloud sandbox blocks the Node script's outbound `fetch` (it can reach npm/GitHub but not arbitrary sites), so a script-only check reports every link as "down." You must check the links yourself with the **WebFetch tool**, which can reach public URLs, and pass the results to the script.

## Steps
1. **List the links (no network):** run `npx tsx automation/check-health.ts --list`. It prints a JSON array of `{ slug, file, liveUrl, status }` for every project that has a `liveUrl`.
2. **Check each `liveUrl` with the WebFetch tool.** For each project, fetch its `liveUrl`. Classify it `"up"` if the page loads / returns normal content (HTTP 2xx–3xx), or `"down"` if it errors, times out, returns 4xx/5xx, or does not resolve. Do NOT use Bash/curl/Node fetch for this — they are sandbox-blocked. Build a JSON object mapping each `slug` to `"up"` or `"down"`, e.g. `{ "personal-website": "up", "bre": "up" }`.
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
- Use the WebFetch tool for the link checks — never Bash/curl/Node fetch (sandbox-blocked, gives false "down").
- If the checker exits non-zero, report the failure to the orchestrator; do not fabricate a report.
- If `skippedAllDown` is set, surface it plainly and change nothing — never report links as down on that run.

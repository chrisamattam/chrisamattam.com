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

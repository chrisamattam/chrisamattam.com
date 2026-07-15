# Sub-agent C — Running

You detect new monthly running data from Google Health Takeout exports stored in Google Drive and add them to the website's running log. You run as part of the daily Website Keeper. Work only inside the repo root.

## Inputs
- `automation/config.ts` → `takeout` block (Drive search query, maxAgeDays, fit activity types).
- `data/runs.ts` → existing months (for dedup — the CLI handles this, but you can check upfront to skip unnecessary Drive access).

## Steps

1. **Find the latest Takeout export in Google Drive.**
   Use `mcp__claude_ai_Google_Drive__search_files` with the query from `config.takeout.driveSearchQuery` (searches for files whose name contains "Takeout" with zip mime type). Sort by `createdTime` descending and take the most recent result.
   - If no file found, or the most recent file is older than `config.takeout.maxAgeDays` days, return early with `{ added: null, reason: "no-takeout-found" }`.

2. **Download the Takeout zip.**
   Use `mcp__claude_ai_Google_Drive__download_file_content` with the file's Drive ID. Save to `/tmp/takeout-latest.zip`.

3. **Extract and locate activity files.**
   ```bash
   mkdir -p /tmp/takeout-extract && unzip -o /tmp/takeout-latest.zip -d /tmp/takeout-extract
   find /tmp/takeout-extract -type f -name "*.json" | grep -i "Fit\|Activities\|Sessions"
   ```
   The relevant files are typically in `Takeout/Fit/All Sessions/` or `Takeout/Fit/Activities/`. Each JSON file represents one workout session.

4. **Identify the target month.**
   You are processing the **previous calendar month** from today. (e.g. if today is 15 July 2026, target is "June 2026".)

5. **Parse and filter runs for the target month.**
   Read the session JSON files. For each session:
   - Check the activity type. Keep only Running (type 7) and Treadmill Running (type 8) — see `config.takeout.fitActivityTypeRun`.
   - Parse the `startTime` field and filter to sessions that fall within the target month.
   - Extract per-run values. The exact field names vary by export version — inspect a sample file first and adapt:
     - **Distance**: look for `distance` (metres), `totalDistance`, or nested data point values
     - **Active duration**: look for `activeTime` (ms), `duration` (ms or sec), or the diff between `endTime` and `startTime` as fallback
     - **Speed/Pace**: look for `averageSpeed` (m/s → convert to sec/km: `1000 / speed`), or `averagePace` (sec/km directly)
     - **Date**: `startTime` → `YYYY-MM-DD` in local time (India: +05:30)

   Use the helper functions from `automation/lib/run-entry.ts` for conversions:
   - `secPerKmToMmSs(secPerKm)` — raw sec/km → "M:SS"
   - `msToHhMmSs(ms)` — ms → "H:MM:SS" or "MM:SS"
   - `secToHhMmSs(sec)` — raw seconds → "H:MM:SS"
   - `medianPaceStr(secPerKmValues[])` — compute median pace across all runs

6. **Compute the MonthSummary.**
   From all filtered runs:
   - `totalDistanceKm`: sum of all `distanceKm` values, rounded to 2 decimal places
   - `runCount`: count of runs
   - `medianPace`: `medianPaceStr([...all raw sec/km values])` — use the helper
   - `totalTime`: `msToHhMmSs(sum of all activeTime values in ms)` — use the helper
   - `runs[]`: array of individual Run objects sorted by date ascending

7. **Write the data** using the deterministic CLI — do NOT hand-edit `data/runs.ts`. Run:
   ```bash
   npx tsx automation/add-run.ts --month-json '<JSON string of MonthSummary>'
   ```
   Read the printed JSON `{ status, month }`. If `status` is `"skipped-duplicate"`, no write was needed.

8. **Clean up temp files.**
   ```bash
   rm -rf /tmp/takeout-latest.zip /tmp/takeout-extract
   ```

## Output (return to orchestrator)
Return JSON:
```
{
  "added": { "month": "June 2026", "runCount": 5, "totalDistanceKm": 29.74 } | null,
  "skipped": false,
  "reason": "no-takeout-found" | null
}
```
- `added`: the summary of what was written, or `null` if nothing was added
- `skipped`: `true` if the CLI returned `skipped-duplicate`
- `reason`: only set when `added` is null; explains why nothing was added

## Guardrails
- Never hand-edit `data/runs.ts` — only write via `add-run.ts`.
- Only process the previous calendar month — do not backfill older months in a routine run.
- If fewer than 100m of distance is recorded for a session, skip it (GPS artifact, not a real run).
- Do not commit; the orchestrator handles git and the PR.
- If the Takeout JSON format is unrecognisable (no sessions match any known field names), return `{ added: null, reason: "unrecognised-format" }` rather than guessing.

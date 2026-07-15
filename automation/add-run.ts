import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MonthSummary } from "../data/runs";
import {
  isDuplicateMonth,
  formatRunEntry,
  parseMonthDate,
} from "./lib/run-entry";

export interface AddRunOpts {
  summary: MonthSummary;
  runsFile?: string;   // default: data/runs.ts
}

export interface AddRunResult {
  status: "added" | "skipped-duplicate";
  month: string;
}

export function addRun(opts: AddRunOpts): AddRunResult {
  const runsFile = opts.runsFile ?? join(process.cwd(), "data/runs.ts");
  const { summary } = opts;

  // Load current runsByMonth for dedup check
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { runsByMonth } = require("../data/runs") as { runsByMonth: MonthSummary[] };

  if (isDuplicateMonth(summary.month, runsByMonth)) {
    return { status: "skipped-duplicate", month: summary.month };
  }

  // Build the updated array (existing + new), sorted chronologically
  const allMonths = [...runsByMonth, summary].sort(
    (a, b) => parseMonthDate(a.month).getTime() - parseMonthDate(b.month).getTime(),
  );

  // Find the insertion point: the new entry's position in the sorted array
  const newIdx = allMonths.findIndex((m) => m.month === summary.month);
  const entryStr = formatRunEntry(summary);

  let fileText = readFileSync(runsFile, "utf8");

  if (newIdx === allMonths.length - 1) {
    // New entry goes at the end — insert before closing ];
    const closingIdx = fileText.lastIndexOf("];");
    if (closingIdx === -1) throw new Error("Cannot find closing ]; in runs file");
    fileText =
      fileText.slice(0, closingIdx) +
      entryStr +
      "\n" +
      fileText.slice(closingIdx);
  } else {
    // New entry goes before an existing entry — find the neighbour's month string
    const nextMonth = allMonths[newIdx + 1].month;
    // Find the line containing `month: "nextMonth"` and insert before it
    const marker = `  {\n    month: "${nextMonth}"`;
    const markerIdx = fileText.indexOf(marker);
    if (markerIdx === -1) {
      throw new Error(`Cannot locate insertion point before month "${nextMonth}" in runs file`);
    }
    fileText =
      fileText.slice(0, markerIdx) +
      entryStr +
      "\n" +
      fileText.slice(markerIdx);
  }

  writeFileSync(runsFile, fileText);
  return { status: "added", month: summary.month };
}

// CLI entry point
if (process.argv[1] && process.argv[1].endsWith("add-run.ts")) {
  const args = process.argv.slice(2);
  function getArg(name: string): string | undefined {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : undefined;
  }

  const monthJson = getArg("month-json");

  if (!monthJson) {
    console.error(
      "Usage: npx tsx automation/add-run.ts --month-json '<MonthSummary JSON>'",
    );
    process.exit(1);
  }

  let summary: MonthSummary;
  try {
    summary = JSON.parse(monthJson) as MonthSummary;
  } catch {
    console.error("Error: --month-json is not valid JSON");
    process.exit(1);
  }

  // Basic validation
  if (!summary.month || typeof summary.totalDistanceKm !== "number" || !Array.isArray(summary.runs)) {
    console.error("Error: --month-json must be a valid MonthSummary object");
    process.exit(1);
  }

  const result = addRun({ summary });
  console.log(JSON.stringify(result, null, 2));
}

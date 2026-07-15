import type { Run, MonthSummary } from "../../data/runs";

/** Convert raw seconds-per-km to "M:SS" string. e.g. 407 → "6:47" */
export function secPerKmToMmSs(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Convert milliseconds to "H:MM:SS" (or "MM:SS" when < 1 hr). e.g. 3661000 → "1:01:01" */
export function msToHhMmSs(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Convert raw seconds to "H:MM:SS" or "MM:SS". Convenience wrapper over msToHhMmSs. */
export function secToHhMmSs(sec: number): string {
  return msToHhMmSs(sec * 1000);
}

/** Compute median from an array of raw sec/km values and return as "M:SS". */
export function medianPaceStr(secPerKmValues: number[]): string {
  if (secPerKmValues.length === 0) throw new Error("Empty pace array");
  const sorted = [...secPerKmValues].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  return secPerKmToMmSs(median);
}

/** Parse "June 2026" → Date (for chronological sorting of months). */
export function parseMonthDate(month: string): Date {
  return new Date(month + " 1");
}

/**
 * Check whether a MonthSummary for the given month already exists.
 * Used by add-run.ts before writing.
 */
export function isDuplicateMonth(month: string, existing: MonthSummary[]): boolean {
  return existing.some((m) => m.month.trim().toLowerCase() === month.trim().toLowerCase());
}

/**
 * Format a MonthSummary as a TypeScript object literal for insertion into data/runs.ts.
 * Matches the indentation style already used in that file.
 */
export function formatRunEntry(summary: MonthSummary): string {
  const runsLines = summary.runs.map(
    (r: Run) =>
      `      { date: "${r.date}", distanceKm: ${r.distanceKm}, paceMinPerKm: "${r.paceMinPerKm}", durationMmSs: "${r.durationMmSs}" },`,
  );

  return [
    `  {`,
    `    month: "${summary.month}",`,
    `    totalDistanceKm: ${summary.totalDistanceKm},`,
    `    medianPace: "${summary.medianPace}",`,
    `    runCount: ${summary.runCount},`,
    `    totalTime: "${summary.totalTime}",`,
    `    runs: [`,
    ...runsLines,
    `    ],`,
    `  },`,
  ].join("\n");
}

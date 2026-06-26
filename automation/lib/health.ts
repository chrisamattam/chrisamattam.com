export type LiveStatus =
  | "active" | "stable" | "shipped" | "learned"
  | "acquired" | "retired" | "abandoned" | "dead";

const RETIRABLE: ReadonlySet<LiveStatus> = new Set(["active", "stable", "shipped"]);

export interface HealthRecord {
  liveUrl: string;
  lastStatus: "up" | "down";
  firstSeenDown: string | null;
  lastChecked: string;
}

export function classifyResponse(input: { ok: boolean; httpStatus?: number }): "up" | "down" {
  if (input.ok && input.httpStatus !== undefined && input.httpStatus >= 200 && input.httpStatus < 400) {
    return "up";
  }
  return "down";
}

export function nextHealthState(
  prev: HealthRecord | undefined,
  check: { liveUrl: string; result: "up" | "down" },
  today: string,
): HealthRecord {
  if (check.result === "up") {
    return { liveUrl: check.liveUrl, lastStatus: "up", firstSeenDown: null, lastChecked: today };
  }
  const firstSeenDown = prev && prev.firstSeenDown ? prev.firstSeenDown : today;
  return { liveUrl: check.liveUrl, lastStatus: "down", firstSeenDown, lastChecked: today };
}

function daysBetween(fromISO: string, toISO: string): number {
  const ms = Date.parse(toISO) - Date.parse(fromISO);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function shouldAutoRetire(
  record: HealthRecord,
  currentStatus: LiveStatus,
  today: string,
  thresholdDays: number,
): boolean {
  if (!record.firstSeenDown) return false;
  if (!RETIRABLE.has(currentStatus)) return false;
  return daysBetween(record.firstSeenDown, today) >= thresholdDays;
}

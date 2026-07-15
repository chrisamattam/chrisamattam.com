import { describe, it, expect } from "vitest";
import {
  secPerKmToMmSs,
  msToHhMmSs,
  secToHhMmSs,
  medianPaceStr,
  isDuplicateMonth,
  formatRunEntry,
  parseMonthDate,
} from "./run-entry";

describe("secPerKmToMmSs", () => {
  it("converts whole minutes", () => {
    expect(secPerKmToMmSs(360)).toBe("6:00");
  });
  it("pads seconds to two digits", () => {
    expect(secPerKmToMmSs(367)).toBe("6:07");
  });
  it("rounds fractional seconds", () => {
    expect(secPerKmToMmSs(407.6)).toBe("6:48");
  });
  it("handles sub-6-minute pace", () => {
    expect(secPerKmToMmSs(363)).toBe("6:03");
  });
  it("handles slow pace over 10 min", () => {
    expect(secPerKmToMmSs(630)).toBe("10:30");
  });
});

describe("msToHhMmSs", () => {
  it("formats under 1 hour as MM:SS", () => {
    expect(msToHhMmSs(24 * 60 * 1000 + 14 * 1000)).toBe("24:14");
  });
  it("formats exactly 1 hour", () => {
    expect(msToHhMmSs(3600 * 1000)).toBe("1:00:00");
  });
  it("formats over 1 hour with padded minutes and seconds", () => {
    expect(msToHhMmSs((1 * 3600 + 17 * 60 + 42) * 1000)).toBe("1:17:42");
  });
  it("pads minutes and seconds with zeros when < 10", () => {
    expect(msToHhMmSs((2 * 3600 + 1 * 60 + 5) * 1000)).toBe("2:01:05");
  });
});

describe("secToHhMmSs", () => {
  it("is equivalent to msToHhMmSs with *1000", () => {
    expect(secToHhMmSs(1454)).toBe(msToHhMmSs(1454 * 1000));
  });
});

describe("medianPaceStr", () => {
  it("returns the middle value for odd-length arrays", () => {
    // sorted: [363, 407, 451] → median = 407 → "6:47"
    expect(medianPaceStr([407, 363, 451])).toBe("6:47");
  });
  it("returns average of two middle values for even-length arrays", () => {
    // sorted: [360, 400] → median = 380 → "6:20"
    expect(medianPaceStr([400, 360])).toBe("6:20");
  });
  it("handles single element", () => {
    expect(medianPaceStr([407])).toBe("6:47");
  });
  it("throws on empty array", () => {
    expect(() => medianPaceStr([])).toThrow();
  });
});

describe("isDuplicateMonth", () => {
  const existing = [
    { month: "June 2026", totalDistanceKm: 29.74, medianPace: "6:54", runCount: 5, totalTime: "3:30:36", runs: [] },
  ];

  it("detects exact duplicate", () => {
    expect(isDuplicateMonth("June 2026", existing)).toBe(true);
  });
  it("is case-insensitive", () => {
    expect(isDuplicateMonth("june 2026", existing)).toBe(true);
  });
  it("returns false for a new month", () => {
    expect(isDuplicateMonth("July 2026", existing)).toBe(false);
  });
});

describe("formatRunEntry", () => {
  it("produces a parseable-looking TypeScript object literal", () => {
    const result = formatRunEntry({
      month: "July 2026",
      totalDistanceKm: 10.5,
      medianPace: "6:30",
      runCount: 2,
      totalTime: "1:08:15",
      runs: [
        { date: "2026-07-01", distanceKm: 5.25, paceMinPerKm: "6:30", durationMmSs: "34:08" },
      ],
    });
    expect(result).toContain('month: "July 2026"');
    expect(result).toContain("totalDistanceKm: 10.5");
    expect(result).toContain('medianPace: "6:30"');
    expect(result).toContain("runCount: 2");
    expect(result).toContain('date: "2026-07-01"');
  });
});

describe("parseMonthDate", () => {
  it("June 2026 parses before July 2026", () => {
    expect(parseMonthDate("June 2026") < parseMonthDate("July 2026")).toBe(true);
  });
  it("July 2025 parses before June 2026", () => {
    expect(parseMonthDate("July 2025") < parseMonthDate("June 2026")).toBe(true);
  });
});

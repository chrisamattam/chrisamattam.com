export type Run = {
  date: string;         // "2026-06-02"
  distanceKm: number;   // 5.01
  paceMinPerKm: string; // "6:31"  — pre-converted from sec/km
  durationMmSs: string; // "24:14" — activeDuration, pre-converted from ms
};

export type MonthSummary = {
  month: string;          // "June 2026"
  totalDistanceKm: number;
  medianPace: string;     // "6:54"
  runCount: number;
  totalTime: string;      // "3:30:36"
  runs: Run[];
};

// Agent-managed: updated monthly via Google Health takeout → AI agent → PR.
export const runsByMonth: MonthSummary[] = [
  {
    month: "July 2025",
    totalDistanceKm: 3.75,
    medianPace: "9:53",
    runCount: 1,
    totalTime: "37:06",
    runs: [
      { date: "2025-07-30", distanceKm: 3.75, paceMinPerKm: "9:53", durationMmSs: "37:06" },
    ],
  },
  {
    month: "September 2025",
    totalDistanceKm: 14.30,
    medianPace: "10:31",
    runCount: 3,
    totalTime: "2:41:44",
    runs: [
      { date: "2025-09-01", distanceKm: 6.46, paceMinPerKm: "14:12", durationMmSs: "1:31:36" },
      { date: "2025-09-13", distanceKm: 3.82, paceMinPerKm: "10:31", durationMmSs: "40:08" },
      { date: "2025-09-21", distanceKm: 4.02, paceMinPerKm: "7:27", durationMmSs: "30:00" },
    ],
  },
  {
    month: "May 2026",
    totalDistanceKm: 20.45,
    medianPace: "7:10",
    runCount: 5,
    totalTime: "2:24:31",
    runs: [
      { date: "2026-05-20", distanceKm: 1.85, paceMinPerKm: "8:03", durationMmSs: "14:56" },
      { date: "2026-05-20", distanceKm: 2.44, paceMinPerKm: "6:03", durationMmSs: "14:52" },
      { date: "2026-05-22", distanceKm: 2.46, paceMinPerKm: "7:10", durationMmSs: "17:43" },
      { date: "2026-05-26", distanceKm: 5.44, paceMinPerKm: "6:53", durationMmSs: "37:27" },
      { date: "2026-05-30", distanceKm: 8.26, paceMinPerKm: "7:12", durationMmSs: "59:33" },
    ],
  },
  {
    month: "June 2026",
    totalDistanceKm: 29.74,
    medianPace: "6:54",
    runCount: 5,
    totalTime: "3:30:36",
    runs: [
      { date: "2026-06-02", distanceKm: 3.72, paceMinPerKm: "6:31", durationMmSs: "24:14" },
      { date: "2026-06-06", distanceKm: 5.04, paceMinPerKm: "7:03", durationMmSs: "35:34" },
      { date: "2026-06-07", distanceKm: 5.65, paceMinPerKm: "6:54", durationMmSs: "39:01" },
      { date: "2026-06-10", distanceKm: 10.32, paceMinPerKm: "7:31", durationMmSs: "1:17:42" },
      { date: "2026-06-23", distanceKm: 5.01, paceMinPerKm: "6:48", durationMmSs: "34:05" },
    ],
  },
];

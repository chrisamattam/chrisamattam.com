"use client";

type StatChipProps = {
  label: string;
  value: string;
  muted?: boolean;
};

function StatChip({ label, value, muted }: StatChipProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "0.85rem 1.1rem",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-subtle)",
        minWidth: 0,
        flex: "1 1 120px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: muted ? "var(--text-muted)" : "var(--text-muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: muted ? "var(--text-secondary)" : "var(--text-primary)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

type RunStatsProps = {
  totalDistanceKm: number;
  medianPace: string;
  runCount: number;
  totalTime: string;
};

export default function RunStats({ totalDistanceKm, medianPace, runCount, totalTime }: RunStatsProps) {
  return (
    <div className="running-stats">
      <StatChip label="Distance" value={`${totalDistanceKm.toFixed(1)} km`} />
      <StatChip label="Median pace" value={`${medianPace} /km`} />
      <StatChip label="Runs" value={String(runCount)} />
      <StatChip label="Total time" value={totalTime} muted />
    </div>
  );
}

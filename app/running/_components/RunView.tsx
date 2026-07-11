"use client";

import { useState } from "react";
import type { MonthSummary } from "@/data/runs";
import RunStats from "./RunStats";
import RunLog from "./RunLog";

type RunViewProps = {
  months: MonthSummary[];
};

export default function RunView({ months }: RunViewProps) {
  const [activeIdx, setActiveIdx] = useState(months.length - 1);
  const active = months[activeIdx];

  return (
    <>
      {/* Sub-label — reactive to selected month */}
      <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "0 0 2.5rem", fontFamily: "var(--font-mono)" }}>
        {active.runCount} runs · {active.totalDistanceKm.toFixed(1)} km · {active.month}
      </p>

      {/* Stat chips */}
      <RunStats
        totalDistanceKm={active.totalDistanceKm}
        medianPace={active.medianPace}
        runCount={active.runCount}
        totalTime={active.totalTime}
      />

      {/* Month tabs — only shown when >1 month */}
      {months.length > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
          {months.map((m, i) => (
            <button
              key={m.month}
              onClick={() => setActiveIdx(i)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-control)",
                border: "1px solid var(--border-subtle)",
                background: i === activeIdx ? "var(--accent)" : "transparent",
                color: i === activeIdx ? "#fff" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "background 140ms, color 140ms",
              }}
            >
              {m.month}
            </button>
          ))}
        </div>
      )}

      {/* Run log for selected month */}
      <RunLog activeMonth={active} />
    </>
  );
}

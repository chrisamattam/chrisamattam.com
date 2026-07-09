"use client";

import { useState } from "react";
import type { MonthSummary } from "@/data/runs";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

type RunLogProps = {
  months: MonthSummary[];
};

export default function RunLog({ months }: RunLogProps) {
  const [activeIdx, setActiveIdx] = useState(months.length - 1);
  const active = months[activeIdx];

  return (
    <div style={{ marginTop: "2.5rem" }}>
      {/* Month tabs — only shown when >1 month */}
      {months.length > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
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

      {/* Section label */}
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 0.75rem" }}>
        Run log · {active.month}
      </p>

      {/* Header row */}
      <div className="run-log-row run-log-header">
        <span>Date</span>
        <span>Distance</span>
        <span>Pace</span>
        <span>Time</span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border-subtle)", margin: "0 0 0.25rem" }} />

      {/* Run rows */}
      {active.runs.length > 0 ? active.runs.map((run, i) => (
        <div key={i} className="run-log-row">
          <span style={{ color: "var(--text-secondary)" }}>{formatDate(run.date)}</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{run.distanceKm.toFixed(1)} km</span>
          <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{run.paceMinPerKm} /km</span>
          <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{run.durationMmSs}</span>
        </div>
      )) : (
        <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)", padding: "1rem 0" }}>
          Individual run entries coming soon.
        </p>
      )}
    </div>
  );
}

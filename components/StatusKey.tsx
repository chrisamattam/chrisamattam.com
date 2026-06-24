"use client";

import { Fragment, useState } from "react";
import Badge, { STATUS_MEANINGS } from "./Badge";

type Tone = "accent" | "neutral" | "warning" | "danger" | "amber" | "green";

export default function StatusKey({ items }: { items: { status: string; tone: Tone }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      data-reveal
      style={{
        marginBottom: "2rem",
        paddingBottom: "1.25rem",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="hover-link"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Status key
        <span style={{ fontSize: 12, lineHeight: 1 }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            columnGap: "0.85rem",
            rowGap: "0.5rem",
            alignItems: "center",
            width: "fit-content",
            marginTop: "0.9rem",
            animation: "expandIn 220ms var(--ease-emphasis)",
          }}
        >
          {items.map((it) => (
            <Fragment key={it.status}>
              <div style={{ justifySelf: "start" }}>
                <Badge label={it.status} tone={it.tone} />
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {STATUS_MEANINGS[it.status]}
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

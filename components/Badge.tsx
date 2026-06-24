type BadgeTone = "accent" | "neutral" | "warning" | "danger" | "amber" | "green";

const toneStyles: Record<BadgeTone, { bg: string; color: string }> = {
  accent:  { bg: "var(--accent-subtle)",   color: "var(--accent)"       },
  neutral: { bg: "var(--surface-subtle)",  color: "var(--text-tertiary)" },
  warning: { bg: "color-mix(in srgb, var(--warning) 12%, transparent)", color: "var(--warning)" },
  danger:  { bg: "color-mix(in srgb, var(--danger) 10%, transparent)",  color: "var(--danger)"  },
  amber:   { bg: "color-mix(in srgb, #D97706 16%, transparent)", color: "#B45309" },
  green:   { bg: "color-mix(in srgb, #4E8A5E 16%, transparent)", color: "#3F7A52" },
};

// What each project-status flag means.
export const STATUS_MEANINGS: Record<string, string> = {
  active:    "In active development",
  stable:    "Shipped and running in production",
  shipped:   "Built and launched, not currently maintained by me",
  learned:   "Built to learn from; an experiment rather than a shipped product",
  acquired:  "Product or company was acquired",
  retired:   "Intentionally sunset",
  abandoned: "No longer being worked on",
  dead:      "Shut down; no longer exists",
};

export default function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: BadgeTone;
}) {
  const s = toneStyles[tone];
  const meaning = STATUS_MEANINGS[label];
  return (
    <span
      title={meaning ? `${label}: ${meaning}` : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.04em",
        fontWeight: 500,
        background: s.bg,
        color: s.color,
        borderRadius: "var(--radius-chip)",
        padding: "0.2rem 0.55rem",
        whiteSpace: "nowrap",
        cursor: meaning ? "help" : "default",
      }}
    >
      {label}
    </span>
  );
}

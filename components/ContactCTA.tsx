const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendar.app.google/YbHL5bKjBYcFoyPH8";

export default function ContactCTA() {
  return (
    <section
      style={{
        // Translucent so the ambient line backdrop flows through this band too
        background: "color-mix(in srgb, var(--surface-subtle) 55%, transparent)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "clamp(3rem, 5vw, 5rem) 0",
      }}
    >
      <div
        className="container-page"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "2.5rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 500,
              color: "var(--text-primary)",
              margin: "0 0 0.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            Let&apos;s talk.
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", margin: 0, maxWidth: 440, lineHeight: 1.65 }}>
            Open to product roles, advisory conversations, and interesting problems in fintech and AI.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", paddingTop: "0.25rem" }}>
          {/* Primary action: booking when configured, otherwise opens a mail draft */}
          <a
            href={BOOKING_URL || "mailto:chrisamattam@gmail.com"}
            target={BOOKING_URL ? "_blank" : undefined}
            rel={BOOKING_URL ? "noopener noreferrer" : undefined}
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              padding: "0.7rem 1.5rem",
              borderRadius: "var(--radius-control)",
              textDecoration: "none",
            }}
          >
            Let&apos;s Talk
          </a>
        </div>
      </div>
    </section>
  );
}

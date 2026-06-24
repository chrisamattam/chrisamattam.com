import Image from "next/image";
import { journey, type Milestone } from "@/data/journey";

function LinkedInGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function GlobeGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19" />
      <path d="M12 2.5c2.6 2.5 4 5.9 4 9.5s-1.4 7-4 9.5c-2.6-2.5-4-5.9-4-9.5s1.4-7 4-9.5z" />
    </svg>
  );
}

function TrustLink({ href, label, color, children }: { href: string; label: string; color?: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="trust-icon"
      style={{ display: "inline-flex", alignItems: "center", color: color ?? "var(--text-secondary)" }}
    >
      {children}
    </a>
  );
}

function LogoTile({ m }: { m: Milestone }) {
  if (m.logo) {
    return (
      <div
        style={{
          width: 30, height: 30, borderRadius: 7,
          background: "#F5EFDE",
          border: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, overflow: "hidden",
          padding: 3,
        }}
      >
        <Image src={m.logo} alt={`${m.org} logo`} width={24} height={24} style={{ objectFit: "contain", display: "block", width: "100%", height: "100%" }} />
      </div>
    );
  }
  return (
    <div
      style={{
        width: 30, height: 30, borderRadius: 7,
        background: "var(--surface-inverse)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: "var(--font-logo)", fontSize: m.monogram && m.monogram.length > 2 ? 8 : 11, fontWeight: 600, color: "var(--surface-page)", letterSpacing: "0.02em" }}>
        {m.monogram ?? m.org.charAt(0)}
      </span>
    </div>
  );
}

function MilestoneRow({ m, index }: { m: Milestone; index: number }) {
  return (
    <div
      data-reveal
      data-stagger={index * 60}
      className="timeline-row"
    >
      {/* Period */}
      <div className="timeline-period" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", paddingTop: "0.35rem", lineHeight: 1.4 }}>
        {m.period}
      </div>

      {/* Content */}
      <div className="timeline-content" style={{ paddingTop: "0.2rem", paddingBottom: "1.6rem", position: "relative" }}>
        {/* Dot */}
        <div
          className="timeline-dot"
          style={{
            position: "absolute", top: 6, width: 8, height: 8, borderRadius: "50%",
            background: "var(--surface-page)", border: "1.5px solid var(--border-strong)", zIndex: 1,
            animation: `dotPop 0.45s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + index * 0.08}s both`,
          }}
        />

        <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
          <LogoTile m={m} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)" }}>{m.title}</span>
              <span style={{ color: "var(--border-strong)", fontSize: 14 }}>/</span>
              <span style={{ fontSize: 16, color: "var(--text-secondary)" }}>{m.org}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text-secondary)", margin: "0 0 0.55rem", maxWidth: 520 }}>
              {m.description}
            </p>

            {/* Trust markers */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              {m.linkedin && (
                <TrustLink href={m.linkedin} label={`${m.org} on LinkedIn`} color="#0A66C2">
                  <LinkedInGlyph />
                </TrustLink>
              )}
              {m.website && (
                <TrustLink href={m.website} label={`${m.org} website`} color="var(--text-secondary)">
                  <GlobeGlyph />
                </TrustLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Timeline() {
  return (
    <section style={{ padding: "clamp(1.5rem, 3vw, 2.5rem) 0" }}>
      <div className="container-page">
        <div data-reveal style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
            My Learnings &amp; Journey
          </h2>
        </div>

        <div style={{ position: "relative" }}>
          {/* Spine */}
          <div
            className="timeline-spine"
            style={{
              position: "absolute", top: 8, bottom: 32, width: 1,
              background: "var(--border-subtle)", transformOrigin: "top center",
              animation: "spineDraw 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s both",
            }}
          />
          {journey.map((m, i) => (
            <MilestoneRow key={m.title + m.period} m={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";

const fadeUp = (delay: string) =>
  `fadeUp 0.72s cubic-bezier(0.16,1,0.3,1) ${delay} both`;

function IconLink({ href, label, color, children }: { href: string; label: string; color?: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      aria-label={label}
      title={label}
      className="icon-link"
      style={{ display: "inline-flex", alignItems: "center", color: color ?? "var(--text-secondary)" }}
    >
      {children}
    </a>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        padding: "clamp(3rem, 6vw, 5rem) 0 clamp(0.75rem, 1.5vw, 1.25rem)",
      }}
    >
      {/* Hero content */}
      <div className="container-page" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "3rem",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          {/* ── Left column ── */}
          <div style={{ flex: "1 1 min(100%, 600px)", minWidth: 0 }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                margin: "0 0 1.25rem",
                animation: fadeUp("0.05s"),
              }}
            >
              Product · Builder · Fintech · AI
            </p>

            <h1
              style={{
                fontSize: "clamp(2.6rem, 5.5vw, 4.25rem)",
                fontWeight: 500,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                maxWidth: 660,
                margin: "0 0 1.75rem",
                color: "var(--text-primary)",
                animation: fadeUp("0.18s"),
              }}
            >
              Hi, I&apos;m Chris.
            </h1>

            <div style={{ maxWidth: 600, margin: 0, animation: fadeUp("0.32s") }}>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--text-secondary)", margin: "0 0 1.15rem" }}>
                I would like to think of myself as a builder but deep inside I would still like to think that I am a child at heart - curious, non judgmental and hungry to learn.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--text-secondary)", margin: "0 0 1.15rem" }}>
                I have been working as a Product Manager at an early-stage fintech called Butter Money. Our goal was to simplify a small but highly difficult and frictional part of the path to home ownership in India: Home Loans.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--text-secondary)", margin: 0 }}>
                This website is a culmination of my learnings from building and from life. I would love to connect and discuss anything: my email and LinkedIn are open.
              </p>
            </div>
          </div>

          {/* ── Right column: headshot, top-aligned ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              animation: fadeUp("0.38s"),
            }}
          >
            <Image
              src="/images/headshot.jpg"
              alt="Chris Mattam"
              width={56}
              height={56}
              priority
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                objectPosition: "center top",
                border: "1px solid var(--border-subtle)",
              }}
            />
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 0.4rem" }}>
                Chris Mattam
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <IconLink href="https://www.linkedin.com/in/chrismattam/" label="LinkedIn" color="#0A66C2">
                  <LinkedInIcon />
                </IconLink>
                <IconLink href="https://github.com/chrisamattam" label="GitHub" color="var(--text-primary)">
                  <GitHubIcon />
                </IconLink>
                <IconLink href="mailto:chrisamattam@gmail.com" label="Email Chris" color="var(--text-secondary)">
                  <MailIcon />
                </IconLink>
                <IconLink href="https://www.bits-pilani.ac.in/" label="BITS Pilani">
                  <span style={{ display: "inline-flex", width: 20, height: 20, borderRadius: 4, background: "#F5EFDE", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <Image
                      src="/images/college-logo.png"
                      alt="BITS Pilani"
                      width={18}
                      height={18}
                      style={{ objectFit: "contain", display: "block" }}
                    />
                  </span>
                </IconLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

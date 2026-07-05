import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getAllHikes, getHikePins } from "@/lib/hikes";
import GlobeMount from "./_components/GlobeMount";

export const metadata = {
  title: "Hiking — Chris Mattam",
  description: "An interactive globe of every hike and trek I've done, across the Himalaya and the Sahyadri.",
};

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block" }} />
      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
    </span>
  );
}

export default function HikingPage() {
  const pins = getHikePins();
  const hikes = getAllHikes();
  const byRange = {
    Himalaya: hikes.filter((h) => h.range === "Himalaya"),
    Sahyadri: hikes.filter((h) => h.range === "Sahyadri"),
  };

  return (
    <>
      <Nav />

      {/* Globe hero */}
      <section
        style={{
          position: "relative",
          height: "calc(100dvh - 58px)",
          minHeight: 480,
          overflow: "hidden",
        }}
      >
        {/* Heading + legend overlay (does not block globe interaction) */}
        <div
          className="container-page"
          style={{ position: "absolute", top: "clamp(1.5rem, 4vw, 3rem)", left: 0, right: 0, zIndex: 2, pointerEvents: "none" }}
        >
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 0.6rem" }}>
            Hobbies · On foot
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 500, letterSpacing: "-0.03em", color: "var(--text-primary)", margin: "0 0 0.75rem" }}>
            Hiking
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 440, margin: "0 0 1rem", lineHeight: 1.6 }}>
            Every hike and trek I&apos;ve done, pinned where it happened. Spin the globe, or tap a pin to read the account.
          </p>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            <LegendDot color="#3B82F6" label="Himalaya" />
            <LegendDot color="#4E8A5E" label="Sahyadri" />
          </div>
        </div>

        {/* The globe fills the section */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <GlobeMount pins={pins} />
        </div>
      </section>

      {/* Text list — SEO, accessibility, and a no-JS way to reach every hike */}
      <main>
        <section style={{ padding: "clamp(3rem, 6vw, 5rem) 0" }}>
          <div className="container-page">
            {(["Himalaya", "Sahyadri"] as const).map((range) => (
              <div key={range} style={{ marginBottom: "2.5rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "1rem" }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{range}</h2>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                    {byRange[range].length} {byRange[range].length === 1 ? "hike" : "hikes"}
                  </span>
                </div>
                <div>
                  {byRange[range].map((h) => (
                    <Link
                      key={h.slug}
                      href={`/hiking/${h.slug}`}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: "1rem",
                        padding: "0.85rem 0",
                        borderTop: "1px solid var(--border-subtle)",
                        textDecoration: "none",
                      }}
                      className="hike-row"
                    >
                      <span style={{ fontSize: 15, color: "var(--text-primary)", fontWeight: 500 }}>{h.name}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                        {h.subRegion}
                        {h.visits > 1 ? ` · ${h.visitsLabel ?? h.visits}×` : ""}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

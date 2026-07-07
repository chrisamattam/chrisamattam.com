import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";
import { library, type LibraryBook } from "@/data/library";

export const metadata = {
  title: "Reading",
  description: "A library of 169 books across Kindle, Audible, and physical shelves.",
};

const formatTone: Record<string, string> = {
  Kindle:   "var(--text-tertiary)",
  Audible:  "var(--accent)",
  Physical: "var(--text-secondary)",
};

// Group by acquired year, newest first
const byYear: Record<string, LibraryBook[]> = {};
for (const b of library) {
  const y = b.acquired.slice(0, 4);
  (byYear[y] ||= []).push(b);
}
const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));
for (const y of years) byYear[y].sort((a, b) => b.acquired.localeCompare(a.acquired));

function BookCell({ b }: { b: LibraryBook }) {
  const shortTitle = b.title.split(/[:(]/)[0].trim();
  return (
    <div style={{ width: 92 }}>
      <div
        style={{
          width: 92,
          height: 138,
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
          position: "relative",
          background: "var(--surface-subtle)",
          display: "flex",
        }}
      >
        {b.cover ? (
          <Image src={b.cover} alt={`${shortTitle} cover`} width={92} height={138} style={{ width: 92, height: 138, objectFit: "cover" }} />
        ) : (
          // Placeholder "spine" tile for books without a cover
          <div
            style={{
              width: "100%", height: "100%", padding: "10px 9px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              borderLeft: "3px solid var(--border-strong)",
            }}
          >
            <span style={{ fontSize: 9.5, lineHeight: 1.25, color: "var(--text-secondary)", fontWeight: 500, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical" }}>
              {shortTitle}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)" }}>
              {b.author.split(",")[0]}
            </span>
          </div>
        )}
      </div>
      <p style={{ fontSize: 10.5, color: "var(--text-secondary)", margin: "0.5rem 0 0", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {shortTitle}
      </p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, color: formatTone[b.format], margin: "0.2rem 0 0", letterSpacing: "0.04em" }}>
        {b.format}
      </p>
    </div>
  );
}

export default function ReadingPage() {
  return (
    <RevealWrapper>
      <Nav />
      <main>
        {/* Hero */}
        <div style={{ padding: "clamp(3rem, 6vw, 5rem) 0 clamp(1.5rem, 3vw, 2.5rem)" }}>
          <div className="container-page">
            <h1
              data-reveal
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--text-primary)", margin: "0 0 0.75rem" }}
            >
              Reading
            </h1>
            <p data-reveal data-stagger="100" style={{ fontSize: 17, color: "var(--text-secondary)", margin: 0 }}>
              Been trying to read more. Will over time add book summaries and learnings from each book here.
            </p>
          </div>
        </div>

        {/* Library — cover grid by year */}
        <div style={{ paddingBottom: "clamp(3rem, 6vw, 5rem)" }}>
          <div className="container-page">
            {years.map((year, yi) => (
              <div key={year} data-reveal data-stagger={Math.min(yi * 40, 240)} style={{ marginBottom: "3rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "1.25rem" }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{year}</h2>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                    {byYear[year].length} {byYear[year].length === 1 ? "book" : "books"}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem 1.25rem" }}>
                  {byYear[year].map((b, i) => (
                    <BookCell key={b.title + b.acquired + i} b={b} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </RevealWrapper>
  );
}

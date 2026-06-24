import Link from "next/link";
import { format } from "date-fns";
import Nav from "@/components/Nav";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";
import { allPosts } from "contentlayer/generated";

export const metadata = {
  title: "Writing — Chris Mattam",
  description: "Notes on product, fintech, and AI.",
};

export default function WritingPage() {
  const posts = allPosts
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <RevealWrapper>
      <Nav />
      <main>
        <div style={{ padding: "clamp(4rem, 8vw, 7rem) 0 clamp(2rem, 4vw, 3.5rem)" }}>
          <div className="container-page">
            <h1
              data-reveal
              style={{
                fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "var(--text-primary)",
                margin: "0 0 0.75rem",
              }}
            >
              Writing
            </h1>
            <p data-reveal data-stagger="100" style={{ fontSize: 17, color: "var(--text-secondary)", margin: 0 }}>
              Notes on product, fintech, and AI.
            </p>
          </div>
        </div>

        <div style={{ paddingBottom: "clamp(4rem, 8vw, 7rem)" }}>
          <div className="container-page">
            {posts.length === 0 ? (
              <p data-reveal style={{ fontSize: 15, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                Nothing published yet. Check back soon.
              </p>
            ) : (
              posts.map((post, i) => (
                <div
                  key={post.slug}
                  data-reveal
                  data-stagger={i * 60}
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    padding: "1.25rem 0",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "2rem",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/writing/${post.slug}`}
                      style={{ textDecoration: "none" }}
                    >
                      <h2 style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 0.35rem" }}>
                        {post.title}
                      </h2>
                    </Link>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                      {post.summary}
                    </p>
                  </div>
                  <time
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      flexShrink: 0,
                      paddingTop: "0.2rem",
                    }}
                  >
                    {format(new Date(post.date), "d MMM yyyy")}
                  </time>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <ContactCTA />
      <Footer />
    </RevealWrapper>
  );
}

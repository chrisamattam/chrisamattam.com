import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";

export const metadata = {
  title: "Colophon — Chris Mattam",
  description: "How this site is built.",
};

const stack = [
  { label: "Framework",    value: "Next.js 14 (App Router)" },
  { label: "Language",     value: "TypeScript"               },
  { label: "Styling",      value: "Tailwind CSS"             },
  { label: "Content",      value: "MDX via Contentlayer2"    },
  { label: "Fonts",        value: "Hanken Grotesk, JetBrains Mono, Outfit" },
  { label: "Design",       value: "Claude Design"            },
  { label: "Hosting",      value: "Vercel"                   },
  { label: "Analytics",    value: "GA4"                      },
  { label: "Contact form", value: "Formspree"                },
  { label: "Source",       value: "github.com/chrisamattam/chrisamattam.com", href: "https://github.com/chrisamattam/chrisamattam.com" },
];

export default function ColophonPage() {
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
              Colophon
            </h1>
            <p data-reveal data-stagger="100" style={{ fontSize: 17, color: "var(--text-secondary)", margin: 0 }}>
              How this site is built.
            </p>
          </div>
        </div>

        <div style={{ paddingBottom: "clamp(4rem, 8vw, 7rem)" }}>
          <div className="container-page" style={{ maxWidth: 560 }}>
            <dl data-reveal data-stagger="200">
              {stack.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    gap: "1rem",
                    padding: "0.875rem 0",
                    borderTop: "1px solid var(--border-subtle)",
                    alignItems: "baseline",
                  }}
                >
                  <dt
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {item.label}
                  </dt>
                  <dd style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--text-link)", textDecoration: "none", textDecorationLine: "underline", textDecorationThickness: 1, textUnderlineOffset: 3 }}>
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </main>
      <Footer />
    </RevealWrapper>
  );
}

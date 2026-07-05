import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";

export const metadata = {
  title: "Running — Chris Mattam",
  description: "Running log and routes — coming soon.",
};

export default function RunningPage() {
  return (
    <RevealWrapper>
      <Nav />
      <main>
        <div style={{ padding: "clamp(4rem, 8vw, 7rem) 0", minHeight: "60vh" }}>
          <div className="container-page">
            <p data-reveal style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 1rem" }}>
              Hobbies · On foot
            </p>
            <h1 data-reveal data-stagger="100" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--text-primary)", margin: "0 0 1rem" }}>
              Running
            </h1>
            <p data-reveal data-stagger="200" style={{ fontSize: 17, color: "var(--text-secondary)", margin: 0, maxWidth: 480 }}>
              A running log and favourite routes are on the way. Check back soon.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </RevealWrapper>
  );
}

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";
import { runsByMonth } from "@/data/runs";
import RunStats from "./_components/RunStats";
import RunLog from "./_components/RunLog";

export const metadata = {
  title: "Running — Chris Mattam",
  description: "A monthly running log — distances, pace, and individual runs.",
};

export default function RunningPage() {
  const latest = runsByMonth[runsByMonth.length - 1];

  return (
    <RevealWrapper>
      <Nav />
      <main>
        <div style={{ padding: "clamp(4rem, 8vw, 7rem) 0" }}>
          <div className="container-page" style={{ maxWidth: 720 }}>

            {/* Header */}
            <p data-reveal style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 1rem" }}>
              Hobbies · On foot
            </p>
            <h1 data-reveal data-stagger="80" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--text-primary)", margin: "0 0 0.6rem" }}>
              Running
            </h1>
            <p data-reveal data-stagger="160" style={{ fontSize: 15, color: "var(--text-muted)", margin: "0 0 2.5rem", fontFamily: "var(--font-mono)" }}>
              {latest.runCount} runs · {latest.totalDistanceKm.toFixed(1)} km · {latest.month}
            </p>

            {/* Monthly stat chips */}
            <div data-reveal data-stagger="240">
              <RunStats
                totalDistanceKm={latest.totalDistanceKm}
                medianPace={latest.medianPace}
                runCount={latest.runCount}
                totalTime={latest.totalTime}
              />
            </div>

            {/* Run log */}
            <div data-reveal data-stagger="320">
              <RunLog months={runsByMonth} />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </RevealWrapper>
  );
}

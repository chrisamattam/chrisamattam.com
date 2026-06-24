import Nav from "@/components/Nav";
import { ProjectRowFull } from "@/components/ProjectRow";
import StatusKey from "@/components/StatusKey";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";
import { allProjects } from "contentlayer/generated";

const STATUS_TONE: Record<string, "accent" | "neutral" | "warning" | "danger" | "amber" | "green"> = {
  active: "accent", stable: "neutral", shipped: "amber", learned: "green", acquired: "neutral",
  retired: "warning", abandoned: "warning", dead: "danger",
};
const STATUS_ORDER = ["active", "stable", "shipped", "learned", "acquired", "retired", "abandoned", "dead"];
// Statuses always documented in the key, even if no project currently uses them.
const ALWAYS_SHOW = ["learned"];

export const metadata = {
  title: "Work — Chris Mattam",
  description: "Products I've shipped and problems I've worked on.",
};

export default function WorkPage() {
  // Order by status (active → shipped → learned → anything else), then newest first within each.
  const STATUS_RANK: Record<string, number> = { active: 0, shipped: 1, learned: 2 };
  const rank = (s: string) => STATUS_RANK[s] ?? 99;
  const projects = [...allProjects].sort((a, b) => {
    const byStatus = rank(a.status) - rank(b.status);
    if (byStatus !== 0) return byStatus;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  const usedStatuses = STATUS_ORDER.filter(
    (s) => projects.some((p) => p.status === s) || ALWAYS_SHOW.includes(s)
  );

  return (
    <RevealWrapper>
      <Nav />
      <main>
        <div style={{ padding: "clamp(4rem, 8vw, 7rem) 0 clamp(2rem, 4vw, 3.5rem)" }}>
          <div className="container-page">
            <p
              data-reveal
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                margin: "0 0 1rem",
              }}
            >
              products · projects · case studies
            </p>
            <h1
              data-reveal
              data-stagger="100"
              style={{
                fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "var(--text-primary)",
                margin: "0 0 1rem",
              }}
            >
              Work
            </h1>
            <p
              data-reveal
              data-stagger="200"
              style={{
                fontSize: 17,
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              A record of products I&apos;ve shipped and problems I&apos;ve worked on.
            </p>
          </div>
        </div>

        <div style={{ paddingBottom: "clamp(4rem, 8vw, 7rem)" }}>
          <div className="container-page">
            <StatusKey items={usedStatuses.map((s) => ({ status: s, tone: STATUS_TONE[s] }))} />

            <div data-reveal data-stagger="300">
              {projects.map((project) => (
                <ProjectRowFull key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <ContactCTA />
      <Footer />
    </RevealWrapper>
  );
}

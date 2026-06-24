import Link from "next/link";
import { notFound } from "next/navigation";
import { allProjects } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer2/hooks";
import Nav from "@/components/Nav";
import Badge from "@/components/Badge";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";

export async function generateStaticParams() {
  return allProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — Chris Mattam`,
    description: project.summary,
  };
}

function MDXContent({ code }: { code: string }) {
  const Component = useMDXComponent(code);
  return (
    <div className="prose">
      <Component />
    </div>
  );
}

export default async function WorkSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <RevealWrapper>
      <Nav />
      <main>
        <div style={{ padding: "clamp(4rem, 8vw, 6rem) 0 clamp(3rem, 5vw, 5rem)" }}>
          <div className="container-page">
            <Link
              href="/work"
              className="hover-link"
              style={{ fontFamily: "var(--font-mono)", fontSize: 12, display: "inline-block", marginBottom: "1.75rem" }}
            >
              ← Back to work
            </Link>

            {(project.company || project.period) && (
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  letterSpacing: "0.08em",
                  margin: "0 0 0.75rem",
                }}
              >
                {[project.company, project.period].filter(Boolean).join(" · ")}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <h1
                style={{
                  fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
                  fontWeight: 500,
                  letterSpacing: "-0.025em",
                  color: "var(--text-primary)",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {project.title}
              </h1>
              <Badge
                label={project.status}
                tone={project.badgeTone as "accent" | "neutral" | "warning" | "danger" | "amber" | "green"}
              />
            </div>

            <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 600, lineHeight: 1.7, margin: "0 0 2rem" }}>
              {project.summary}
            </p>

            {/* Links */}
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
              {Array.isArray(project.links) &&
                (project.links as { label: string; url: string }[]).map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
                    {l.label} ↗
                  </a>
                ))}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
                  Live ↗
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>
                  GitHub ↗
                </a>
              )}
            </div>

            {/* Problem statement */}
            {project.problem && (
              <div
                style={{
                  background: "var(--surface-subtle)",
                  borderLeft: "3px solid var(--border-default)",
                  padding: "1.25rem 1.5rem",
                  borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                  marginBottom: "2.5rem",
                  maxWidth: 640,
                }}
              >
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.5rem" }}>
                  Problem
                </p>
                <p style={{ fontSize: 15, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
                  {project.problem}
                </p>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
                {project.tags.map((tag) => (
                  <span key={tag} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-chip)", padding: "0.2rem 0.55rem" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* MDX body */}
            {project.body.code && <MDXContent code={project.body.code} />}
          </div>
        </div>
      </main>
      <ContactCTA />
      <Footer />
    </RevealWrapper>
  );
}

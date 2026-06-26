import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HeroLines from "@/components/HeroLines";
import Timeline from "@/components/Timeline";
import { ProjectRowCompact } from "@/components/ProjectRow";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";
import { allProjects } from "contentlayer/generated";

export default function HomePage() {
  const featuredProjects = allProjects
    .filter((p) => p.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Chris Mattam",
    url: "https://chrisamattam-com.vercel.app",
    jobTitle: "Product Manager",
    description: "Product manager building AI-native fintech products. Based in Bengaluru.",
    image: "https://chrisamattam-com.vercel.app/images/headshot.jpg",
    email: "mailto:chrisamattam@gmail.com",
    worksFor: { "@type": "Organization", name: "Butter Money", url: "https://butter.money/" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "BITS Pilani", url: "https://www.bits-pilani.ac.in/" },
    sameAs: [
      "https://www.linkedin.com/in/chrismattam/",
      "https://github.com/chrisamattam",
    ],
    knowsAbout: ["Product Management", "Fintech", "Artificial Intelligence", "Loan Origination Systems"],
  };

  return (
    <RevealWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      {/* Ambient flowing-lines backdrop — fixed to the viewport, spans the full page
          behind everything as you scroll. pointer-events:none so it never blocks clicks. */}
      <HeroLines
        className="hidden md:block"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100dvh",
          width: "58%",
          zIndex: 0,
          pointerEvents: "none",
          background: "transparent",
        }}
        speed={0.0007}
      />

      {/* All content sits above the backdrop */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Nav />
        <main>
          <Hero />

          <Timeline />

          {/* Selected work */}
          <section style={{ padding: "clamp(2rem, 4vw, 3.5rem) 0" }}>
            <div className="container-page">
              <div
                data-reveal
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.75rem",
                  marginBottom: "0.5rem",
                }}
              >
                <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
                  Selected work
                </h2>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                  {featuredProjects.length} projects
                </span>
              </div>

              <div data-reveal data-stagger="100">
                {featuredProjects.map((project) => (
                  <ProjectRowCompact key={project.slug} project={project} />
                ))}
              </div>
            </div>
          </section>
        </main>

        <ContactCTA />
        <Footer />
      </div>
    </RevealWrapper>
  );
}

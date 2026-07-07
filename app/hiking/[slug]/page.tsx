import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";
import { getAllHikes, getHikeBySlug, getRegionNeighbours, REGION_LABEL, type Region } from "@/lib/hikes";
import { getHikePhotos } from "@/lib/hikePhotos";
import HikeDetail from "../_components/HikeDetail";

export function generateStaticParams() {
  return getAllHikes().map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hike = getHikeBySlug(slug);
  if (!hike) return {};
  const ogImage = getHikePhotos(slug).heroImage ?? hike.heroImage;
  return {
    title: `${hike.name} — Hiking · Chris Mattam`,
    description: hike.hook, // one-line teaser doubles as the meta description
    openGraph: {
      title: hike.name,
      description: hike.hook,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

function NeighbourLink({ hike, dir }: { hike: { slug: string; name: string }; dir: "prev" | "next" }) {
  return (
    <Link
      href={`/hiking/${hike.slug}`}
      className="hover-link-secondary"
      style={{ display: "flex", flexDirection: "column", gap: 3, textAlign: dir === "next" ? "right" : "left", maxWidth: "48%" }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
        {dir === "prev" ? "← Previous" : "Next →"}
      </span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{hike.name}</span>
    </Link>
  );
}

export default async function HikeStandalonePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hike = getHikeBySlug(slug);
  if (!hike) notFound();
  const region = hike.region as Region;
  const { heroImage, photos } = getHikePhotos(slug);
  const { prev, next } = getRegionNeighbours(slug);

  return (
    <RevealWrapper>
      <Nav />
      <main>
        <div style={{ padding: "clamp(4rem, 8vw, 6rem) 0 clamp(3rem, 5vw, 5rem)" }}>
          <div className="container-page" style={{ maxWidth: 760 }}>
            {/* Breadcrumb: Hiking › Region › Hike */}
            <nav style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", marginBottom: "1.75rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <Link href="/hiking" className="hover-link">Hiking</Link>
              <span>›</span>
              <Link href={`/hiking?focus=${slug}`} className="hover-link">{REGION_LABEL[region]}</Link>
              <span>›</span>
              <span style={{ color: "var(--text-secondary)" }}>{hike.name}</span>
            </nav>

            <HikeDetail hike={hike} heroImage={heroImage} photos={hike.curatedPhotos ? [] : photos} />

            {/* Prev / next within the same region */}
            {(prev || next) && (
              <nav style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
                <div>{prev && <NeighbourLink hike={prev} dir="prev" />}</div>
                <div>{next && <NeighbourLink hike={next} dir="next" />}</div>
              </nav>
            )}

            {/* Back to the globe, centered on this hike */}
            <div style={{ marginTop: "2rem" }}>
              <Link href={`/hiking?focus=${slug}`} className="hover-link" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                ← Back to the map
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </RevealWrapper>
  );
}

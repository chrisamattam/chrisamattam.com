import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";
import { getAllHikes, getHikeBySlug } from "@/lib/hikes";
import HikeDetail from "../_components/HikeDetail";

export function generateStaticParams() {
  return getAllHikes().map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hike = getHikeBySlug(slug);
  if (!hike) return {};
  const description = `${hike.name} — a ${hike.range} hike in ${hike.subRegion}.`;
  return {
    title: `${hike.name} — Hiking · Chris Mattam`,
    description,
    openGraph: {
      title: hike.name,
      description,
      ...(hike.heroImage ? { images: [{ url: hike.heroImage }] } : {}),
    },
  };
}

export default async function HikeStandalonePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hike = getHikeBySlug(slug);
  if (!hike) notFound();

  return (
    <RevealWrapper>
      <Nav />
      <main>
        <div style={{ padding: "clamp(4rem, 8vw, 6rem) 0 clamp(3rem, 5vw, 5rem)" }}>
          <div className="container-page" style={{ maxWidth: 760 }}>
            <Link
              href="/hiking"
              className="hover-link"
              style={{ fontFamily: "var(--font-mono)", fontSize: 12, display: "inline-block", marginBottom: "1.75rem" }}
            >
              ← Back to the globe
            </Link>
            <HikeDetail hike={hike} />
          </div>
        </div>
      </main>
      <Footer />
    </RevealWrapper>
  );
}

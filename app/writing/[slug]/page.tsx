import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { allPosts } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer2/hooks";
import Nav from "@/components/Nav";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";

export async function generateStaticParams() {
  return allPosts.filter((p) => !p.draft).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug && !p.draft);
  if (!post) return {};
  return { title: `${post.title} — Chris Mattam`, description: post.summary };
}

function MDXContent({ code }: { code: string }) {
  const Component = useMDXComponent(code);
  return <div className="prose"><Component /></div>;
}

export default async function WritingSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug && !p.draft);
  if (!post) notFound();

  return (
    <RevealWrapper>
      <Nav />
      <main>
        <div style={{ padding: "clamp(4rem, 8vw, 6rem) 0 clamp(3rem, 5vw, 5rem)" }}>
          <div className="container-page">
            <Link
              href="/writing"
              className="hover-link"
              style={{ fontFamily: "var(--font-mono)", fontSize: 12, display: "inline-block", marginBottom: "1.75rem" }}
            >
              ← Back to writing
            </Link>
            <br />
            <time style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
              {format(new Date(post.date), "d MMMM yyyy")}
            </time>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 500, letterSpacing: "-0.025em", color: "var(--text-primary)", margin: "0.75rem 0 1.5rem", lineHeight: 1.1 }}>
              {post.title}
            </h1>
            <MDXContent code={post.body.code} />
          </div>
        </div>
      </main>
      <ContactCTA />
      <Footer />
    </RevealWrapper>
  );
}

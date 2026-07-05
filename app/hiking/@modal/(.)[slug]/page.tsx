import { notFound } from "next/navigation";
import { getHikeBySlug } from "@/lib/hikes";
import HikeOverlay from "../../_components/HikeOverlay";

// Intercepted route: clicking a pin on /hiking opens this as an overlay while
// the globe stays mounted underneath. Direct loads use app/hiking/[slug] instead.
export default async function InterceptedHikePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hike = getHikeBySlug(slug);
  if (!hike) notFound();
  return <HikeOverlay hike={hike} />;
}

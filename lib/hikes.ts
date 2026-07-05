import { allHikes } from "contentlayer/generated";

export type Hike = (typeof allHikes)[number];

/** Minimal, fully-serializable shape passed to the client globe + list. */
export type HikePin = {
  id: string;
  slug: string;
  name: string;
  range: "Himalaya" | "Sahyadri";
  subRegion: string;
  lat: number;
  lng: number;
  visits: number;
  visitsLabel?: string;
};

/** All hikes, ordered Himalaya-first, then by visit count, then name. */
export function getAllHikes(): Hike[] {
  return [...allHikes].sort((a, b) => {
    if (a.range !== b.range) return a.range === "Himalaya" ? -1 : 1;
    if (b.visits !== a.visits) return b.visits - a.visits;
    return a.name.localeCompare(b.name);
  });
}

export function getHikeBySlug(slug: string): Hike | undefined {
  return allHikes.find((h) => h.slug === slug);
}

/** Lightweight pin data for the globe (no MDX body / heavy fields). */
export function getHikePins(): HikePin[] {
  return getAllHikes().map((h) => ({
    id: h.id,
    slug: h.slug,
    name: h.name,
    range: h.range as "Himalaya" | "Sahyadri",
    subRegion: h.subRegion,
    lat: h.lat,
    lng: h.lng,
    visits: h.visits,
    visitsLabel: h.visitsLabel,
  }));
}

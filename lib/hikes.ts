import { allHikes } from "contentlayer/generated";

export type Hike = (typeof allHikes)[number];
export type Region = "himalaya" | "sahyadri";

export const REGION_LABEL: Record<Region, string> = {
  himalaya: "Himalaya",
  sahyadri: "Sahyadri",
};

/** Minimal, fully-serializable shape passed to the client globe + list. */
export type HikePin = {
  id: string;
  slug: string;
  name: string;
  region: Region;
  area: string;
  state: string;
  lat: number;
  lng: number;
  visits: number;
  visitsLabel?: string;
  hook: string;
};

/** All hikes, ordered Himalaya-first, then by visit count, then name. */
export function getAllHikes(): Hike[] {
  return [...allHikes].sort((a, b) => {
    if (a.region !== b.region) return a.region === "himalaya" ? -1 : 1;
    if (b.visits !== a.visits) return b.visits - a.visits;
    return a.name.localeCompare(b.name);
  });
}

export function getHikeBySlug(slug: string): Hike | undefined {
  return allHikes.find((h) => h.slug === slug);
}

/** Previous / next hike within the same region (for on-page navigation). */
export function getRegionNeighbours(slug: string): { prev: Hike | null; next: Hike | null } {
  const hike = getHikeBySlug(slug);
  if (!hike) return { prev: null, next: null };
  const inRegion = getAllHikes().filter((h) => h.region === hike.region);
  const i = inRegion.findIndex((h) => h.slug === slug);
  return {
    prev: i > 0 ? inRegion[i - 1] : null,
    next: i >= 0 && i < inRegion.length - 1 ? inRegion[i + 1] : null,
  };
}

/** Lightweight pin data for the globe — the single source of truth for markers. */
export function getHikePins(): HikePin[] {
  return getAllHikes().map((h) => ({
    id: h.id,
    slug: h.slug,
    name: h.name,
    region: h.region as Region,
    area: h.location.area,
    state: h.location.state,
    lat: h.coordinates.lat,
    lng: h.coordinates.lng,
    visits: h.visits,
    visitsLabel: h.visitsLabel,
    hook: h.hook,
  }));
}

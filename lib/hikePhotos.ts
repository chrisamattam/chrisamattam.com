import fs from "node:fs";
import path from "node:path";

// Server-only (build-time) reader: pulls every image out of
// public/hikes/<slug>/ so adding photos = dropping files in a folder.
const IMG = /\.(jpe?g|png|webp|avif)$/i;

export function getHikePhotos(slug: string): { heroImage: string | null; photos: string[] } {
  const dir = path.join(process.cwd(), "public", "hikes", slug);
  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => IMG.test(f) && !f.startsWith("."));
  } catch {
    return { heroImage: null, photos: [] }; // no folder yet
  }
  // Natural sort (01, 02, … 10) so ordering is predictable.
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Hero = a file named hero.* if present, otherwise the first image.
  const heroFile = files.find((f) => /^hero\./i.test(f)) ?? files[0] ?? null;
  const url = (f: string) => `/hikes/${slug}/${f}`;
  return {
    heroImage: heroFile ? url(heroFile) : null,
    photos: files.filter((f) => f !== heroFile).map(url),
  };
}

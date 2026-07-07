import type { MetadataRoute } from "next";
import { allProjects, allPosts } from "contentlayer/generated";
import { getAllHikes } from "@/lib/hikes";

const BASE = "https://chrisamattam-com.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/work", "/writing", "/reading", "/hiking", "/running", "/colophon", "/contact"].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  // Hike detail pages are real shareable URLs — include the non-draft ones.
  const hikeRoutes = getAllHikes()
    .filter((h) => !h.draft)
    .map((h) => ({
      url: `${BASE}/hiking/${h.slug}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    }));

  const projectRoutes = allProjects.map((p) => ({
    url: `${BASE}/work/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const postRoutes = allPosts
    .filter((p) => !p.draft)
    .map((p) => ({
      url: `${BASE}/writing/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes, ...hikeRoutes];
}

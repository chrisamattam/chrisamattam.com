import type { MetadataRoute } from "next";
import { allProjects, allPosts } from "contentlayer/generated";

const BASE = "https://chrisamattam-com.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/work", "/writing", "/reading", "/colophon", "/contact"].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
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

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}

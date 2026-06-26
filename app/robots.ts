import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://chrisamattam-com.vercel.app/sitemap.xml",
    host: "https://chrisamattam-com.vercel.app",
  };
}

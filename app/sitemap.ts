import type { MetadataRoute } from "next";
import { getCuratedFeed } from "@/lib/curation";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://aweinbox.example";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/colophon`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const feed = await getCuratedFeed();
    const all = feed.today ? [feed.today, ...feed.inbox] : feed.inbox;
    eventRoutes = all.map((s) => ({
      url: `${base}/event/${encodeURIComponent(s.event.id)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch {
    // ignore — empty feed is fine
  }

  return [...staticRoutes, ...eventRoutes];
}

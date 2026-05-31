import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const routes: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/o-mnie", priority: 0.8, changeFrequency: "monthly" },
  { path: "/dla-programistow", priority: 0.9, changeFrequency: "monthly" },
  { path: "/business-english", priority: 0.9, changeFrequency: "monthly" },
  { path: "/egzaminy", priority: 0.9, changeFrequency: "monthly" },
  { path: "/rezerwacja", priority: 0.8, changeFrequency: "weekly" },
  { path: "/kontakt", priority: 0.7, changeFrequency: "monthly" },
];

function plUrl(path: string) {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

function enUrl(path: string) {
  return `${SITE_URL}/en${path === "/" ? "" : path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const plEntries = routes.map(({ path, priority, changeFrequency }) => ({
    url: plUrl(path),
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: { pl: plUrl(path), en: enUrl(path) },
    },
  }));

  const enEntries = routes.map(({ path, priority, changeFrequency }) => ({
    url: enUrl(path),
    lastModified: new Date(),
    changeFrequency,
    priority: Math.round(priority * 0.9 * 10) / 10,
    alternates: {
      languages: { pl: plUrl(path), en: enUrl(path) },
    },
  }));

  return [...plEntries, ...enEntries];
}

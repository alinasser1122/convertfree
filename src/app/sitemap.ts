import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE = 'https://freeconvertx.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/converter', '/tools/resize', '/tools/crop', '/tools/pdf', '/tools/gif'];
  const locales = ['en', 'ar'];
  const now = new Date();
  return locales.flatMap((l) =>
    routes.map((r) => ({
      url: `${BASE}/${l}${r}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: r === '' ? 1 : 0.8
    }))
  );
}

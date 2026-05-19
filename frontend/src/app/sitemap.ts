import type { MetadataRoute } from 'next'

import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://arrivoapp.it'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/trova-ristoranti`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/come-funziona`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/chi-siamo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contatti`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/registrati`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/registrati/locale`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/termini`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/cookie`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const ristoranti = await prisma.restaurant.findMany({
    where: { status: 'approved' },
    select: { slug: true, updatedAt: true },
  })

  const restaurantRoutes: MetadataRoute.Sitemap = ristoranti.map((r) => ({
    url: `${base}/ristoranti/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...restaurantRoutes]
}

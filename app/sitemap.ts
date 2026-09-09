import type { MetadataRoute } from "next"
import { SITE_URL, getBackendUrl } from "@/lib/seo"

async function fetchJson(path: string) {
  try {
    const res = await fetch(`${getBackendUrl()}${path}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function asArray(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data
    if (Array.isArray(data)) return data
  }
  return []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/suppliers`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/magazines`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/events`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/feed`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/industry-talks`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/jobs`, lastModified: now, changeFrequency: "hourly", priority: 0.7 },
  ]

  const [posts, suppliers, magazines, events] = await Promise.all([
    fetchJson("/api/posts?limit=100"),
    fetchJson("/api/suppliers?limit=100"),
    fetchJson("/api/magazines"),
    fetchJson("/api/events"),
  ])

  const postRoutes: MetadataRoute.Sitemap = asArray(posts)
    .filter((post) => post?.slug)
    .map((post) => ({
      url: `${SITE_URL}/post/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

  const supplierRoutes: MetadataRoute.Sitemap = asArray(suppliers)
    .filter((item) => item?.slug)
    .map((item) => ({
      url: `${SITE_URL}/suppliers/${item.slug}`,
      lastModified: item.updatedAt || item.createdAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

  const magazineRoutes: MetadataRoute.Sitemap = asArray(magazines)
    .filter((item) => item?.slug)
    .map((item) => ({
      url: `${SITE_URL}/magazines/${item.slug}`,
      lastModified: item.updatedAt || item.createdAt || now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))

  const eventRoutes: MetadataRoute.Sitemap = asArray(events)
    .filter((item) => item?.slug)
    .map((item) => ({
      url: `${SITE_URL}/events/${item.slug}`,
      lastModified: item.updatedAt || item.startDate || now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

  return [...staticRoutes, ...postRoutes, ...supplierRoutes, ...magazineRoutes, ...eventRoutes]
}

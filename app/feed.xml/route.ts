import { getBackendUrl, SITE_NAME, SITE_URL } from "@/lib/seo"

export const dynamic = "force-dynamic"

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  let posts: Array<{
    title?: string
    slug?: string
    shortDescription?: string
    excerpt?: string
    publishedAt?: string
    updatedAt?: string
  }> = []

  try {
    const res = await fetch(`${getBackendUrl()}/api/posts?limit=50`, {
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      posts = Array.isArray(data) ? data : data.data ?? []
    }
  } catch {
    posts = []
  }

  const items = posts
    .filter((post) => post.slug)
    .map((post) => {
      const url = `${SITE_URL}/post/${post.slug}`
      const description = escapeXml(
        post.shortDescription || post.excerpt || post.title || ""
      )
      const date = post.publishedAt || post.updatedAt || new Date().toISOString()
      return `<item>
  <title>${escapeXml(post.title || "Untitled")}</title>
  <link>${url}</link>
  <guid>${url}</guid>
  <pubDate>${new Date(date).toUTCString()}</pubDate>
  <description>${description}</description>
</item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>Industrial manufacturing technology news covering CNC machining, dies and moulds, cutting tools, factory automation, and Industry 4.0.</description>
    <language>en-us</language>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}

import BlogListing from "./BlogListing"
import JsonLd from "@/components/seo/JsonLd"
import {
  absoluteUrl,
  collectionJsonLd,
  getBackendUrl,
  listingMetadata,
} from "@/lib/seo"

export const dynamic = "force-dynamic"

export const metadata = listingMetadata({
  title: "Manufacturing & Tooling Blog",
  description:
    "Read Tooling Trends articles on CNC machining, dies and moulds, cutting tools, factory automation, CAD/CAM, metrology, and Industry 4.0 manufacturing technology.",
  path: "/blog",
  keywords: [
    "manufacturing blog",
    "tooling news",
    "CNC machining articles",
    "dies and moulds",
    "factory automation",
    "Industry 4.0",
    "cutting tools",
    "metrology",
  ],
})

async function getPosts() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/posts?limit=100`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    const posts = Array.isArray(data) ? data : data.data || []
    return posts.sort(
      (a: { publishedAt?: string }, b: { publishedAt?: string }) =>
        new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
    )
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/categories`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : data.data || []
  } catch {
    return []
  }
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()])

  return (
    <>
      <JsonLd
        data={collectionJsonLd({
          name: "Manufacturing & Tooling Blog",
          description:
            "Articles and news on tooling, machining, mould making, and manufacturing technology.",
          path: "/blog",
          itemUrls: posts
            .slice(0, 20)
            .filter((post: { slug?: string }) => post.slug)
            .map((post: { slug: string }) => absoluteUrl(`/post/${post.slug}`)),
        })}
      />
      <BlogListing initialPosts={posts} initialCategories={categories} />
    </>
  )
}

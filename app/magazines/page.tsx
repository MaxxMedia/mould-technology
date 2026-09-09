import MagazineWithCoverStory from "@/components/magazine/MagazineWithCoverStory"
import MagazineArchive from "@/components/magazine/MagazineArchive"
import InThisIssue from "@/components/magazine/InThisIssue"
import JsonLd from "@/components/seo/JsonLd"
import type { Post } from "@/types/Post"
import {
  absoluteUrl,
  collectionJsonLd,
  getBackendUrl,
  listingMetadata,
} from "@/lib/seo"

export const dynamic = "force-dynamic"

export const metadata = listingMetadata({
  title: "Tooling & Manufacturing Magazine",
  description:
    "Read the latest Tooling Trends magazine issues covering CNC machining, dies and moulds, cutting tools, metrology, CAD/CAM, and factory automation.",
  path: "/magazines",
  keywords: [
    "manufacturing magazine",
    "tooling magazine",
    "CNC machining magazine",
    "dies and moulds",
    "industrial magazine",
    "factory automation",
    "Industry 4.0 magazine",
  ],
})

function asArray(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data
    if (Array.isArray(data)) return data
  }
  return []
}

async function getIssuePosts(): Promise<Post[]> {
  try {
    const res = await fetch(
      `${getBackendUrl()}/api/posts?category=in-this-issue&limit=100`,
      { cache: "no-store" }
    )
    if (!res.ok) return []
    const data = await res.json()
    return asArray(data).sort((a: Post, b: Post) => {
      const aTime = new Date(a.createdAt || 0).getTime()
      const bTime = new Date(b.createdAt || 0).getTime()
      return bTime - aTime
    })
  } catch {
    return []
  }
}

async function getMagazines() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/magazines`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return asArray(data).sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime()
      const bTime = new Date(b.createdAt || 0).getTime()
      return bTime - aTime
    })
  } catch {
    return []
  }
}

export default async function MagazinesPage() {
  const [posts, magazines] = await Promise.all([getIssuePosts(), getMagazines()])
  const latestMagazine = magazines[0] ?? null

  return (
    <>
      <JsonLd
        data={collectionJsonLd({
          name: "Tooling & Manufacturing Magazine",
          description:
            "Digital magazine issues on tooling, machining, mould making, and manufacturing technology.",
          path: "/magazines",
          itemUrls: magazines
            .slice(0, 20)
            .filter((item: { slug?: string }) => item.slug)
            .map((item: { slug: string }) => absoluteUrl(`/magazines/${item.slug}`)),
        })}
      />
      <div className="space-y-16">
        <div className="max-w-[1320px] mx-auto px-4 pt-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#003B5C]">
            Tooling Trends Manufacturing Magazine
          </h1>
          <p className="mt-3 max-w-3xl text-gray-600">
            Browse the latest digital issues on CNC machining, dies and moulds,
            cutting tools, metrology, CAD/CAM, and factory automation.
          </p>
        </div>

        <MagazineWithCoverStory initialMagazine={latestMagazine} />
        <InThisIssue posts={posts} />
        <MagazineArchive initialMagazines={magazines} />
      </div>
    </>
  )
}

import JsonLd from "@/components/seo/JsonLd"
import {
  absoluteUrl,
  collectionJsonLd,
  getBackendUrl,
  listingMetadata,
} from "@/lib/seo"
import PublicFeedPage from "./FeedClient"

export const dynamic = "force-dynamic"

export const metadata = listingMetadata({
  title: "Manufacturing Jobs & Careers",
  description:
    "Browse manufacturing, CNC machining, tooling, automation, and engineering jobs from employers worldwide on the Tooling Trends hiring platform.",
  path: "/feed",
  keywords: [
    "manufacturing jobs",
    "CNC jobs",
    "tooling careers",
    "engineering jobs",
    "factory automation jobs",
    "mould maker jobs",
    "industrial hiring",
  ],
})

async function getJobs() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/jobs?page=1&limit=50`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    if (Array.isArray(data)) return data
    return data.jobs ?? data.data ?? []
  } catch {
    return []
  }
}

export default async function FeedPage() {
  const jobs = await getJobs()

  return (
    <>
      <JsonLd
        data={collectionJsonLd({
          name: "Manufacturing Jobs & Careers",
          description:
            "Manufacturing, tooling, CNC, and industrial technology job listings.",
          path: "/feed",
          itemUrls: jobs
            .slice(0, 20)
            .filter((job: { slug?: string }) => job.slug)
            .map((job: { slug: string }) => absoluteUrl(`/jobs/${job.slug}`)),
        })}
      />
      <PublicFeedPage initialJobs={jobs} />
    </>
  )
}

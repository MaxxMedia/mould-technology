import { Suspense } from "react"
import JsonLd from "@/components/seo/JsonLd"
import {
  absoluteUrl,
  collectionJsonLd,
  getBackendUrl,
  listingMetadata,
} from "@/lib/seo"
import EventsContent from "./EventsContent"

export const dynamic = "force-dynamic"

export const metadata = listingMetadata({
  title: "Manufacturing Events & Trade Shows",
  description:
    "Discover tooling, CNC, dies and moulds, automation, and manufacturing trade shows, conferences, and industry events on Tooling Trends.",
  path: "/events",
  keywords: [
    "manufacturing events",
    "tooling trade shows",
    "CNC exhibitions",
    "dies and moulds events",
    "factory automation conferences",
    "industrial trade fairs",
    "manufacturing webinars",
  ],
})

async function getEvents() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/events`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    if (Array.isArray(data)) return data
    return data.data ?? []
  } catch {
    return []
  }
}

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <>
      <JsonLd
        data={collectionJsonLd({
          name: "Manufacturing Events & Trade Shows",
          description:
            "Upcoming exhibitions, conferences, and trade shows in tooling and manufacturing.",
          path: "/events",
          itemUrls: events
            .slice(0, 20)
            .filter((item: { slug?: string }) => item.slug)
            .map((item: { slug: string }) => absoluteUrl(`/events/${item.slug}`)),
        })}
      />
      <Suspense
        fallback={
          <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f5b78] mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading events...</p>
            </div>
          </div>
        }
      >
        <EventsContent initialEvents={events} />
      </Suspense>
    </>
  )
}

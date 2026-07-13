import Image from "next/image"
import Link from "next/link"
import Banner from "@/components/Banners/Banner"

type Event = {
  id: number
  title: string
  slug: string
  logoUrl?: string
  bannerUrl?: string
  startDate: string
  endDate: string
  location?: string
  description: string
  registerUrl?: string
}

/**
 * ✅ Safe server-side fetch (no Invalid URL ever)
 */
async function getEvents(search?: string): Promise<Event[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const url = new URL("/api/events", baseUrl)

  if (search) {
    url.searchParams.set("q", search)
  }

  const res = await fetch(url.toString(), {
    cache: "no-store",
  })

  if (!res.ok) {
    console.error("Failed to fetch events:", res.status)
    return []
  }

  return res.json()
}

/**
 * ⚠️ searchParams is ASYNC in Next.js App Router
 */
type PageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function EventsPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams

  const events = await getEvents(q)
  const featuredEvent = events[0]

  return (
    <div className="w-full">

      {/* ================= HERO SECTION ================= */}
      {featuredEvent?.bannerUrl && (
        <div className="relative w-full h-[360px]">
          <Image
            src={featuredEvent.bannerUrl}
            alt={featuredEvent.title}
            fill
            className="object-cover"
            priority
          />

          {/* <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-white p-8 max-w-md text-center shadow-lg">
              {featuredEvent.logoUrl && (
                <Image
                  src={featuredEvent.logoUrl}
                  alt={featuredEvent.title}
                  width={220}
                  height={120}
                  className="mx-auto mb-4 object-contain"
                />
              )}

              <p className="text-sm text-gray-600 mb-1">
                {new Date(featuredEvent.startDate).toLocaleDateString()} –{" "}
                {new Date(featuredEvent.endDate).toLocaleDateString()}
              </p>

              <h2 className="text-xl font-bold mb-2">
                {featuredEvent.title}
              </h2>

              {featuredEvent.location && (
                <p className="text-sm mb-4">
                  {featuredEvent.location}
                </p>
              )}

              {featuredEvent.registerUrl && (
                <Link
                  href={featuredEvent.registerUrl}
                  className="inline-block bg-red-600 text-white px-6 py-2"
                >
                  REGISTER NOW
                </Link>
              )}
            </div>
          </div> */}
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT: EVENTS LIST */}
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold mb-6">
            Find an Event
          </h1>

          {/* SEARCH FORM */}
          <form className="border-b pb-6 mb-8 flex gap-4">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search events by title"
              className="border px-4 py-2 w-full max-w-md"
            />
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2"
            >
              GO
            </button>
          </form>

          <h2 className="text-2xl font-semibold mb-6">
            Upcoming Events
          </h2>

          {events.length === 0 ? (
            <p>No events found.</p>
          ) : (
            <div className="space-y-10">
              {events.map(event => (
                <div
                  key={event.id}
                  className="flex flex-col md:flex-row gap-6 border-b pb-8"
                >
                  <Link href={`/events/${event.slug}`}>
                    <div className="w-full md:w-60 flex-shrink-0">
                      {event.logoUrl ? (
                        <Image
                          src={event.logoUrl}
                          alt={event.title}
                          width={240}
                          height={140}
                          className="object-contain border"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">
                      {new Date(event.startDate).toLocaleDateString()} –{" "}
                      {new Date(event.endDate).toLocaleDateString()}
                    </p>

                    <h3 className="text-xl font-semibold mb-2">
                      <Link
                        href={`/events/${event.slug}`}
                        className="hover:underline"
                      >
                        {event.title}
                      </Link>
                    </h3>

                    <p className="text-gray-700 mb-2 line-clamp-3">
                      {event.description}
                    </p>

                    {event.location && (
                      <p className="text-sm text-gray-500">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: ADS */}
        <aside className="lg:col-span-4">
          <Banner placement="EVENT_RIGHT" />
        </aside>
      </div>
    </div>
    
  )
}
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin, Globe, Mail, Phone } from "lucide-react"
import SupplierAds from "@/components/SupplierAds"
import EventViewTracker from "@/components/events/EventViewTracker"
import EventEnquireForm from "@/components/events/Eventenquireform"
import EventTabs from "@/components/events/Eventtabs"

type Event = {
  id: number
  title: string
  slug: string
  logoUrl?: string
  bannerUrl?: string
  startDate: string
  endDate: string
  timings?: string
  location?: string
  description: string
  websiteUrl?: string
  calendarUrl?: string
  email?: string
  phone?: string
  images?: string[]
  videoUrl?: string
  frequency?: string
  edition?: string
  expectedVisitors?: string
  exhibitors?: string
  organizer?: string
  highlights?: string[]
  mapEmbedUrl?: string
  mapUrl?: string
}

type UpcomingEvent = {
  id: number
  title: string
  slug: string
  bannerUrl?: string
  startDate: string
  endDate: string
  location?: string
}

async function getEvent(slug: string): Promise<Event | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${slug}`, {
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json()
}

async function getUpcomingEvents(excludeSlug: string): Promise<UpcomingEvent[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
    cache: "no-store",
  })
  if (!res.ok) return []
  const events: UpcomingEvent[] = await res.json()
  return events.filter(e => e.slug !== excludeSlug).slice(0, 2)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
}

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-10">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    )
  }

  const upcomingEvents = await getUpcomingEvents(slug)

  return (
    <div className="w-full bg-gray-50">
      <EventViewTracker slug={slug} />

      {/* ================= HEADER ================= */}
      <div className="relative bg-gradient-to-r from-[#1a6d8a] via-[#3a3a3a] to-[#c73b4f] text-white overflow-hidden">
        {event.bannerUrl && (
          <Image src={event.bannerUrl} alt={event.title} fill className="object-cover opacity-20" priority />
        )}
        <div className="relative max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center gap-6">
          {event.logoUrl && (
            <div className="bg-white p-2 rounded-lg w-24 flex-shrink-0">
              <Image src={event.logoUrl} alt={event.title} width={90} height={50} className="object-contain" />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{event.title}</h1>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-2">
              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(event.startDate)} – {formatDate(event.endDate)}
              </span>
              {event.timings && (
                <span className="flex items-center gap-2">
                  <Clock size={14} />
                  {event.timings}
                </span>
              )}
            </div>

            {event.location && (
              <span className="flex items-center gap-2 text-sm">
                <MapPin size={14} />
                {event.location}
              </span>
            )}
          </div>

          <div className="text-sm space-y-2 md:text-right">
            {event.websiteUrl && (
              <span className="flex md:justify-end items-center gap-2">
                <Globe size={14} />
                {event.websiteUrl.replace(/^https?:\/\//, "")}
              </span>
            )}
            {event.email && (
              <span className="flex md:justify-end items-center gap-2">
                <Mail size={14} />
                {event.email}
              </span>
            )}
            {event.phone && (
              <span className="flex md:justify-end items-center gap-2">
                <Phone size={14} />
                {event.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ================= BREADCRUMB ================= */}
      <div className="max-w-7xl mx-auto px-6 pt-4 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/events" className="hover:underline">Events</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">{event.title}</span>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        <main className="lg:col-span-8">
          <EventTabs event={event} />
        </main>

        <aside className="lg:col-span-4 space-y-6">

          {/* LOCATION */}
          {event.location && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-semibold">Location</h3>
                <Link
                  href={event.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  className="text-xs text-[#0f5b78] hover:underline"
                >
                  Open in Maps ↗
                </Link>
              </div>
              <iframe
                src={
                  event.mapEmbedUrl ||
                  `https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`
                }
                className="w-full h-56 border-0"
                loading="lazy"
              />
            </div>
          )}

          {/* ENQUIRE FORM */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Enquire Form</h3>
            <EventEnquireForm slug={slug} />
          </div>

          {/* UPCOMING EVENTS */}
          {upcomingEvents.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#0f5b78] border-b-2 border-[#0f5b78] inline-block pb-1 mb-4">
                Upcoming Events
              </h3>
              <div className="space-y-4">
                {upcomingEvents.map((e, i) => (
                  <Link key={e.id} href={`/events/${e.slug}`} className="block">
                    {e.bannerUrl && (
                      <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2">
                        <Image src={e.bannerUrl} alt={e.title} fill className="object-cover" />
                      </div>
                    )}
                    <p className="text-sm font-semibold text-gray-900 mb-1">{e.title}</p>
                    <p className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Calendar size={12} />
                      {formatDate(e.startDate)}
                    </p>
                    {e.location && (
                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin size={12} />
                        {e.location}
                      </p>
                    )}
                    {i < upcomingEvents.length - 1 && <hr className="mt-4" />}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <SupplierAds />
        </aside>
      </div>
    </div>
  )
}
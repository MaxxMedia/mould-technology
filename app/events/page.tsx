import Image from "next/image"
import Link from "next/link"
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  Users,
  CalendarCheck,
  Globe2,
} from "lucide-react"

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
  tags?: string[]
  featured?: boolean
  timings?: string
}

async function getEvents(search?: string): Promise<Event[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  const url = new URL("/api/events", baseUrl)
  if (search) url.searchParams.set("q", search)

  const res = await fetch(url.toString(), { cache: "no-store" })

  if (!res.ok) {
    console.error("Failed to fetch events:", res.status)
    return []
  }

  return res.json()
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
  const e = new Date(end).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
  return `${s} – ${e}`
}

type PageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function EventsPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams
  const events = await getEvents(q)

  return (
    <div className="w-full bg-gray-50">
      {/* ================= HERO ================= */}
      <div className="relative bg-[#0b1f4d] text-white">
        <div className="absolute inset-0 bg-[#0b1f4d]/85" />
        <div className="relative max-w-7xl mx-auto px-6 py-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-4xl font-bold mb-3">Events</h1>
            <p className="text-blue-100 max-w-xl">
              Discover the best exhibitions, conferences and trade shows in the tooling and manufacturing industry.
            </p>
          </div>

          <div className="flex gap-10">
            <StatBlock icon={<Calendar size={26} />} value="50+" label="Upcoming Events" />
            <StatBlock icon={<Globe2 size={26} />} value="15+" label="Countries" />
            <StatBlock icon={<Users size={26} />} value="10,000+" label="Industry Visitors" />
          </div>
        </div>
      </div>

      {/* ================= BREADCRUMB ================= */}
      <div className="max-w-7xl mx-auto px-6 pt-4 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">Events</span>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT: FILTERS + EVENTS LIST */}
        <div className="lg:col-span-8">

          {/* FILTER BAR */}
          <form className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search events by name, venue or keyword..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option>All Categories</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option>All Locations</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option>Date (Newest First)</option>
            </select>
          </form>

          <div className="flex items-center justify-between mb-6 text-sm">
            <span className="text-gray-500">Showing 1 to {events.length} of {events.length} events</span>
            <button type="button" className="text-indigo-600 font-medium hover:underline">
              Clear Filters
            </button>
          </div>

          {/* EVENT CARDS */}
          {events.length === 0 ? (
            <p className="text-gray-500">No events found.</p>
          ) : (
            <div className="space-y-5">
              {events.map((event, i) => (
                <div
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-5 relative"
                >
                  <Link href={`/events/${event.slug}`} className="w-full md:w-56 h-36 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                    {event.logoUrl || event.bannerUrl ? (
                      <Image
                        src={event.logoUrl || event.bannerUrl!}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded">
                        FEATURED
                      </span>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link href={`/events/${event.slug}`} className="hover:underline">
                          {event.title}
                        </Link>
                      </h3>
                      <button type="button" aria-label="Save event" className="text-gray-300 hover:text-yellow-400">
                        <Star size={18} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {formatDateRange(event.startDate, event.endDate)}
                      </span>
                      {event.timings && (
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {event.timings}
                        </span>
                      )}
                    </div>

                    {event.location && (
                      <p className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <MapPin size={13} />
                        {event.location}
                      </p>
                    )}

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex flex-wrap gap-2">
                        {(event.tags ?? []).map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/events/${event.slug}`}
                        className="bg-[#0b1f4d] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0b1f4d]/90"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3].map(p => (
              <button
                key={p}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                  p === 1
                    ? "bg-red-600 text-white"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <span className="text-gray-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              5
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className="lg:col-span-4 space-y-6">

          {/* CALENDAR */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-[#0b1f4d] text-white text-sm font-semibold px-4 py-3">
              Event Calendar
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <ChevronLeft size={16} className="text-gray-400" />
                <span className="text-sm font-medium">May 2025</span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 3 // offset so 1st falls on Thursday, matching mockup
                  const inMonth = day >= 1 && day <= 31
                  const isToday = day === 29
                  return (
                    <span
                      key={i}
                      className={`h-7 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-[#0b1f4d] text-white"
                          : inMonth
                          ? "text-gray-700"
                          : "text-gray-300"
                      }`}
                    >
                      {((day - 1 + 31) % 31) + 1}
                    </span>
                  )
                })}
              </div>
              <button className="w-full mt-4 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">
                View Full Calendar
              </button>
            </div>
          </div>

          {/* SUBSCRIBE */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">Subscribe to Updates</h3>
            <p className="text-xs text-gray-500 mb-3">
              Get the latest updates on upcoming events and industry news.
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="w-full bg-red-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700">
              Subscribe
            </button>
          </div>

          {/* POPULAR CATEGORIES */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Popular Categories</h3>
            <ul className="space-y-2 text-sm">
              {[
                ["Tooling", 12],
                ["Machine Tools", 10],
                ["Die & Mould", 8],
                ["Automation", 7],
                ["Precision Engineering", 6],
                ["Metrology", 5],
              ].map(([label, count]) => (
                <li key={label as string} className="flex items-center justify-between text-gray-600">
                  <span>{label}</span>
                  <span className="text-gray-400">{count}</span>
                </li>
              ))}
            </ul>
            <button className="text-indigo-600 text-sm font-medium mt-3 hover:underline">
              View All Categories →
            </button>
          </div>

          {/* LIST YOUR EVENT */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <CalendarPlus size={22} className="text-gray-500" />
              <div>
                <h3 className="text-sm font-semibold">List Your Event</h3>
                <p className="text-xs text-gray-500">
                  Reach thousands of targeted industry professionals.
                </p>
              </div>
            </div>
            <Link
              href="/events/create"
              className="block text-center border border-red-500 text-red-600 text-sm font-medium py-2 rounded-lg mt-2 hover:bg-red-50"
            >
              List Your Event
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function StatBlock({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-1">{icon}</div>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-blue-100">{label}</span>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  Users,
  Globe2,
} from "lucide-react"
import EventCalendar from "@/components/events/Eventcalendar"
import { getApiUrl } from "@/lib/apiUrl"

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
  industryId?: number
}

type Industry = {
  id: number
  name: string
}

// ================= SUBSCRIBE FORM COMPONENT =================
function SubscribeForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            fullName: "",
            companyName: "",
            frequency: "MONTHLY",
            emailSubscribed: true,
            whatsappSubscribed: false,
            smsSubscribed: false,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Subscription failed")
      }

      setMessage({ type: "success", text: "Successfully subscribed! Thank you." })
      setEmail("")

      setTimeout(() => {
        setMessage(null)
      }, 5000)
    } catch (error: any) {
      console.error("Subscription error:", error)
      setMessage({ type: "error", text: error.message || "Failed to subscribe. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-2">Subscribe to Updates</h3>
      <p className="text-xs text-gray-500 mb-3">
        Get the latest updates on upcoming events and industry news.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#0f5b78]"
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#b30f24] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#b30f24]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subscribing...
            </span>
          ) : (
            "Subscribe"
          )}
        </button>
      </form>

      {message && (
        <div
          className={`mt-3 p-2 rounded text-xs ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}

export default function EventsContent() {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")

  const [events, setEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 10

  useEffect(() => {
    fetchEvents()
    fetchIndustries()
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [dateParam, searchQuery, selectedIndustry])

  const fetchIndustries = async () => {
    try {
      const baseUrl = getApiUrl()
      const res = await fetch(`${baseUrl}/api/industries`)
      if (!res.ok) {
        setIndustries([])
        return
      }
      const data = await res.json()
      setIndustries(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      console.error("Error fetching industries:", error)
      setIndustries([])
    }
  }

  const fetchEvents = async (search?: string, industryId?: string) => {
    setLoading(true)
    try {
      const baseUrl = getApiUrl()
      const url = new URL("/api/events", baseUrl)
      if (search) url.searchParams.set("q", search)
      if (industryId) url.searchParams.set("industryId", industryId)

      const res = await fetch(url.toString())
      if (!res.ok) {
        console.error("Failed to fetch events:", res.status)
        setEvents([])
        setAllEvents([])
        return
      }

      const data = await res.json()
      setAllEvents(data)
      setEvents(data)
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
      setAllEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchEvents(searchQuery, selectedIndustry)
  }

  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value)
    fetchEvents(searchQuery, value)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedIndustry("")
    window.location.href = "/events"
  }

  // Filter events by date from URL param
  const filteredEvents = dateParam
    ? events.filter((e) => isOnDate(e, dateParam))
    : events

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)
  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      document.getElementById("events-list")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      pageNumbers.push(1)

      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 2) {
        end = 4
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3
      }

      if (start > 2) {
        pageNumbers.push("...")
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i)
      }

      if (end < totalPages - 1) {
        pageNumbers.push("...")
      }

      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const calendarEvents = allEvents.map((e) => ({
    startDate: e.startDate,
    endDate: e.endDate,
  }))

  // Category counts for the Popular Categories sidebar, derived from
  // the currently loaded events (client-side, since the industries
  // endpoint only returns id/name, not counts).
  const industryCounts = allEvents.reduce<Record<number, number>>((acc, e) => {
    if (e.industryId != null) {
      acc[e.industryId] = (acc[e.industryId] || 0) + 1
    }
    return acc
  }, {})

  const popularIndustries = industries
    .map((ind) => ({ ...ind, count: industryCounts[ind.id] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return (
    <div className="w-full bg-gray-50">
      {/* HERO */}
      <div className="bg-gradient-to-br from-[#0f5b78] via-black to-[#b30f24] text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
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

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-6 pt-4 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">Events</span>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-8">
          {/* FILTER BAR */}
          <form
            onSubmit={handleSearch}
            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 mb-4"
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by name, venue or keyword..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm"
              />
            </div>

            {/* <select
              value={selectedIndustry}
              onChange={(e) => handleIndustryChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white md:w-56"
            >
              <option value="">All Categories</option>
              {industries.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select> */}

            <button type="submit" className="bg-[#0f5b78] text-white px-5 py-2 rounded-lg">
              Search
            </button>
          </form>

          <div className="flex items-center justify-between mb-6 text-sm">
            <span className="text-gray-500">
              {dateParam
                ? `Showing ${filteredEvents.length} event${filteredEvents.length === 1 ? "" : "s"} on ${new Date(
                    dateParam
                  ).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`
                : `Showing ${indexOfFirstEvent + 1} to ${Math.min(indexOfLastEvent, filteredEvents.length)} of ${
                    filteredEvents.length
                  } events`}
            </span>
            <button onClick={handleClearFilters} className="text-[#0f5b78] font-medium hover:underline">
              Clear Filters
            </button>
          </div>

          {/* EVENT CARDS */}
          <div id="events-list">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f5b78]"></div>
              </div>
            ) : currentEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                No events found{dateParam ? " on this date" : ""}.
              </p>
            ) : (
              <div className="space-y-5">
                {currentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-5 relative hover:shadow-lg transition-shadow duration-200"
                  >
                    <Link
                      href={`/events/${event.slug}`}
                      className="w-full md:w-56 h-36 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100"
                    >
                      {event.logoUrl || event.bannerUrl ? (
                        <Image src={event.logoUrl || event.bannerUrl!} alt={event.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}
                      {event.featured && (
                        <span className="absolute top-2 left-2 bg-[#b30f24] text-white text-[10px] font-semibold px-2 py-1 rounded">
                          FEATURED
                        </span>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          <Link href={`/events/${event.slug}`} className="hover:underline hover:text-[#0f5b78]">
                            {event.title}
                          </Link>
                        </h3>
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

                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{event.description}</p>

                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex flex-wrap gap-2">
                          {(event.tags ?? []).slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {(event.tags ?? []).length > 3 && (
                            <span className="text-xs text-gray-400">+{(event.tags ?? []).length - 3} more</span>
                          )}
                        </div>
                        <Link
                          href={`/events/${event.slug}`}
                          className="bg-[#0f5b78] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0f5b78]/90 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {filteredEvents.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === "number" && goToPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? "bg-[#0f5b78] text-white"
                      : page === "..."
                      ? "border-0 cursor-default"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                  disabled={page === "..."}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors ${
                  currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className="lg:col-span-4 space-y-6">
          {/* CALENDAR */}
          <EventCalendar events={calendarEvents} />

          {/* SUBSCRIBE FORM */}
          <SubscribeForm />

          {/* POPULAR CATEGORIES */}
          {/* {popularIndustries.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">Popular Categories</h3>
              <ul className="space-y-2 text-sm">
                {popularIndustries.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleIndustryChange(String(item.id))}
                      className="w-full flex items-center justify-between text-gray-600 hover:text-[#0f5b78] transition-colors"
                    >
                      <span>{item.name}</span>
                      <span className="text-gray-400">{item.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <Link href="/suppliers">
                <button className="text-[#0f5b78] text-sm font-medium mt-3 hover:underline">
                  View All Categories →
                </button>
              </Link>
            </div>
          )} */}

          {/* LIST YOUR EVENT */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <CalendarPlus size={22} className="text-gray-500" />
              <div>
                <h3 className="text-sm font-semibold">List Your Event</h3>
                <p className="text-xs text-gray-500">Reach thousands of targeted industry professionals.</p>
              </div>
            </div>
            <Link
              href="/contact"
              className="block text-center border border-[#b30f24] text-[#b30f24] text-sm font-medium py-2 rounded-lg mt-2 hover:bg-red-50 transition-colors"
            >
              List Your Event
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function StatBlock({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-1">{icon}</div>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-blue-100">{label}</span>
    </div>
  )
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
  const e = new Date(end).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
  return `${s} – ${e}`
}

function normalizeDate(date: string | Date) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split("-").map(Number)
    return new Date(y, m - 1, d).getTime()
  }
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function isOnDate(event: Event, dateStr: string) {
  const selected = normalizeDate(dateStr)
  const start = normalizeDate(event.startDate)
  const end = normalizeDate(event.endDate)
  return selected >= start && selected <= end
}
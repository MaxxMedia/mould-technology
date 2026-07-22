"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type Job = {
  id: number
  title: string
  slug: string
  description: string
  location: string
  country?: string
  createdAt: string
  employmentType?: string
  category?: string
  remote?: boolean
  salaryMin?: number
  salaryMax?: number
  views: number
  Company?: {
    name: string
    slug: string
  }
}

export type JobFilters = {
  type?: string
  category?: string
  remote?: boolean
  location?: string
}

const PAGE_SIZE = 10

// Normalizes strings like "Full-time" / "full_time" / "FULL TIME" so they
// compare equal regardless of formatting differences between filter values
// and whatever the API actually returns.
function normalize(value?: string) {
  return (value || "").toLowerCase().replace(/[\s_-]+/g, "")
}

export default function JobFeed({
  isPublic = false,
  filters,
}: {
  isPublic?: boolean
  filters?: JobFilters
}) {
  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  // Debounce free-text location input so filtering doesn't refire on every keystroke
  const [debouncedLocation, setDebouncedLocation] = useState(filters?.location || "")

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedLocation(filters?.location || "")
    }, 400)
    return () => clearTimeout(handle)
  }, [filters?.location])

  // Fetch the full job list once. We filter/paginate client-side below so
  // filtering works reliably regardless of what the API supports server-side.
  useEffect(() => {
    async function loadAllJobs() {
      setLoading(true)

      let page = 1
      let totalPages = 1
      let collected: Job[] = []

      try {
        do {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/jobs?page=${page}&limit=100`,
            { cache: "no-store" }
          )
          const data = await res.json()

          if (data.jobs) {
            collected = collected.concat(data.jobs)
            totalPages = data.pagination?.totalPages || 1
          } else {
            collected = collected.concat(Array.isArray(data) ? data : [])
            totalPages = 1
          }

          page++
        } while (page <= totalPages)
      } catch (err) {
        console.error("Failed to load jobs:", err)
      }

      setAllJobs(collected)
      setLoading(false)
    }

    loadAllJobs()
  }, [])

  // Job records here often only store a bare city name ("Bengaluru"), with
  // no state/country attached — so searching "Karnataka" or "India" has
  // nothing to match against. We resolve each unique job location to its
  // full address (city, state, country) once via Nominatim, cache the
  // result in localStorage, and match search queries against that too.
  const LOCATION_CACHE_KEY = "jobLocationGeocodeCache"
  const [locationCache, setLocationCache] = useState<Record<string, string>>({})

  useEffect(() => {
    if (allJobs.length === 0) return

    let cache: Record<string, string> = {}
    try {
      cache = JSON.parse(localStorage.getItem(LOCATION_CACHE_KEY) || "{}")
    } catch {
      cache = {}
    }

    // Show whatever's already cached immediately
    setLocationCache({ ...cache })

    const uniqueLocations = Array.from(
      new Set(allJobs.map((j) => j.location).filter(Boolean))
    )
    const toResolve = uniqueLocations.filter((loc) => !cache[loc])

    if (toResolve.length === 0) return

    let cancelled = false

    async function resolveLocations() {
      for (const loc of toResolve) {
        if (cancelled) break

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
              loc
            )}`,
            { headers: { Accept: "application/json" } }
          )
          const data = await res.json()
          cache[loc] = data?.[0]?.display_name || loc
        } catch {
          cache[loc] = loc
        }

        if (!cancelled) setLocationCache({ ...cache })

        // Respect Nominatim's usage policy of ~1 request/second
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      if (!cancelled) {
        try {
          localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cache))
        } catch {
          // ignore storage errors (e.g. quota, private browsing)
        }
      }
    }

    resolveLocations()

    return () => {
      cancelled = true
    }
  }, [allJobs])

  // Reset to page 1 whenever the filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters?.type, filters?.category, filters?.remote, debouncedLocation])

  // Apply all filters client-side
  const filteredJobs = useMemo(() => {
    const locationQuery = debouncedLocation.trim().toLowerCase()

    return allJobs.filter((job) => {
      if (filters?.type && normalize(job.employmentType) !== normalize(filters.type)) {
        return false
      }

      if (filters?.category && normalize(job.category) !== normalize(filters.category)) {
        return false
      }

      if (filters?.remote) {
        const isRemote =
          job.remote === true || job.location?.toLowerCase().includes("remote")
        if (!isRemote) return false
      }

      if (locationQuery) {
        const resolved = locationCache[job.location] || ""
        const haystack = `${job.location || ""} ${job.country || ""} ${resolved}`.toLowerCase()

        // The selected suggestion can be a full address like
        // "Kerala, India" or "Bengaluru, Bangalore North, Bengaluru Urban,
        // Karnataka, India". Every comma-separated part of the query must be
        // present in the job's location (including its geocoded state/
        // country) — using ANY-match here would let a broad "India" match
        // mask a mismatched state like "Kerala" vs a job actually in
        // Karnataka.
        const queryTokens = locationQuery
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)

        const matches = queryTokens.every(
          (token) => haystack.includes(token) || token.includes(haystack.trim())
        )

        if (!matches) return false
      }

      return true
    })
  }, [allJobs, filters?.type, filters?.category, filters?.remote, debouncedLocation, locationCache])

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE))
  const pagedJobs = filteredJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  // Short form used on the card ("4h", "1d") to match reference design
  function getShortTimeAgo(createdAt: string) {
    const created = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()

    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 60) return `${Math.max(diffMinutes, 1)}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}d`
  }

  function formatSalary(min?: number, max?: number) {
    if (!min && !max) return null
    const fmt = (n: number) => `$${n.toLocaleString()}`
    if (min && max) return `${fmt(min)} - ${fmt(max)}`
    if (min) return `${fmt(min)}+`
    if (max) return `Up to ${fmt(max)}`
    return null
  }

  const locationQuery = debouncedLocation.trim()
  const isResolvingLocations =
    !!locationQuery &&
    allJobs.some((j) => j.location && !(j.location in locationCache))

  if (loading) {
    return <div className="p-10">Loading jobs...</div>
  }

  if (!loading && filteredJobs.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500 bg-white rounded-md shadow-sm">
        No jobs match your filters. Try adjusting them.
        {isResolvingLocations && (
          <p className="text-xs text-gray-400 mt-2">
            Still refining location matches…
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      <main className="space-y-3">
        {pagedJobs.map(job => {
          const salary = formatSalary(job.salaryMin, job.salaryMax)

          return (
            <div
              key={job.id}
              onClick={() => router.push(`/jobs/${job.slug}`)}
              className="bg-[#fafbfc] hover:bg-white hover:shadow-sm border border-gray-100 rounded-md px-5 py-4 transition cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                {/* LEFT: company / title / type + salary */}
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 truncate">
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        if (job.Company?.slug) {
                          router.push(`/company/${job.Company.slug}`)
                        }
                      }}
                      className="font-semibold text-gray-900 hover:underline"
                    >
                      {job.Company?.name || "Company"}
                    </span>{" "}
                    is hiring
                  </p>

                  <h2 className="text-lg md:text-xl font-bold text-red-500 mt-0.5 truncate">
                    {job.title}
                  </h2>

                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mt-2 flex flex-wrap gap-x-3">
                    <span>{job.employmentType || "Full Time"}</span>
                    {salary && <span>{salary}</span>}
                  </p>
                </div>

                {/* RIGHT: location/country + time ago */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {job.location}
                    {job.country ? ` • ${job.country}` : ""}
                  </p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    {getShortTimeAgo(job.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </main>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={page === currentPage}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  )
}
"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import type { Post } from "../types/Post"
import SupplierAds from "./SupplierAds"

const ROTATE_INTERVAL = 6000
const PAGE_SIZE = 6 // 3 rows × 2 cols

const BADGE_COLORS: Record<string, string> = {
  FEATURED: "bg-[#E11D48]",
  WEBINAR: "bg-[#7C3AED]",
  EVENT:    "bg-[#0EA5E9]",
  TRENDING: "bg-[#F97316]",
  EXCLUSIVE:"bg-[#059669]",
}

const CATEGORY_COLORS: Record<string, string> = {
  gaming:         "bg-[#0073FF]",
  fashion:        "bg-[#E033E0]",
  "latest-issue": "bg-[#F69C00]",
  tech:           "bg-[#22C55E]",
  politics:       "bg-[#EF4444]",
  travel:         "bg-[#0EA5E9]",
}

export default function HomeCompanyArticles() {
  const [allPosts, setAllPosts]   = useState<Post[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [fade, setFade]           = useState(true)
  const [paused, setPaused]       = useState(false)
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── Fetch ── */
  useEffect(() => {
    ;(async () => {
      try {
        const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles/approved`)
        const data = await res.json()
        setAllPosts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Failed to load approved articles", err)
      }
    })()
  }, [])

  /* ── Total pages ── */
  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)

  /* ── Visible slice ── */
  const visiblePosts = useMemo(() => {
    if (!allPosts.length) return []
    const start = pageIndex * PAGE_SIZE
    return Array.from({ length: PAGE_SIZE }, (_, i) =>
      allPosts[(start + i) % allPosts.length]
    )
  }, [allPosts, pageIndex])

  /* ── Auto-rotate ── */
  const goToPage = (next: number) => {
    setFade(false)
    setTimeout(() => {
      setPageIndex(next % (totalPages || 1))
      setFade(true)
    }, 300)
  }

  useEffect(() => {
    if (totalPages <= 1 || paused) return
    timerRef.current = setInterval(() => {
      goToPage((pageIndex + 1) % totalPages)
    }, ROTATE_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [totalPages, pageIndex, paused])

  if (!visiblePosts.length) return null

  return (
    <section className="pt-4 sm:pt-8 w-full">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex gap-8">

          {/* ══ LEFT: Articles ══ */}
          <div
            className="flex-1 min-w-0"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >

            {/* Heading */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#121213]">Featured Post</h2>
              <Link
                href="/articles"
                className="text-sm font-medium text-[#616C74] hover:text-[#0073FF] transition flex items-center gap-1"
              >
                View All →
              </Link>
            </div>

            {/* Grid 2 × 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {visiblePosts.map((post, i) => {
                const slug         = typeof post.category === "object" ? post.category?.slug || "" : ""
                const categoryName = typeof post.category === "object" ? post.category?.name || "" : ""
                const badge        = post.badge?.trim()
                const tagText      = badge || categoryName

                let tagClass = "bg-[#9CA3AF]"
                if (badge) {
                  tagClass = BADGE_COLORS[badge.toUpperCase()] || "bg-[#6B7280]"
                } else {
                  const match = Object.keys(CATEGORY_COLORS).find((k) =>
                    slug.toLowerCase().includes(k)
                  )
                  if (match) tagClass = CATEGORY_COLORS[match]
                }

                const imageUrl = post.imageUrl?.startsWith("http")
                  ? post.imageUrl
                  : `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`

                const formattedDate = post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })
                  : ""

                return (
                  <article
                    key={`${post.id}-${i}`}
                    className={`bg-white rounded-md overflow-hidden border border-[#F0F0F0] shadow-sm
                      transition-all duration-500
                      ${fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                  >
                    {/* Image */}
                    <Link
                      href={`/post/${post.slug}`}
                      className="block relative w-full aspect-[16/10] overflow-hidden"
                    >
                      <Image
                        src={imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </Link>

                    {/* Body */}
                    <div className="p-4 sm:p-5 flex flex-col gap-2">
                      {tagText && (
                        <span
                          className={`${tagClass} text-white px-3 py-[3px] rounded-full rounded-tl-none
                            w-fit text-[11px] font-semibold uppercase tracking-wide`}
                        >
                          {tagText}
                        </span>
                      )}

                      <h3 className="text-[15px] sm:text-[17px] font-bold text-[#121213] leading-snug line-clamp-2">
                        <Link
                          href={`/post/${post.slug}`}
                          className="hover:text-[#0073FF] transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h3>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#616C74]">
                        <span>
                          By{" "}
                          <span className="font-semibold text-[#121213]">
                            {post.author?.name || "rstheme"}
                          </span>
                        </span>

                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                            <polyline points="16 7 22 7 22 13" />
                          </svg>
                          {post.views?.toLocaleString() ?? 0} Views
                        </span>

                        {formattedDate && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8"  y1="2" x2="8"  y2="6" />
                              <line x1="3"  y1="10" x2="21" y2="10" />
                            </svg>
                            {formattedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* ── Pagination dots ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    aria-label={`Go to page ${i + 1}`}
                    className={`rounded-full transition-all duration-300
                      ${i === pageIndex
                        ? "w-6 h-2 bg-[#0073FF]"
                        : "w-2 h-2 bg-[#D1D5DB] hover:bg-[#9CA3AF]"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ══ RIGHT: Ads ══ */}
          <div className="hidden xl:block w-[300px] flex-shrink-0">
            <SupplierAds />
          </div>

        </div>
      </div>
    </section>
  )
}

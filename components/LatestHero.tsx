"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import type { Post } from "@/types/Post"

type LatestHeroProps = {
  post: Post
  posts: Post[]
}

/* ================= CONFIG ================= */

const ROTATE_INTERVAL = 5000 // 5 seconds between rotations
const FADE_DURATION = 500    // must match the CSS transition duration below
const SLOT_COUNT = 4         // 1 big hero + 3 sidebar cards

const CATEGORY_COLORS: Record<string, string> = {
  basics: "bg-[#0073ff]",
  trending: "bg-[#F59E0B]",
  latest: "bg-[#F69C00]",
  video: "bg-[#EF4444]",
  engineering: "bg-[#2563EB]",
}

const BADGE_COLORS: Record<string, string> = {
  FEATURED: "bg-[#E11D48]",
  LEADERSHIP: "bg-[#7C3AED]",
  AI: "bg-[#059669]",
  MANUFACTUR: "bg-[#F97316]",
  WEBINAR: "bg-[#7C3AED]",
  EVENT: "bg-[#0EA5E9]",
  TRENDING: "bg-[#F97316]",
  EXCLUSIVE: "bg-[#059669]",
}

/* ================= HELPERS ================= */

function getSlug(p: Post) {
  return typeof p.category === "object"
    ? p.category?.slug?.toLowerCase() || ""
    : String(p.category || "").toLowerCase()
}

function getRecency(p: Post) {
  const raw = (p as any).publishedAt || (p as any).createdAt
  return raw ? new Date(raw).getTime() : 0
}

function sortByRecency(a: Post, b: Post) {
  return getRecency(b) - getRecency(a)
}

// The API can return author: null (company-submitted articles carry
// Company / guestName / createdBy info instead). Never assume
// post.author is a populated object — always guard it, and fall back
// to the Company name so the byline doesn't just default to "rstheme".
function getAuthorName(p: Post): string {
  if (p.author && typeof p.author === "object" && p.author.name) {
    return p.author.name
  }
  const company = (p as any).Company || (p as any).company
  if (company?.name) return company.name
  return "rstheme"
}

function getAuthorAvatar(p: Post): string | null {
  if (p.author && typeof p.author === "object") {
    return p.author.avatarUrl || null
  }
  return null
}

/**
 * Renders the real avatar image when one exists, otherwise falls back to
 * a generated initials circle instead of a static placeholder file —
 * this can never 404 / show a broken-image icon.
 */
function AuthorAvatar({
  name,
  avatarUrl,
  size,
}: {
  name?: string | null
  avatarUrl?: string | null
  size: number
}) {
  const displayName = name?.trim() || "rstheme"

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={displayName}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
      />
    )
  }

  const initial = displayName.charAt(0).toUpperCase()

  return (
    <span
      style={{ width: size, height: size }}
      className="rounded-full bg-[#0073ff] text-white flex items-center justify-center font-semibold shrink-0"
    >
      <span style={{ fontSize: Math.max(10, size * 0.45) }}>{initial}</span>
    </span>
  )
}

/**
 * Builds the ordered pool of posts to cycle through.
 * No category filtering — every post is eligible, most recent first.
 * (Previously this only pulled posts tagged with the "latest" category
 * and used everything else as a fallback; now all posts are treated
 * equally regardless of category.)
 */
function buildPool(posts: Post[]): Post[] {
  if (!Array.isArray(posts) || posts.length === 0) return []

  return [...posts].sort(sortByRecency)
}

export default function LatestHero({ post, posts }: LatestHeroProps) {
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  /* ================= BUILD ROTATION POOL ================= */

  const pool = useMemo(() => buildPool(posts), [posts])

  // Dev-only visibility: if this ever logs 0/undefined, the problem is
  // upstream (the page/server component isn't passing real data down),
  // not this component.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[LatestHero] posts received:", posts?.length ?? 0, "pool built:", pool.length)
    }
  }, [posts, pool])

  const visible = useMemo(() => {
    if (pool.length === 0) return []

    const size = Math.min(SLOT_COUNT, pool.length)
    const result: Post[] = []

    for (let i = 0; i < size; i++) {
      result.push(pool[(index + i) % pool.length])
    }

    return result
  }, [pool, index])

  // Fall back to the `post` prop if the pool couldn't be built (e.g.
  // `posts` came back empty from the parent fetch) — previously this
  // silently rendered nothing further down if heroPost ended up falsy.
  const heroPost = visible[0] || post
  const sidePosts = visible.slice(1)

  /* ================= ROTATION ================= */

  useEffect(() => {
    if (pool.length <= SLOT_COUNT) return

    const timer = setInterval(() => {
      setFade(false)

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % pool.length)
        setFade(true)
      }, FADE_DURATION)
    }, ROTATE_INTERVAL)

    return () => clearInterval(timer)
  }, [pool.length])

  /* ================= HERO IMAGE ================= */

  if (!heroPost) return null

  const imageUrl =
    heroPost.imageUrl?.startsWith("http")
      ? heroPost.imageUrl
      : heroPost.imageUrl
        ? `${process.env.NEXT_PUBLIC_API_URL}${heroPost.imageUrl}`
        : "/placeholder.svg"

  const date = heroPost.publishedAt
    ? new Date(heroPost.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "Today"

  const getTag = (item: Post) => {
    const badge = typeof item?.badge === "string" ? item.badge.trim() : ""

    const slug = getSlug(item)

    const categoryName =
      typeof item.category === "object" && item.category !== null
        ? item.category?.name || ""
        : String(item.category || "")

    const text = badge || categoryName

    if (badge) {
      const color = BADGE_COLORS[badge.toUpperCase()] || "bg-[#6B7280]"
      return { text, color }
    }

    const matchedKey = Object.keys(CATEGORY_COLORS).find((key) =>
      slug.includes(key)
    )
    const color = matchedKey ? CATEGORY_COLORS[matchedKey] : "bg-[#0073ff]"

    return { text, color }
  }

  return (
    <section className="pt-6 sm:pt-10 w-full">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 lg:gap-8 items-start">

          {/* ================= LEFT FEATURED CARD ================= */}
          <Link
            key={heroPost.id}
            href={`/post/${heroPost.slug}`}
            className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[450px] w-full rounded-md overflow-hidden group"
          >
            <Image
              src={imageUrl}
              alt={heroPost.title}
              fill
              priority
              quality={75}
              sizes="(max-width: 1024px) 100vw, 900px"
              className={`object-cover transition-all duration-500 ease-in-out group-hover:scale-105 ${fade ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            <div
              className={`absolute bottom-0 p-4 sm:p-6 text-white max-w-full sm:max-w-[92%] transition-all duration-500 ease-in-out ${fade ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
            >
              {(() => {
                const tag = getTag(heroPost)
                return tag.text ? (
                  <span
                    className={`inline-block ${tag.color} text-xs font-semibold px-3 py-1 rounded-full mb-2 sm:mb-3 text-white`}
                  >
                    {tag.text}
                  </span>
                ) : null
              })()}

              <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-snug mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3">
                {heroPost.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-300">
                <span className="flex items-center gap-2">
                  <AuthorAvatar
                    name={getAuthorName(heroPost)}
                    avatarUrl={getAuthorAvatar(heroPost)}
                    size={24}
                  />
                  <span>By {getAuthorName(heroPost)}</span>
                </span>

                {typeof heroPost.views === "number" && (
                  <span>{heroPost.views.toLocaleString()} Views</span>
                )}

                <span>{date}</span>
              </div>
            </div>
          </Link>

          {/* ================= RIGHT SIDEBAR ================= */}
          <div className="space-y-6">
            {sidePosts.map((item, i) => {
              const thumb =
                item.imageUrl?.startsWith("http")
                  ? item.imageUrl
                  : item.imageUrl
                    ? `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`
                    : "/placeholder.svg"

              const itemDate = item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
                : ""

              return (
                <Link
                  key={`${item.id}-${i}`}
                  href={`/post/${item.slug}`}
                  className={`flex gap-4 items-start border-b border-gray-200 pb-6 group transition-all font-bold duration-500 ease-in-out ${fade
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                    }`}
                >
                  <div className="relative font-bold w-[88px] h-[88px] rounded-md overflow-hidden shrink-0">
                    <Image
                      src={thumb}
                      alt={item.title}
                      fill
                      sizes="88px"
                      quality={70}
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    {(() => {
                      const tag = getTag(item)
                      return tag.text ? (
                        <span
                          className={`inline-block font-bold text-xs font-semibold px-2 py-1 rounded ${tag.color} text-white mb-2`}
                        >
                          {tag.text}
                        </span>
                      ) : null
                    })()}

                    <h3 className="text-[16px] font-bold leading-snug text-[#121213] group-hover:text-blue-600 transition">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <AuthorAvatar
                          name={getAuthorName(item)}
                          avatarUrl={getAuthorAvatar(item)}
                          size={20}
                        />
                        <span>{getAuthorName(item)}</span>
                      </span>

                      {typeof item.views === "number" && (
                        <span>{item.views.toLocaleString()} Views</span>
                      )}

                      {itemDate && <span>{itemDate}</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
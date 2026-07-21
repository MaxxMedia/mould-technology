"use client"

import Link from "next/link"
import type { Post } from "@/types/Post"
import Image from "next/image"
import Banner from "@/components/Banners/Banner"


type Props = {
  posts: Post[]
}

/* ================= CLEAN TEXT HELPER (SSR SAFE) ================= */
function getPlainText(html: string) {
  if (!html) return ""

  return html
    .replace(/<[^>]*>?/gm, "")     // remove HTML tags
    .replace(/&nbsp;/g, " ")       // fix non-breaking spaces
    .replace(/&quot;/g, '"')       // fix quotes
    .replace(/&#39;/g, "'")        // fix apostrophes
    .replace(/&amp;/g, "&")        // fix ampersand
    .trim()
}

export default function IndustryTalkListing({ posts }: Props) {
  return (
    <>
      {/* ================= HERO BANNER ================= */}
      <section className="w-full bg-black">
        <div className="relative w-full h-[260px] md:h-[320px] lg:h-[380px] overflow-hidden">
          <Image
            src="/artificial-intelligence-technology.png"
            alt="Industry Talks Banner"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </section>

      {/* ================= CONTENT AREA ================= */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-16">

          {/* LEFT COLUMN */}
          <div className="space-y-16">
            {posts.map((post) => {
              const imageUrl =
                post.imageUrl?.startsWith("http")
                  ? post.imageUrl
                  : post.imageUrl
                  ? `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`
                  : "/placeholder.svg"

              const date = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : ""

              const plainText = getPlainText(
                post.excerpt || post.content || ""
              )

              return (
                <article
                  key={post.id}
                  className="grid md:grid-cols-[280px_1fr] gap-8 border-b border-gray-200 pb-12"
                >
                  {/* IMAGE */}
                  <div className="relative w-full h-[200px] md:h-[180px]">
                    <Image
                      src={imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover rounded-sm"
                      sizes="(max-width:768px) 100vw, 280px"
                    />

                    {/* Play icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-black text-xl shadow">
                        ▶
                      </div>
                    </div>
                  </div>

                  {/* TEXT CONTENT */}
                  <div>
                    {/* CATEGORY + DATE */}
                    <div className="flex items-center gap-4 mb-3">
                      {post.badge && (
                        <span className="bg-[#0F6FAE] text-white text-[11px] font-bold tracking-wide px-3 py-1 uppercase">
                          {post.badge}
                        </span>
                      )}
                      <span className="text-sm text-gray-500 font-medium">
                        {date}
                      </span>
                    </div>

                    {/* TITLE */}
                    <h2 className="text-[26px] font-bold text-gray-900 leading-tight mb-4 hover:text-[#0F6FAE] transition-colors">
                      <Link href={`/post/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {/* DESCRIPTION */}
                    <p className="text-gray-700 text-[16px] leading-7 mb-6 max-w-3xl">
                      {plainText.length > 220
                        ? plainText.slice(0, 220) + "..."
                        : plainText}
                    </p>

                    {/* WATCH LINK */}
                    <Link
                      href={`/post/${post.slug}`}
                      className="text-[#0F6FAE] font-semibold text-sm uppercase tracking-wide hover:underline"
                    >
                      Watch →
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          {/* RIGHT COLUMN (ADS) */}
          <aside className="space-y-8 sticky top-24 h-fit" aria-label="Sponsored">
            <Banner placement="INDUSTRY_TALKS_RIGHT" />
          </aside>
        </div>
      </section>
    </>
  )
}
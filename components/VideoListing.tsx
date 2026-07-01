"use client"

import Link from "next/link"
import type { Post } from "@/types/Post"
import Image from "next/image"
import SupplierAds from "@/components/SupplierAds"

type Props = {
  posts: Post[]
}

export default function VideoListing({ posts }: Props) {
  return (
    <>
      {/* ================= HERO BANNER ================= */}
      <section className="w-full bg-black">
        <div className="relative w-full h-[330px] md:h-[330px] lg:h-[420px] overflow-hidden">
           <Image
    src="/artificial-intelligence-technology.png"
    alt="Videos Banner"
    fill
    priority
    className="object-cover"
    sizes="100vw"
  />
          <div className="absolute inset-0 bg-black/40 flex items-center">
            <div className="max-w-7xl mx-auto px-6" />
          </div>
        </div>
      </section>

      {/* ================= VIDEO LIST ================= */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

          {/* LEFT – VIDEO LIST */}
          <div className="space-y-14">
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

              return (
                <article
                  key={post.id}
                  className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 pb-14 border-b border-gray-200"
                >
                {/* THUMBNAIL */}
<div className="relative w-full h-[220px] md:h-[240px]">
  <Image
    src={imageUrl}
    alt={post.title}
    fill
    className="object-cover rounded-sm"
    sizes="(max-width: 768px) 100vw, 300px"
  />

  {/* Play Button Overlay */}
  <span className="absolute inset-0 flex items-center justify-center">
    <span
      className="
        group
        w-10 h-10
        rounded-full
        bg-white/15
        backdrop-blur-md
        border border-white/30
        shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        flex items-center justify-center
        transition-all duration-300
        hover:bg-white/25
        hover:scale-110
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-4 h-4 ml-[1px] fill-white group-hover:fill-red-600 transition-colors duration-300"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  </span>
</div>

                  {/* CONTENT */}
                  <div className="flex flex-col justify-between">
                    <div>
                      {/* BADGE + DATE */}
                      <div className="flex items-center gap-4 mb-3">
                        {post.badge && (
                          <span className="bg-[#0072BC] text-white text-[11px] font-bold px-2 py-[3px] uppercase">
                            {post.badge}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {date}
                        </span>
                      </div>

                      {/* TITLE */}
                      <h2
                        className="text-[24px] font-bold text-gray-900 leading-snug mb-4"
                        style={{
                          fontFamily:
                            "Oswald, Helvetica Neue, Helvetica, Arial, sans-serif",
                        }}
                      >
                        {post.title.length > 90
                          ? post.title.slice(0, 90) + "…"
                          : post.title}
                      </h2>

                      {/* EXCERPT */}
                      <p className="text-gray-600 text-[16px] leading-7 mb-6">
                        {post.excerpt
                          ? post.excerpt
                          : post.content
                              ?.replace(/<[^>]+>/g, "")
                              .slice(0, 240) + "..."}
                      </p>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/post/${post.slug}`}
                      className="text-[#0072BC] font-bold text-sm uppercase hover:underline"
                      style={{
                        fontFamily:
                          "Oswald, Helvetica Neue, Helvetica, Arial, sans-serif",
                      }}
                    >
                      Watch →
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          {/* RIGHT – ADS */}
          <aside className="space-y-6 sticky top-24 h-fit">
            <SupplierAds />
          </aside>
        </div>
      </section>
    </>
  )
}
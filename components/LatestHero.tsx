"use client"

import Link from "next/link"
import Image from "next/image"
import { useMemo } from "react"
import type { Post } from "@/types/Post"

type LatestHeroProps = {
  post: Post
  posts: Post[]
}
const CATEGORY_COLORS: Record<string, string> = {
  basics: "bg-[#0073ff]",
  trending: "bg-[#F59E0B]",
  latest: "bg-[#F69C00]",
  video: "bg-[#EF4444]",
  engineering: "bg-[#2563EB]",
};


export default function LatestHero({ post, posts }: LatestHeroProps) {

  /* ================= FILTER LATEST SIDEBAR ================= */

  const latestPosts = useMemo(() => {
    return posts
      .filter((p) =>
        typeof p.category === "object"
          ? p.category?.slug?.toLowerCase() === "latest"
          : String(p.category || "").toLowerCase() === "latest"
      )
      .filter((p) => p.id !== post.id)
      .slice(0, 3)
  }, [posts, post.id])

  /* ================= HERO IMAGE ================= */

  const imageUrl =
    post.imageUrl?.startsWith("http")
      ? post.imageUrl
      : post.imageUrl
      ? `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`
      : "/placeholder.svg"

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Today"

    const getTag = (item: Post) => {
  const badge = item?.badge?.trim();

  const slug =
    typeof item.category === "object"
      ? item.category?.slug?.toLowerCase() || ""
      : String(item.category || "").toLowerCase();

  const categoryName =
    typeof item.category === "object"
      ? item.category?.name || ""
      : String(item.category || "");

  const text = badge || categoryName;

  const matchedKey = Object.keys(CATEGORY_COLORS).find((key) =>
    slug.includes(key)
  );

  const color = matchedKey
    ? CATEGORY_COLORS[matchedKey]
    : "bg-[#0073ff]";

  return { text, color };
};



  return (
    <section className="pt-[40px] w-full">
      <div className="max-w-[1320px] mx-auto px-[12px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-8 items-start">

          {/* ================= LEFT FEATURED CARD ================= */}
          <Link
            href={`/post/${post.slug}`}
            className="relative h-[420px] rounded-md overflow-hidden group"
          >
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              priority
              quality={75}
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-0 p-6 text-white max-w-[90%]">
             {(() => {
  const tag = getTag(post);
  return tag.text ? (
    <span
      className={`inline-block ${tag.color} text-xs font-semibold px-3 py-1 rounded-full mb-3 text-white`}
    >
      {tag.text}
    </span>
  ) : null;
})()}

              <h1 className="text-white text-2xl md:text-3xl font-bold leading-snug mb-3">
                {post.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-300">
                {post.author?.name && (
                  <span className="flex items-center gap-2">
                    <Image
                      src={post.author.avatarUrl || "/avatar-placeholder.png"}
                      alt={post.author.name}
                      width={24}
                      height={24}
                      className="rounded-full border border-white/30"
                    />
                    <span>By {post.author.name}</span>
                  </span>
                )}

                {typeof post.views === "number" && (
                  <span>{post.views.toLocaleString()} Views</span>
                )}

                <span>{date}</span>
              </div>
            </div>
          </Link>

          {/* ================= RIGHT SIDEBAR ================= */}
          <div className="space-y-6">
            {latestPosts.map((item) => {
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
                  key={item.id}
                  href={`/post/${item.slug}`}
                  className="flex gap-4 items-start border-b border-gray-200 pb-6 group"
                >
                  <div className="relative w-[88px] h-[88px] rounded-md overflow-hidden shrink-0">
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
  const tag = getTag(item);
  return tag.text ? (
    <span
      className={`inline-block text-xs font-semibold px-2 py-1 rounded ${tag.color} text-white mb-2`}
    >
      {tag.text}
    </span>
  ) : null;
})()}

                    <h3 className="text-[17px] font-semibold leading-snug text-[#121213] group-hover:text-blue-600 transition">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                      {item.author?.name && (
                        <span className="flex items-center gap-1">
                          <Image
                            src={
                              item.author.avatarUrl ||
                              "/avatar-placeholder.png"
                            }
                            alt={item.author.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <span>{item.author.name}</span>
                        </span>
                      )}

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

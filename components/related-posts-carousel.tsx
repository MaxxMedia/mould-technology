"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

type Post = {
  id: number
  title: string
  slug: string
  excerpt?: string
  imageUrl?: string
  publishedAt?: string
  category?: any
}

export default function RelatedPostsCarousel() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`
        )
        const data = await res.json()
        const allPosts = Array.isArray(data.data) ? data.data : []

        const filtered = allPosts
          .sort(
            (a: Post, b: Post) =>
              new Date(b.publishedAt || "").getTime() -
              new Date(a.publishedAt || "").getTime()
          )
          .slice(0, 4)

        setPosts(filtered)
      } catch (err) {
        console.error("Failed to load related posts", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRelated()
  }, [])

  if (loading) {
    return (
      <section className="bg-white border-b border-gray-200">
  <div className="max-w-[1320px] mx-auto px-4 py-16">
        <div className="text-center text-gray-500 text-[16px]">
          Loading related content...
        </div>
      </div>
      </section>
    )
  }

  return (
    <section className="bg-white border-b border-gray-200">
  <div className="max-w-[1320px] mx-auto px-4 py-16">
        <h2
          className="text-3xl md:text-4xl font-bold text-[#003049] mb-10 text-center"
          style={{ fontFamily: "Oswald, sans-serif" }}
        >
          Related Content
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              : "Today"

            const categoryName =
              typeof post.category === "object"
                ? post.category?.name || "LATEST"
                : "LATEST"

            return (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="group flex flex-col bg-white border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Image */}
                <div className="relative w-full h-[220px] overflow-hidden bg-gray-200">
                  <Image
                    src={imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Category */}
                  <span
                    className="inline-block mb-3 bg-[#0077b6] text-white text-xs font-bold px-3 py-1 uppercase tracking-widest"
                    style={{ fontFamily: "Oswald, sans-serif" }}
                  >
                    {categoryName}
                  </span>

                  {/* Date */}
                  <p className="text-gray-500 text-sm uppercase tracking-widest mb-3">
                    {date}
                  </p>

                  {/* Title */}
                  <h3
                    className="text-[18px] font-bold text-[#003049] mb-4 line-clamp-2 group-hover:text-[#0077b6] transition-colors"
                    style={{ fontFamily: "Oswald, sans-serif" }}
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-[#444] text-[16px] line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read More */}
                  <span className="text-[#d62839] font-bold text-sm uppercase tracking-widest group-hover:text-[#003049] transition-colors">
                    READ MORE →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

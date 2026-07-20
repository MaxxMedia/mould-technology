"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"

import ShareSection from "@/components/share-section"
import RelatedPostsCarousel from "@/components/related-posts-carousel"
import ContentGateModal from "@/components/content-gate-modal"
import PostViewCounter from "@/components/PostViewCounter"
import Loader from "@/components/Loader"
import SupplierAds from "@/components/SupplierAds"

/* ================= TYPES ================= */
type Author = {
  id: number
  name: string
  bio?: string
  avatarUrl?: string
}

type Category = {
  id: number
  name: string
  slug?: string
}

type Post = {
  id: number
  title: string
  slug: string
  excerpt?: string
  content?: string
  imageUrl?: string
  publishedAt?: string
  author?: Author
  category?: Category
  youtubeUrl?: string
}

/* ================= YOUTUBE HELPERS ================= */
function getYoutubeEmbed(url?: string) {
  if (!url) return null

  if (url.includes("youtube.com/embed")) return url

  const watchMatch = url.match(/[?&]v=([^&]+)/)
  if (watchMatch?.[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`
  }

  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0]
    return `https://www.youtube.com/embed/${id}`
  }

  return null
}

/* ================= PAGE ================= */
export default function PostDetailsPage() {
  const { slug } = useParams()
  const slugValue = Array.isArray(slug) ? slug[0] : slug

  const [post, setPost] = useState<Post | null>(null)
  const [showGate, setShowGate] = useState(false)
  const [userSubmitted, setUserSubmitted] = useState(false)

  /* ================= FETCH POST ================= */
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`,
          { cache: "no-store" }
        )
        const data = await res.json()
        const posts: Post[] = Array.isArray(data.data) ? data.data : []
        const found = posts.find(p => p.slug === slugValue)
        if (found) setPost(found)
      } catch (err) {
        console.error("Failed to load post:", err)
      }
    }

    if (slugValue) fetchPost()
  }, [slugValue])

  /* ================= CONTENT GATE ================= */
  useEffect(() => {
    if (userSubmitted) return
    const timer = setTimeout(() => setShowGate(true), 9000)
    return () => clearTimeout(timer)
  }, [userSubmitted])

  if (!post) return <Loader />

  const embedUrl = getYoutubeEmbed(post.youtubeUrl)

  const allowYoutube =
    post.category?.slug === "video" ||
    post.category?.slug === "industry-talks"

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

  return (
    <>
      {/* ================= CONTENT GATE MODAL ================= */}
      <ContentGateModal
        isOpen={showGate && !userSubmitted}
        onClose={() => setShowGate(false)}
        onSubmit={() => {
          setUserSubmitted(true)
          setShowGate(false)
        }}
      />

      <main className="bg-[#f9f9f9] overflow-x-hidden">
        {/* VIEW COUNT */}
        {slugValue && <PostViewCounter slug={slugValue} />}

        {/* ================= HERO ================= */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-[1320px] mx-auto px-4 py-10">
            {post.category?.name && (
              <span className="inline-block text-[11px] font-semibold tracking-wide uppercase text-[#003049] bg-[#003049]/5 px-3 py-1 rounded-full mb-4">
                {post.category.name}
              </span>
            )}

            <p className="text-gray-500 text-sm mb-3">Published {date}</p>

            <h1 className="text-3xl md:text-4xl font-bold text-[#003049] mb-4 leading-tight max-w-4xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-gray-600 text-lg max-w-3xl mb-8 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* HERO IMAGE — full image visible, no cropping */}
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
            </div>

            {post.author && (
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                <div className="relative w-11 h-11 shrink-0">
                  <Image
                    src={post.author.avatarUrl || "/avatar-placeholder.png"}
                    alt={post.author.name}
                    fill
                    className="rounded-full border border-gray-200 object-cover"
                    sizes="44px"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#003049]">{post.author.name}</p>
                  {post.author.bio && (
                    <p className="text-xs text-gray-500 mt-0.5">{post.author.bio}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= CONTENT + SIDEBAR ================= */}
        <section className="max-w-[1320px] mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[8fr_4fr] gap-10">

            {/* CONTENT */}
            <article className="max-w-3xl overflow-hidden">

              {/* CONTENT BODY */}
              <div
                className="prose prose-lg max-w-none break-words overflow-hidden prose-headings:text-[#003049] prose-a:text-[#003049] prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
              />

              <div className="mt-10 pt-6 border-t border-gray-100">
                <ShareSection post={post} />
              </div>

              {/* ================= YOUTUBE BLOCK ================= */}
              {allowYoutube && post.youtubeUrl && (
                <div className="mt-12">
                  {embedUrl ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <iframe
                        src={embedUrl}
                        title={post.title}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="w-full rounded-xl border border-gray-800 bg-black text-white flex flex-col items-center justify-center py-16 px-6 text-center">
                      <p className="text-lg font-semibold mb-4">Watch on YouTube</p>
                      <a
                        href={post.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      >
                        Open YouTube →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </article>

            {/* SIDEBAR */}
            <div className="w-full overflow-hidden">
              <div className="lg:sticky lg:top-6">
                <SupplierAds />
              </div>
            </div>
          </div>
        </section>

        <RelatedPostsCarousel />
      </main>
    </>
  )
}
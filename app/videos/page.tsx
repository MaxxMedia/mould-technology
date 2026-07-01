import Image from "next/image"
import Link from "next/link"
import type { Post } from "@/types/Post"
import SupplierAds from "@/components/SupplierAds"

export default async function VideosPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`,
    { cache: "no-store" }
  )

  const data = await res.json()
  const posts: Post[] = data.data || data

  const slugOf = (post: Post) =>
    typeof post.category === "object"
      ? post.category?.slug?.toLowerCase()
      : String(post.category || "").toLowerCase()

  const getImageUrl = (url?: string | null) => {
    if (!url) return "/placeholder.svg"
    if (url.startsWith("http")) return url
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`
  }

  const whatsNewPosts = posts
    .filter((p) => slugOf(p).includes("whatsnew"))
    .slice(0, 5)

  const videoPosts = posts.filter(
    (p) =>
      slugOf(p).includes("video") ||
      slugOf(p).includes("videos")
  )

  return (
    <main className="bg-white">

      {/* ================= WHAT'S NEW STRIP ================= */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-[1320px] mx-auto px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {whatsNewPosts.map((post) => (
              <Link key={post.id} href={`/post/${post.slug}`} className="group">
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-[#0072BC] text-white text-[10px] font-bold px-2 py-0.5 uppercase">
                    {typeof post.category === "object"
                      ? post.category?.name
                      : post.category}
                  </span>

                  <span className="text-xs text-gray-500">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-[#C70000]">
                  {post.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= VIDEOS ================= */}
      <section className="max-w-[1320px] mx-auto px-6 py-14">
        <h1 className="text-[36px] font-bold text-[#003B5C] mb-10">
          Videos
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

          {/* LEFT – VIDEO LIST */}
          <div className="space-y-12">
            {videoPosts.map((post) => (
              <article
                key={post.id}
                className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 pb-10 border-b"
              >
                {/* VIDEO THUMB */}
                <div className="relative w-full h-[160px]">
                  <Image
                    src={getImageUrl(post.imageUrl)}
                    alt={post.title}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 100vw, 260px"
                  />

                  {/* PLAY ICON */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
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
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 uppercase">
                      {typeof post.category === "object"
                        ? post.category?.name
                        : post.category}
                    </span>

                    <span className="text-xs text-gray-500">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                  </div>

                  <h2 className="text-[22px] font-bold leading-snug mb-2">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 text-[15px] leading-relaxed mb-3">
                    {post.excerpt ||
                      post.content
                        ?.replace(/<[^>]+>/g, "")
                        .slice(0, 160) + "..."}
                  </p>

                  <Link
                    href={`/post/${post.slug}`}
                    className="text-[#0072BC] font-bold uppercase text-sm"
                  >
                    Watch →
                  </Link>
                </div>
              </article>
            ))}

            {/* ================= PAGINATION ================= */}
            <div className="flex items-center gap-2 pt-6">
              <button className="border px-3 py-2 text-sm">‹</button>
              <button className="border px-3 py-2 bg-[#003B5C] text-white text-sm">1</button>
              <button className="border px-3 py-2 text-sm">2</button>
              <button className="border px-3 py-2 text-sm">3</button>
              <button className="border px-3 py-2 text-sm">4</button>
              <button className="border px-3 py-2 text-sm">5</button>
              <button className="border px-3 py-2 text-sm">›</button>
            </div>
          </div>

          {/* RIGHT – ADS */}
          <aside className="space-y-6 sticky top-24">
            <SupplierAds />
          </aside>

        </div>
      </section>
    </main>
  )
}
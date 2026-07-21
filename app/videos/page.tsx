import Image from "next/image"
import Link from "next/link"
import type { Post } from "@/types/Post"
import SupplierAds from "@/components/SupplierAds"

const VIDEOS_PER_PAGE = 10
const VIDEO_CATEGORY_SLUG = "video"

interface Meta {
  page: number
  limit: number
  total: number
  pages: number
}

interface PostsResponse {
  data: Post[]
  meta: Meta
}

function getImageUrl(url?: string | null) {
  if (!url) return "/placeholder.svg"
  if (url.startsWith("http")) return url
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getCategoryName(post: Post) {
  return typeof post.category === "object" ? post.category?.name : post.category
}

function getCategorySlug(post: Post) {
  return typeof post.category === "object"
    ? post.category?.slug?.toLowerCase() ?? ""
    : String(post.category || "").toLowerCase()
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  // ---- Fetch paginated video posts (server-side filtered by category) ----
  const videosRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?category=${VIDEO_CATEGORY_SLUG}&page=${page}&limit=${VIDEOS_PER_PAGE}`,
    { cache: "no-store" }
  )
  

  if (!videosRes.ok) {
    throw new Error(`Failed to fetch videos: ${videosRes.status}`)
  }

  const videosData: PostsResponse = await videosRes.json()
  const videoPosts = videosData.data ?? []
  const meta = videosData.meta

  // ---- Fetch a separate batch for the "What's New" strip ----
  const whatsNewRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=20`,
    { cache: "no-store" }
  )
  const whatsNewData: PostsResponse = await whatsNewRes.json()
  const whatsNewPosts = (whatsNewData.data ?? [])
    .filter((p) => getCategorySlug(p).includes("whatsnew"))
    .slice(0, 5)

  return (
    <main className="bg-white">
      {/* ================= WHAT'S NEW STRIP ================= */}
      {whatsNewPosts.length > 0 && (
        <section className="border-b border-gray-200 bg-white">
          <div className="max-w-[1320px] mx-auto px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {whatsNewPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.slug}`} className="group">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-[#0072BC] text-white text-[10px] font-bold px-2 py-0.5 uppercase">
                      {getCategoryName(post)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(post.publishedAt)}
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
      )}

      {/* ================= VIDEOS ================= */}
      <section className="max-w-[1320px] mx-auto px-6 py-14">
        <h1 className="text-[36px] font-bold text-[#003B5C] mb-10">Videos</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* LEFT – VIDEO LIST */}
          <div className="space-y-12">
            {videoPosts.length === 0 && (
              <p className="text-gray-500 text-center py-20">No videos found.</p>
            )}

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
                      {getCategoryName(post)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>

                  <h2 className="text-[22px] font-bold leading-snug mb-2">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 text-[15px] leading-relaxed mb-3">
                    {post.excerpt ||
                      post.content?.replace(/<[^>]+>/g, "").slice(0, 160) + "..."}
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
            {meta && meta.pages >= 1 && (
              <Pagination currentPage={meta.page} totalPages={meta.pages} />
            )}
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

// ================= PAGINATION UI ================= //

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  start = Math.max(1, end - maxVisible + 1)

  const pageNumbers = Array.from(
    { length: end - start + 1 },
    (_, i) => start + i
  )

  return (
    <nav
      aria-label="Videos pagination"
      className="flex items-center justify-center gap-1.5 pt-10"
    >
      <PageLink page={currentPage - 1} disabled={currentPage <= 1} ariaLabel="Previous page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </PageLink>

      {start > 1 && (
        <>
          <PageLink page={1}>1</PageLink>
          {start > 2 && (
            <span className="w-9 text-center text-sm text-gray-400 select-none">…</span>
          )}
        </>
      )}

      {pageNumbers.map((p) => (
        <PageLink key={p} page={p} active={p === currentPage}>
          {p}
        </PageLink>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="w-9 text-center text-sm text-gray-400 select-none">…</span>
          )}
          <PageLink page={totalPages}>{totalPages}</PageLink>
        </>
      )}

      <PageLink page={currentPage + 1} disabled={currentPage >= totalPages} ariaLabel="Next page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </PageLink>
    </nav>
  )
}

function PageLink({
  page,
  active,
  disabled,
  ariaLabel,
  children,
}: {
  page: number
  active?: boolean
  disabled?: boolean
  ariaLabel?: string
  children: React.ReactNode
}) {
  const base =
    "flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium transition-colors duration-150"

  if (disabled) {
    return (
      <span
        aria-hidden="true"
        className={`${base} border border-gray-200 text-gray-300 cursor-not-allowed`}
      >
        {children}
      </span>
    )
  }

  if (active) {
    return (
      <span
        aria-current="page"
        className={`${base} bg-[#003B5C] text-white shadow-sm`}
      >
        {children}
      </span>
    )
  }

  return (
    <Link
      href={`/videos?page=${page}`}
      aria-label={ariaLabel}
      className={`${base} border border-gray-200 text-gray-600 hover:border-[#003B5C] hover:text-[#003B5C] hover:bg-blue-50`}
    >
      {children}
    </Link>
  )
}
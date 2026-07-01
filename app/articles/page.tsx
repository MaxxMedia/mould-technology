import Image from "next/image"
import SupplierAds from "@/components/SupplierAds"
import MagazineGrid from "@/components/magazine/MagazineGrid"
import type { Post } from "@/types/Post"
import Link from "next/link"
import Banner from "@/components/Banners/Banner";

export default async function ArticlesPage() {

  /* ================= FETCH POSTS ================= */
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`,
    { cache: "no-store" }
  )

  const data = await res.json()
  const posts: Post[] = data.data || data

  /* ================= FETCH MAGAZINES ================= */
  const magRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/magazines`,
    { cache: "no-store" }
  )

  const magazines = await magRes.json()
  const latestMagazine = magazines?.[0]

  /* ================= HELPERS ================= */
  const slugOf = (post: Post) =>
    typeof post.category === "object"
      ? post.category?.slug?.toLowerCase()
      : String(post.category || "").toLowerCase()

  const getImageUrl = (url?: string | null) => {
    if (!url) return "/placeholder.svg"
    if (url.startsWith("http")) return url

    const base = process.env.NEXT_PUBLIC_API_URL || ""
    return `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`
  }

  /* ================= FILTER POSTS ================= */
  const archivePosts = posts.filter(p => slugOf(p).includes("archive"))
  const inThisIssuePosts = posts.filter(p =>
    slugOf(p).includes("inthisissue")
  )
  const departmentPosts = posts.filter(p =>
    slugOf(p).includes("department")
  )
  const productPosts = posts.filter(p =>
    slugOf(p).includes("product")
  )

  const whatsNewPosts = posts
    .filter(p => !slugOf(p).includes("whatsnew"))
    .slice(0, 5)

  const remainingIssues = inThisIssuePosts.slice(1)

  return (
    <main className="bg-white">

      {/* ================= ARTICLE TOP BANNER ================= */}
<Banner placement="ARTICLE_TOP" />

      {/* ================= WHATS NEW ================= */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-[1320px] mx-auto px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {whatsNewPosts.map((post) => (
              <Link key={post.id} href={`/post/${post.slug}`} className="group">
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-[#0072BC] text-white text-[10px] font-bold px-2 py-[2px] uppercase">
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

      {/* ================= TOP SPLIT SECTION ================= */}
      <section className="bg-[#E9ECEF]">
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[420px_1fr]">

          {/* LEFT – LATEST ISSUE */}
          <MagazineGrid
            magazines={magazines}
            variant="featured"
            limit={1}
          />

          {/* RIGHT – LATEST MAGAZINE HERO */}
          {latestMagazine && (
            <div className="relative h-[520px]">
  <Image
    src={latestMagazine.coverImageUrl}
    alt={latestMagazine.title}
    fill
    className="object-cover"
    priority
    sizes="(max-width:1024px) 100vw, 60vw"
  />

              <div className="absolute inset-0 bg-black/50" />

              <div className="absolute bottom-0 left-0 p-10 max-w-3xl text-white">
                <span className="inline-block bg-[#0072BC] text-xs font-bold px-3 py-1 mb-4">
                  COVER STORY
                </span>

                <h1 className="text-[28px] font-bold leading-snug mb-3">
                  {latestMagazine.title}
                </h1>

                <p className="text-sm text-gray-200 mb-4">
                  {latestMagazine.description
                    ?.replace(/<[^>]+>/g, "")
                    .slice(0, 160)}...
                </p>

                <Link
                  href={`/magazines/${latestMagazine.slug}`}
                  //  href={`/post/${post.slug}`}
                  className="text-[#C70000] font-bold uppercase text-sm"
                >
                  Read Issue →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <div className="bg-[#0F5B78]">
          <div className="max-w-[1320px] mx-auto flex gap-10 px-10 py-4 text-white text-sm font-semibold">
            <Link href="/features">FEATURES</Link>
            <Link href="/columns">COLUMNS</Link>
            <Link href="/archive">ARCHIVE</Link>
          </div>
        </div>
      </section>
          {/* ================= ARTICLE MIDDLE BANNER ================= */}
<Banner placement="ARTICLE_MIDDLE" />


      {/* ================= IN THIS ISSUE ================= */}
      <section className="max-w-[1320px] mx-auto px-6 py-14">
        <h2 className="text-[32px] font-bold text-[#003B5C] mb-10">
          In this Issue
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14">
            {remainingIssues.map((post) => (
              <article key={post.id}>
                <div className="relative w-full aspect-[16/9] mb-4">
  <Image
    src={getImageUrl(post.imageUrl)}
    alt={post.title}
    fill
    className="object-cover rounded"
    sizes="(max-width:768px) 100vw, 50vw"
  />
</div>

                <div className="flex items-center gap-4 mb-3">
                  <span className="bg-[#0072BC] text-white text-xs font-bold px-3 py-1 uppercase">
                    {typeof post.category === "object"
                      ? post.category?.name
                      : post.category}
                  </span>
                </div>

                <h3 className="text-[20px] font-bold leading-snug mb-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 text-[15px] leading-relaxed mb-3">
                  {post.excerpt ||
                    post.content
                      ?.replace(/<[^>]+>/g, "")
                      .slice(0, 140) + "..."}
                </p>

                <Link
                  href={`/post/${post.slug}`}
                  className="text-[#C70000] font-bold text-sm uppercase"
                >
                  Read More →
                </Link>
              </article>
            ))}
          </div>

          <aside className="space-y-6">
            <SupplierAds />
          </aside>

        </div>
      </section>

      {/* ================= ARCHIVE GRID ================= */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-[#003B5C] mb-8">
          Archive
        </h2>

        <MagazineGrid magazines={magazines} />
      </section>
      {/* ================= ARTICLE BOTTOM BANNER ================= */}
        <Banner placement="ARTICLE_BOTTOM" />

    </main>
  )
}

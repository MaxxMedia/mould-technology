import Link from "next/link"
import Banner from "@/components/Banners/Banner"
import Image from "next/image"
import type { Post } from "@/types/Post"

type Props = {
  posts: Post[]
}

export default function InThisIssue({ posts }: Props) {

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

  /* Filter In This Issue Posts */
const normalize = (str: string) =>
  str.replace(/[-_\s]/g, "").toLowerCase()

const inThisIssuePosts = posts.filter(p =>
  normalize(slugOf(p)).includes("inthisissue")
)

const remainingIssues = inThisIssuePosts


  if (!remainingIssues.length) return null

  return (
    <section className="max-w-[1320px] mx-auto px-6 py-14">
      <h2 className="text-[32px] font-bold text-[#003B5C] mb-10">
        In this Issue
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

        {/* LEFT CONTENT GRID */}
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

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-6">
          <Banner placement="MAGAZINE_RIGHT" />
        </aside>

      </div>
    </section>
  )
}
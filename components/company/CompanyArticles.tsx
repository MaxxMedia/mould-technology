"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { Post } from "@/types/Post"

/* ================= CONFIG ================= */

const ROTATE_INTERVAL = 5000 // 5 seconds

const BADGE_COLORS: Record<string, string> = {
  FEATURED: "bg-[#E11D48]",
  WEBINAR: "bg-[#7C3AED]",
  EVENT: "bg-[#0EA5E9]",
  TRENDING: "bg-[#F97316]",
  EXCLUSIVE: "bg-[#059669]",
}

const CATEGORY_COLORS: Record<string, string> = {
  gaming: "bg-[#0073FF]",
  fashion: "bg-[#E033E0]",
  "latest-issue": "bg-[#F69C00]",
}

/* ================= COMPONENT ================= */

export default function CompanyArticles() {
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  /* ================= FETCH APPROVED ARTICLES ================= */

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/articles/approved`
        )
        const data = await res.json()
        setAllPosts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Failed to load approved articles", err)
      }
    })()
  }, [])

  /* ================= ALWAYS 3 ARTICLES (SLIDING WINDOW) ================= */

  const visiblePosts = useMemo(() => {
    if (allPosts.length === 0) return []

    const result: Post[] = []

    for (let i = 0; i < 3; i++) {
      result.push(allPosts[(index + i) % allPosts.length])
    }

    return result
  }, [allPosts, index])

  /* ================= ROTATION ================= */

  useEffect(() => {
    if (allPosts.length <= 3) return

    const timer = setInterval(() => {
      setFade(false)

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % allPosts.length)
        setFade(true)
      }, 300)
    }, ROTATE_INTERVAL)

    return () => clearInterval(timer)
  }, [allPosts.length])

  if (!visiblePosts.length) return null

  /* ================= UI ================= */

  return (
    <section className="pt-4 sm:pt-8 w-full">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="relative bg-[#F7F7F7] rounded-md px-4 sm:px-6 py-6 sm:py-7 overflow-hidden">

          {/* background shapes */}
          <Image
            src="/images/shape/flower-shape-01.png"
            alt=""
            width={120}
            height={120}
            className="absolute top-0 right-0 opacity-30 pointer-events-none hidden sm:block"
          />
          <Image
            src="/images/shape/flower-shape-02.png"
            alt=""
            width={120}
            height={120}
            className="absolute bottom-0 left-2 opacity-30 pointer-events-none hidden sm:block"
          />

          {/* POSTS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {visiblePosts.map((post) => {
              const slug =
                typeof post.category === "object"
                  ? post.category?.slug || ""
                  : ""

              const categoryName =
                typeof post.category === "object"
                  ? post.category?.name || ""
                  : ""

              const badge = post.badge?.trim()
              const tagText = badge || categoryName

              let tagClass = "bg-[#9CA3AF]"

              if (badge) {
                tagClass =
                  BADGE_COLORS[badge.toUpperCase()] || "bg-[#6B7280]"
              } else {
                const match = Object.keys(CATEGORY_COLORS).find((key) =>
                  slug.includes(key)
                )
                if (match) tagClass = CATEGORY_COLORS[match]
              }

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-md p-4 sm:p-5 flex gap-4 h-[140px] sm:h-[160px] overflow-hidden"
                >
                  {/* thumbnail */}
                  <Link
                    href={`/post/${post.slug}`}
                    className="relative w-[72px] h-[72px] sm:w-[96px] sm:h-[96px] rounded-md overflow-hidden flex-shrink-0"
                  >
                    <Image
                      src={
                        post.imageUrl?.startsWith("http")
                          ? post.imageUrl
                          : `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`
                      }
                      alt={post.title.slice(0, 20)}
                      fill
                      className={`object-cover transition-all duration-500 ${
                        fade ? "opacity-100 scale-100" : "opacity-0 scale-95"
                      }`}
                    />
                  </Link>

                  {/* content */}
                  <div
                    className={`flex flex-col gap-2 min-w-0 transition-all duration-500 ${
                      fade
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0"
                    }`}
                  >
                    {tagText && (
                      <span
                        className={`${tagClass} text-white px-3 py-[3px] rounded-full rounded-tl-none w-fit text-[11px] font-medium`}
                      >
                        {tagText}
                      </span>
                    )}

                    <h6 className="text-[15px] sm:text-[17px] leading-snug font-semibold text-[#121213] line-clamp-2 h-[44px] sm:h-[48px] hover:text-[#0073FF] transition">
                      <Link href={`/post/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h6>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#616C74]">
                      <span>
                        By{" "}
                        <span className="font-medium">
                          {post.author?.name || "rstheme"}
                        </span>
                      </span>
                      <span>
                        {post.views?.toLocaleString() || 0} Views
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}


// "use client"

// import Image from "next/image"
// import Link from "next/link"
// import { useEffect, useMemo, useState } from "react"
// import type { Post } from "@/types/Post"

// /* ================= CONFIG ================= */

// const ROTATE_INTERVAL = 5000 // 5 seconds

// const BADGE_COLORS: Record<string, string> = {
//   FEATURED: "bg-[#E11D48]",
//   WEBINAR: "bg-[#7C3AED]",
//   EVENT: "bg-[#0EA5E9]",
//   TRENDING: "bg-[#F97316]",
//   EXCLUSIVE: "bg-[#059669]",
// }

// const CATEGORY_COLORS: Record<string, string> = {
//   gaming: "bg-[#0073FF]",
//   fashion: "bg-[#E033E0]",
//   "latest-issue": "bg-[#F69C00]",
// }

// /* ================= PROPS ================= */

// type Props = {
//   posts: Post[]
// }

// /* ================= COMPONENT ================= */

// export default function CompanyArticles({ posts }: Props) {
//   const [index, setIndex] = useState(0)
//   const [fade, setFade] = useState(true)

//   const allPosts = posts

//   /* ================= ALWAYS 3 ARTICLES (SLIDING WINDOW) ================= */

//   const visiblePosts = useMemo(() => {
//     if (!allPosts.length) return []

//     const result: Post[] = []

//     for (let i = 0; i < Math.min(3, allPosts.length); i++) {
//       result.push(allPosts[(index + i) % allPosts.length])
//     }

//     return result
//   }, [allPosts, index])

//   /* ================= ROTATION ================= */

//   useEffect(() => {
//     if (allPosts.length <= 3) return

//     const timer = setInterval(() => {
//       setFade(false)

//       setTimeout(() => {
//         setIndex((prev) => (prev + 1) % allPosts.length)
//         setFade(true)
//       }, 300)
//     }, ROTATE_INTERVAL)

//     return () => clearInterval(timer)
//   }, [allPosts.length])

//   if (!visiblePosts.length) return null

//   /* ================= UI ================= */

//   return (
//     <section className="pt-4 sm:pt-8 w-full">
//       <div className="max-w-[1320px] mx-auto px-4">
//         <div className="relative bg-[#F7F7F7] rounded-2xl px-4 sm:px-6 py-6 sm:py-7 overflow-hidden">

//           {/* POSTS GRID */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
//             {visiblePosts.map((post) => {
//               const slug = post.category?.slug ?? ""
//               const categoryName = post.category?.name ?? ""

//               const badge = post.badge?.trim()
//               const tagText = badge || categoryName

//               let tagClass = "bg-[#9CA3AF]"

//               if (badge) {
//                 tagClass =
//                   BADGE_COLORS[badge.toUpperCase()] || "bg-[#6B7280]"
//               } else {
//                 const match = Object.keys(CATEGORY_COLORS).find((key) =>
//                   slug.toLowerCase().includes(key)
//                 )
//                 if (match) tagClass = CATEGORY_COLORS[match]
//               }

//               const imageUrl =
//                 post.imageUrl?.startsWith("http")
//                   ? post.imageUrl
//                   : post.imageUrl
//                   ? `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`
//                   : "/placeholder.svg"

//               return (
//                 <div
//                   key={post.id}
//                   className="bg-white rounded-xl p-4 sm:p-5 flex gap-4 h-[140px] sm:h-[160px] overflow-hidden"
//                 >
//                   {/* THUMBNAIL */}
//                   <Link
//                     href={`/post/${post.slug}`}
//                     className="relative w-[72px] h-[72px] sm:w-[96px] sm:h-[96px] rounded-xl overflow-hidden flex-shrink-0"
//                   >
//                     <Image
//                       src={imageUrl}
//                       alt={post.title}
//                       fill
//                       sizes="96px"
//                       className={`object-cover transition-all duration-500 ${
//                         fade
//                           ? "opacity-100 scale-100"
//                           : "opacity-0 scale-95"
//                       }`}
//                     />
//                   </Link>

//                   {/* CONTENT */}
//                   <div
//                     className={`flex flex-col gap-2 min-w-0 transition-all duration-500 ${
//                       fade
//                         ? "translate-y-0 opacity-100"
//                         : "translate-y-2 opacity-0"
//                     }`}
//                   >
//                     {tagText && (
//                       <span
//                         className={`${tagClass} text-white px-3 py-[3px] rounded-full rounded-tl-none w-fit text-[11px] font-medium`}
//                       >
//                         {tagText}
//                       </span>
//                     )}

//                     <h6 className="text-[15px] sm:text-[17px] leading-snug font-semibold text-[#121213] line-clamp-2">
//                       <Link href={`/post/${post.slug}`}>
//                         {post.title}
//                       </Link>
//                     </h6>

//                     <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#616C74]">
//                       <span>
//                         By{" "}
//                         <span className="font-medium">
//                           {post.author?.name ?? "rstheme"}
//                         </span>
//                       </span>
//                       <span>
//                         {post.views?.toLocaleString() ?? 0} Views
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>

//         </div>
//       </div>
//     </section>
//   )
// }

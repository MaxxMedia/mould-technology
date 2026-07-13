// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import type { Post } from "../types/Post";

// /* ================= COLOR CONFIG ================= */

// const BADGE_COLORS: Record<string, string> = {
//   FEATURED: "bg-[#E11D48]",
//   WEBINAR: "bg-[#7C3AED]",
//   EVENT: "bg-[#0EA5E9]",
//   TRENDING: "bg-[#F97316]",
//   EXCLUSIVE: "bg-[#059669]",
// };

// const CATEGORY_COLORS: Record<string, string> = {
//   trending: "bg-[#F59E0B]", // yellow
//   latest: "bg-[#F69C00]",
//   video: "bg-[#EF4444]",
//   engineering: "bg-[#2563EB]",
// };

// export default function TrendingSection() {
//   const [posts, setPosts] = useState<Post[]>([]);

//   useEffect(() => {
//     async function fetchPosts() {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`
//       );
//       const data = await res.json();
//       const allPosts: Post[] = data.data || data;

//       const trendingPosts = allPosts.filter((p) =>
//         typeof p.category === "object"
//           ? p.category?.slug?.toLowerCase().includes("trending")
//           : String(p.category || "").toLowerCase().includes("trending")
//       );

//       setPosts(trendingPosts.slice(0, 5));
//     }

//     fetchPosts();
//   }, []);

//   if (!posts.length) return null;

//   const [s1, s2, s3, big, right] = posts;

//   const imageUrl = (post?: Post) =>
//     post?.imageUrl?.startsWith("http")
//       ? post.imageUrl
//       : post?.imageUrl
//       ? `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`
//       : "/placeholder.jpg";

//   const Meta = ({ post }: { post?: Post }) =>
//     post ? (
//       <div className="flex items-center gap-4 mt-2 text-[13px] text-white/70">
//         <span>{post.views?.toLocaleString()} Views</span>
//         {post.publishedAt && (
//           <span>
//             {new Date(post.publishedAt).toLocaleDateString("en-US", {
//               month: "short",
//               day: "numeric",
//               year: "numeric",
//             })}
//           </span>
//         )}
//       </div>
//     ) : null;

//   /* ================= TAG HELPER ================= */

//   const getTag = (post?: Post) => {
//     const badge = post?.badge?.trim();

//     const slug =
//       typeof post?.category === "object"
//         ? post?.category?.slug?.toLowerCase() || ""
//         : String(post?.category || "").toLowerCase();

//     const categoryName =
//       typeof post?.category === "object"
//         ? post?.category?.name || ""
//         : String(post?.category || "");

//     const text = badge ? badge : categoryName;

//     let color = "bg-gray-400";

//     if (badge) {
//       color = BADGE_COLORS[badge.toUpperCase()] || "bg-gray-500";
//     } else {
//       const match = Object.keys(CATEGORY_COLORS).find((k) =>
//         slug.includes(k)
//       );
//       if (match) color = CATEGORY_COLORS[match];
//     }

//     return { text, color };
//   };

//   return (
//     <section className="bg-[#0f1318] pt-[70px] pb-[80px] text-white">
//       <div className="max-w-[1320px] mx-auto px-[12px] space-y-10">

//         {/* HEADER */}
//         <div className="flex items-center justify-between">
//           <h2 className="text-[36px] font-semibold text-white">
//             Trending News
//           </h2>
//           <Link href="/trending" className="text-sm text-white/70 hover:text-white">
//             View All →
//           </Link>
//         </div>

//         {/* TOP 3 SMALL POSTS */}
//         <div className="relative py-8">
//           <span className="absolute top-0 left-0 w-full h-px bg-white/10" />
//           <span className="absolute bottom-0 left-0 w-full h-px bg-white/10" />

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {[s1, s2, s3].map(
//               (post, i) =>
//                 post && (() => {
//                   const tag = getTag(post);
//                   return (
//                     <div key={i} className="flex gap-4">
//                       <Image
//                         src={imageUrl(post)}
//                         alt={post.title}
//                         width={90}
//                         height={90}
//                         className="rounded-lg object-cover"
//                       />
//                       <div>
//                         {tag.text && (
//                           <span
//                             className={`${tag.color} inline-block mb-2 text-xs font-bold px-3 py-1 rounded text-black`}
//                           >
//                             {tag.text}
//                           </span>
//                         )}
//                         <h3 className="text-white text-[16px] font-semibold leading-snug">
//                           {post.title}
//                         </h3>
//                         <Meta post={post} />
//                       </div>
//                     </div>
//                   );
//                 })()
//             )}
//           </div>
//         </div>

//         {/* FEATURE POSTS */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//           {big && (() => {
//             const tag = getTag(big);
//             return (
//               <Link
//                 href={`/post/${big.slug}`}
//                 className="lg:col-span-2 relative h-[420px] rounded-xl overflow-hidden"
//               >
//                 <Image src={imageUrl(big)} alt={big.title} fill className="object-cover" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
//                 <div className="absolute bottom-6 left-6 max-w-xl">
//                   {tag.text && (
//                     <span className={`${tag.color} text-xs font-bold px-3 py-1 rounded`}>
//                       {tag.text}
//                     </span>
//                   )}
//                   <h2 className="text-white text-[30px] font-semibold mt-4">
//                     {big.title}
//                   </h2>
//                   <Meta post={big} />
//                 </div>
//               </Link>
//             );
//           })()}

//           {right && (() => {
//             const tag = getTag(right);
//             return (
//               <Link
//                 href={`/post/${right.slug}`}
//                 className="relative h-[420px] rounded-xl overflow-hidden"
//               >
//                 <Image src={imageUrl(right)} alt={right.title} fill className="object-cover" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
//                 <div className="absolute bottom-6 left-6">
//                   {tag.text && (
//                     <span className={`${tag.color} text-xs font-bold px-3 py-1 rounded`}>
//                       {tag.text}
//                     </span>
//                   )}
//                   <h3 className="text-white text-[24px] font-semibold mt-4">
//                     {right.title}
//                   </h3>
//                   <Meta post={right} />
//                 </div>
//               </Link>
//             );
//           })()}

//         </div>
//       </div>
//     </section>
//   );
// }


"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import type { Post } from "../types/Post";

/* ================= COLOR CONFIG ================= */

const BADGE_COLORS: Record<string, string> = {
  FEATURED: "bg-[#E11D48]",
  WEBINAR: "bg-[#7C3AED]",
  EVENT: "bg-[#0EA5E9]",
  TRENDING: "bg-[#F97316]",
  EXCLUSIVE: "bg-[#059669]",
};

const CATEGORY_COLORS: Record<string, string> = {
  trending: "bg-[#F59E0B]",
  latest: "bg-[#F69C00]",
  video: "bg-[#EF4444]",
  engineering: "bg-[#2563EB]",
};

type Props = {
  posts: Post[];
};

export default function TrendingSection({ posts }: Props) {

  /* ================= FILTER TRENDING ================= */

  const filteredPosts = useMemo(() => {
    return posts
      .filter((p) =>
        typeof p.category === "object"
          ? p.category?.slug?.toLowerCase().includes("trending")
          : String(p.category || "").toLowerCase().includes("trending")
      )
      .slice(0, 5);
  }, [posts]);

  if (!filteredPosts.length) return null;

  const [s1, s2, s3, big, right] = filteredPosts;

  /* ================= HELPERS ================= */

  const imageUrl = (post?: Post) =>
    post?.imageUrl?.startsWith("http")
      ? post.imageUrl
      : post?.imageUrl
      ? `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`
      : "/placeholder.jpg";

  const Meta = ({ post }: { post?: Post }) =>
    post ? (
      <div className="flex items-center gap-4 mt-2 text-[13px] text-white/70">
        <span>{post.views?.toLocaleString()} Views</span>
        {post.publishedAt && (
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>
    ) : null;

  const getTag = (post?: Post) => {
    const badge = post?.badge?.trim();

    const slug =
      typeof post?.category === "object"
        ? post?.category?.slug?.toLowerCase() || ""
        : String(post?.category || "").toLowerCase();

    const categoryName =
      typeof post?.category === "object"
        ? post?.category?.name || ""
        : String(post?.category || "");

    const text = badge ? badge : categoryName;

    let color = "bg-gray-400";

    if (badge) {
      color = BADGE_COLORS[badge.toUpperCase()] || "bg-gray-500";
    } else {
      const match = Object.keys(CATEGORY_COLORS).find((k) =>
        slug.includes(k)
      );
      if (match) color = CATEGORY_COLORS[match];
    }

    return { text, color };
  };

  /* ================= RENDER ================= */

  return (
    <section className="bg-[#0f1318] pt-[70px] pb-[80px] text-white">
      <div className="max-w-[1320px] mx-auto px-[12px] space-y-10">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-[36px] font-semibold">
            Trending News
          </h2>
          <Link
            href="/post/tooling-plays-a-fundamental-role-in-manufacturing"
            className="text-sm text-white/70 hover:text-white"
          >
            View All →
          </Link>
        </div>

    {/* TOP 3 SMALL POSTS */}
<div className="relative py-8">
  <span className="absolute top-0 left-0 w-full h-px bg-white/10" />
  <span className="absolute bottom-0 left-0 w-full h-px bg-white/10" />

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[s1, s2, s3].map(
      (post, i) =>
        post && (() => {
          const tag = getTag(post);
          return (
            <Link
              key={i}
              href={`/post/${post.slug}`}
              className="flex gap-4 group hover:opacity-90 transition"
            >
              <Image
                src={imageUrl(post)}
                alt={post.title}
                width={90}
                height={90}
                sizes="90px"
                quality={70}
                className="rounded-md object-cover"
              />

              <div>
                {tag.text && (
                  <span
                    className={`${tag.color} inline-block mb-2 text-xs font-bold px-3 py-1 rounded text-black`}
                  >
                    {tag.text}
                  </span>
                )}

                <h3 className="text-[16px] font-semibold leading-snug group-hover:text-gray-300 transition">
                  {post.title}
                </h3>

                <Meta post={post} />
              </div>
            </Link>
          );
        })()
    )}
  </div>
</div>

        {/* FEATURE POSTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {big && (() => {
            const tag = getTag(big);
            return (
              <Link
                href={`/post/${big.slug}`}
                className="lg:col-span-2 relative h-[420px] rounded-md overflow-hidden"
              >
                <Image
                  src={imageUrl(big)}
                  alt={big.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  quality={75}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 max-w-xl">
                  {tag.text && (
                    <span className={`${tag.color} text-xs font-bold px-3 py-1 rounded`}>
                      {tag.text}
                    </span>
                  )}
                  <h2 className="text-[30px] font-semibold mt-4">
                    {big.title}
                  </h2>
                  <Meta post={big} />
                </div>
              </Link>
            );
          })()}

          {right && (() => {
            const tag = getTag(right);
            return (
              <Link
                href={`/post/${right.slug}`}
                className="relative h-[420px] rounded-md overflow-hidden"
              >
                <Image
                  src={imageUrl(right)}
                  alt={right.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  quality={75}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  {tag.text && (
                    <span className={`${tag.color} text-xs font-bold px-3 py-1 rounded`}>
                      {tag.text}
                    </span>
                  )}
                  <h3 className="text-[24px] font-semibold mt-4">
                    {right.title}
                  </h3>
                  <Meta post={right} />
                </div>
              </Link>
            );
          })()}

        </div>
      </div>
    </section>
  );
}

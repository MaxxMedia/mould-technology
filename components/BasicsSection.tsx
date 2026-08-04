"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useEffect, useState } from "react";
import type { Post } from "../types/Post";
import Banner from "./Banners/Banner";

/* ================= CATEGORY COLORS ================= */

const CATEGORY_COLORS: Record<string, string> = {
  basics: "bg-[#0073ff]",
  trending: "bg-[#F59E0B]",
  latest: "bg-[#F69C00]",
  video: "bg-[#EF4444]",
  engineering: "bg-[#2563EB]",
  maintain: "bg-[#8B5CF6]",
  machining: "bg-[#EC4899]",
  build: "bg-[#14B8A6]",
  "cutting-tools": "bg-[#F97316]",
  "advanced-manufacturing": "bg-[#6366F1]",
};

// Keep this in sync with your actual category slugs once you confirm
// them from the console log below (search: "Sample category slugs seen").
const BASIC_CATEGORIES = [
  "basics",
  "maintain",
  "machining",
  "build",
  "cutting-tools",
  "advanced-manufacturing",
];

type Props = {
  posts: Post[];
};

function getCategorySlug(post: Post): string {
  const slug =
    typeof post.category === "object" && post.category !== null
      ? post.category?.slug || ""
      : String(post.category || "");
  return slug.toLowerCase().trim();
}

export default function BasicsSection({ posts }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log("BasicsSection mounted with posts:", posts?.length || 0);

    if (Array.isArray(posts) && posts.length > 0) {
      const allSlugs = posts.map((p) => getCategorySlug(p));
      const uniqueSlugs = Array.from(new Set(allSlugs));
    }
  }, [posts]);

  /* ================= FILTER BASICS ================= */
  // Partial match (not exact) so hyphenated/variant slugs still match,
  // e.g. slug "cutting-tools-guide" still matches "cutting-tools".

  const basicsPosts = useMemo(() => {
    if (!Array.isArray(posts)) return [];

    const matched = posts.filter((post) => {
      const slug = getCategorySlug(post);
      if (!slug) return false;
      return BASIC_CATEGORIES.some((cat) => slug.includes(cat));
    });

    if (matched.length > 0) {
      return matched.slice(0, 6);
    }

    // Fallback: nothing matched the whitelist above. Rather than showing
    // an empty section (which is what was happening), fall back to the
    // most recent posts so the section stays populated while the real
    // category slugs get confirmed from the console log.
    console.warn(
      "⚠️ No posts matched BASIC_CATEGORIES — falling back to recent posts. " +
      "Check the console log above for real slugs and update BASIC_CATEGORIES."
    );
    return posts.slice(0, 6);
  }, [posts]);

  if (!basicsPosts || basicsPosts.length === 0) {
    return (
      <section className="bg-[#ffffff] py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#121213]">
              Basics & Fundamentals
            </h2>
          </div>
          <div className="text-center py-10">
            <p className="text-gray-500">No articles available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  /* ================= IMAGE HELPER ================= */

  const imageUrl = (post: Post) => {
    if (post.imageUrl?.startsWith("http")) {
      return post.imageUrl;
    }
    if (post.imageUrl) {
      return `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`;
    }
    return "/placeholder.jpg";
  };

  /* ================= TAG LOGIC ================= */

  const getTag = (post: Post) => {
    const badge = post?.badge?.trim();
    const slug = getCategorySlug(post);

    const matchedKey = Object.keys(CATEGORY_COLORS).find((key) =>
      slug.includes(key)
    );

    const color = matchedKey ? CATEGORY_COLORS[matchedKey] : "bg-[#0073ff]";

    const label =
      badge ||
      (typeof post?.category === "object" && post?.category !== null
        ? post?.category?.name
        : post?.category) ||
      slug;

    return {
      text: label,
      color,
    };
  };

  /* ================= RENDER - GRID LAYOUT ================= */

  return (
    <section className="bg-[#f8f9fa] py-12 sm:py-16">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#121213]">
              Basics & Fundamentals
            </h2>
            <p className="text-sm text-[#616c74] mt-1">
              Essential knowledge for manufacturing professionals
            </p>
          </div>

          <Link
            href="/articles"
            className="text-sm font-semibold uppercase text-[#0073ff] hover:underline"
          >
            View All →
          </Link>
        </div>

        {/* GRID - 3 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {basicsPosts.map((post) => {
            const tag = getTag(post);

            return (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col justify-between h-full"
              >
                {/* IMAGE */}
                <Link
                  href={`/post/${post.slug}`}
                  className="relative block w-full aspect-[16/10] overflow-hidden"
                >
                  <Image
                    src={imageUrl(post)}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={70}
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* CONTENT */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    {/* Category Tag */}
                    {tag.text && (
                      <span
                        className={`${tag.color} inline-block mb-3 text-[10px] font-bold uppercase text-white px-3 py-1 rounded-full`}
                      >
                        {tag.text}
                      </span>
                    )}

                    <h3 className="text-lg font-semibold text-[#121213] leading-snug mb-2 line-clamp-2">
                      <Link href={`/post/${post.slug}`} className="hover:text-[#0073ff] transition">
                        {post.title}
                      </Link>
                    </h3>

                    {post.excerpt && (
                      <p className="text-sm text-[#616c74] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Read More Link */}
                  <Link
                    href={`/post/${post.slug}`}
                    className="inline-block mt-4 text-sm font-medium text-[#0073ff] hover:underline"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
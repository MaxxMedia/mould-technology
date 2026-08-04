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
  tech: "bg-[#0EA5E9]",
  trending: "bg-[#F59E0B]",
  latest: "bg-[#F69C00]",
  video: "bg-[#EF4444]",
  gaming: "bg-[#2563EB]",
  engineering: "bg-[#2563EB]",
  articles: "bg-[#8B5CF6]",
  travel: "bg-[#F97316]",
  manufacturing: "bg-[#059669]",
};

type Props = {
  posts: Post[];
};

export default function TrendingSection({ posts }: Props) {
  /* ================= HELPER: Get author name ================= */
  const getAuthorName = (post?: Post) => {
    if (!post?.author) return null;
    if (typeof post.author === "object" && 'name' in post.author) {
      return post.author.name;
    }
    return String(post.author);
  };

  /* ================= GET MOST VIEWED POSTS ================= */
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [posts]);

  // Distribution:
  // 1st most viewed  -> Big hero card (left, wide)
  // 2nd most viewed  -> Big hero card (right, narrow)
  // 3rd, 4th, 5th    -> 3 small cards row below
  const leftHero = sortedPosts[0];
  const rightHero = sortedPosts[1];
  const smallPosts = sortedPosts.slice(2, 5);

  if (!sortedPosts || sortedPosts.length === 0) {
    console.log("⚠️ No posts found");
    return null;
  }

  /* ================= HELPERS ================= */

  const imageUrl = (post?: Post) =>
    post?.imageUrl?.startsWith("http")
      ? post.imageUrl
      : post?.imageUrl
        ? `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`
        : "/placeholder.jpg";

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
      const match = Object.keys(CATEGORY_COLORS).find((k) => slug.includes(k));
      if (match) color = CATEGORY_COLORS[match];
    }

    return { text, color };
  };

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  // Small views icon (bolt)
  const ViewsIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block"
    >
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="inline-block"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );

  const Meta = ({ post }: { post?: Post }) => {
    const authorName = getAuthorName(post);
    return post ? (
      <div className="flex items-center gap-4 mt-2 text-[13px] text-white/70">
        {authorName && <span>By {authorName}</span>}
        <span className="flex items-center gap-1">
          <ViewsIcon /> {post.views?.toLocaleString()} Views
        </span>
        {post.createdAt && (
          <span className="flex items-center gap-1">
            <CalendarIcon /> {formatDate(post.createdAt)}
          </span>
        )}
      </div>
    ) : null;
  };

  // Hero card (used for both left & right top cards)
  const HeroCard = ({
    post,
    className = "",
  }: {
    post: Post;
    className?: string;
  }) => {
    const tag = getTag(post);
    return (
      <Link
        href={`/post/${post.slug}`}
        className={`relative h-[380px] rounded-md overflow-hidden group ${className}`}
      >
        <Image
          src={imageUrl(post)}
          alt={post.title}
          fill
          sizes="(max-width: 1024px) 100vw, 800px"
          quality={75}
          className="object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          {tag.text && (
            <span
              className={`${tag.color} text-white text-[11px] font-bold px-3 py-1 rounded uppercase`}
            >
              {tag.text}
            </span>
          )}
          <h2 className="text-[22px] md:text-[26px] font-semibold mt-3 leading-tight line-clamp-2">
            {post.title}
          </h2>
          <Meta post={post} />
        </div>
      </Link>
    );
  };

  // Small card component (bottom row)
  const SmallCard = ({ post }: { post: Post }) => {
    const tag = getTag(post);
    const authorName = getAuthorName(post);
    return (
      <Link
        href={`/post/${post.slug}`}
        className="flex gap-4 group hover:opacity-90 transition"
      >
        <div className="flex-shrink-0">
          <Image
            src={imageUrl(post)}
            alt={post.title}
            width={100}
            height={80}
            sizes="100px"
            quality={70}
            className="rounded-md object-cover w-[100px] h-[80px]"
          />
        </div>

        <div className="flex-1 min-w-0">
          {tag.text && (
            <span
              className={`${tag.color} inline-block mb-1 text-[10px] px-2 py-0.5 rounded text-white uppercase`}
            >
              {tag.text}
            </span>
          )}

          <h3 className="text-[20px] leading-snug group-hover:text-gray-300 transition line-clamp-2">
  {post.title}
</h3>

          <div className="flex items-center gap-3 mt-1 text-[12px] text-white/70">
            {authorName && <span>By {authorName}</span>}
            <span className="flex items-center gap-1">
              <ViewsIcon /> {post.views?.toLocaleString()} Views
            </span>
          </div>
        </div>
      </Link>
    );
  };

  /* ================= RENDER ================= */

  return (
    <section className="bg-[#0f1318] pt-[70px] pb-[80px] text-white">
      <div className="max-w-[1320px] mx-auto px-[12px] space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-[36px] font-semibold">Trending News</h2>
          <Link href="/articles" className="text-sm text-white/70 hover:text-white flex items-center gap-1">
            View All <span>→</span>
          </Link>
        </div>

        {/* TOP: 2 HERO CARDS (2/3 + 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {leftHero && <HeroCard post={leftHero} className="lg:col-span-2" />}
          {rightHero && <HeroCard post={rightHero} className="lg:col-span-1" />}
        </div>

        {/* BOTTOM: 3 SMALL CARDS */}
        <div className="relative py-8">
          <span className="absolute top-0 left-0 w-full h-px bg-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {smallPosts.map((post, i) => post && <SmallCard key={i} post={post} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
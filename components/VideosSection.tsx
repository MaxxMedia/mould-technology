"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Post } from "../types/Post";

type VideoPost = Post;

/* ================= COLOR CONFIG ================= */

const BADGE_COLORS: Record<string, string> = {
  FEATURED: "bg-[#E11D48]",
  WEBINAR: "bg-[#7C3AED]",
  EVENT: "bg-[#0EA5E9]",
  TRENDING: "bg-[#F97316]",
  EXCLUSIVE: "bg-[#059669]",
};

const CATEGORY_COLORS: Record<string, string> = {
  video: "bg-[#F69C00]",
  "header-videos": "bg-[#EF4444]",
  latest: "bg-[#F69C00]",
  engineering: "bg-[#0072BC]",
  gaming: "bg-[#8B5CF6]",
  food: "bg-[#F97316]",
  travel: "bg-[#0EA5E9]",
  tech: "bg-[#2563EB]",
  leadership: "bg-[#7C3AED]",
  machine: "bg-[#059669]",
};

type Props = {
  posts: Post[];
};

function getYoutubeEmbed(url?: string) {
  if (!url) return "";

  let videoId = "";

  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  } else {
    videoId = url.match(/[?&]v=([^&]+)/)?.[1] || "";
  }

  if (!videoId) return "";

  return `https://www.youtube.com/embed/${videoId}?&rel=0`;
}

/**
 * Renders the real avatar image when one exists, otherwise falls back to
 * a generated initials circle instead of a static placeholder file —
 * this can never 404 / show a broken-image icon.
 */
function AuthorAvatar({
  name,
  avatarUrl,
  size,
}: {
  name?: string | null;
  avatarUrl?: string | null;
  size: number;
}) {
  const displayName = name?.trim() || "rstheme";

  if (avatarUrl) {
    return (
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <Image
          src={avatarUrl}
          alt={displayName}
          fill
          sizes={`${size}px`}
          className="rounded-full object-cover border border-white/30"
        />
      </div>
    );
  }

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <span
      style={{ width: size, height: size }}
      className="rounded-full bg-[#0073ff] text-white flex items-center justify-center font-semibold shrink-0 border border-white/30"
    >
      <span style={{ fontSize: Math.max(10, size * 0.45) }}>{initial}</span>
    </span>
  );
}

export default function VideosSection({ posts }: Props) {
  /* ================= FILTER VIDEOS ================= */
  const videos = useMemo(() => {
    return posts
      .filter((post) => {
        const slug =
          typeof post.category === "object"
            ? post.category?.slug?.toLowerCase() || ""
            : String(post.category || "").toLowerCase();

        // Check for header-videos category
        return slug === "header-videos" || slug.includes("video");
      })
      .slice(0, 4);
  }, [posts]);

  // MOVED useState BEFORE the early return
  // Use a safe default value
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | undefined>(videos[0]);

  // If no videos found, return null (but after all hooks)
  if (!videos.length) {
    console.log("⚠️ No videos found");
    return null;
  }

  // Update selected video if it becomes undefined or if videos change
  // But only if videos has data
  if (!selectedVideo && videos.length > 0) {
    setSelectedVideo(videos[0]);
  }

  const sideVideos = videos.filter((v) => v.id !== selectedVideo?.id);

  const imageUrl = (v?: VideoPost) =>
    v?.imageUrl?.startsWith("http")
      ? v.imageUrl
      : v?.imageUrl
        ? `${process.env.NEXT_PUBLIC_API_URL}${v.imageUrl}`
        : "/placeholder.jpg";

  const date = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      : "";

  /* ================= AUTHOR META ================= */

  // Always renders — falls back to "rstheme" + an initials avatar
  // instead of disappearing entirely when a video has no author.
  const AuthorMeta = ({ video }: { video?: VideoPost }) => (
    <span className="flex items-center gap-1.5">
      <AuthorAvatar
        name={video?.author?.name}
        avatarUrl={video?.author?.avatarUrl}
        size={18}
      />
      {video?.author?.name || "rstheme"}
    </span>
  );

  /* ================= TAG HELPERS ================= */

  const getTag = (post?: VideoPost) => {
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

    let color = "bg-[#9CA3AF]";

    if (badge) {
      color = BADGE_COLORS[badge.toUpperCase()] || "bg-[#6B7280]";
    } else {
      const match = Object.keys(CATEGORY_COLORS).find((k) =>
        slug.includes(k)
      );
      if (match) color = CATEGORY_COLORS[match];
    }

    return { text, color };
  };

  const featuredTag = getTag(selectedVideo);

  /* ================= RENDER ================= */

  return (
    <section className="bg-[#0b0e13] text-white py-12 sm:py-16">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold">Watch Videos</h2>

          <Link
            href="/videos"
            className="text-[12px] font-medium flex items-center gap-2 hover:underline text-gray-300 hover:text-white"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[8fr_4fr] gap-6 lg:gap-8">
          {/* FEATURED VIDEO - LEFT SIDE */}
          <div className="relative h-[260px] sm:h-[360px] md:h-[420px] lg:h-[450px] rounded-md overflow-hidden bg-black">
            {selectedVideo?.youtubeUrl ? (
              <iframe
                key={selectedVideo.id}
                src={getYoutubeEmbed(selectedVideo.youtubeUrl)}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl(selectedVideo)}
                    alt={selectedVideo?.title || "Video"}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                    className="object-cover"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="
                      group
                      w-16 h-16
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
                      className="w-6 h-6 ml-1 fill-white group-hover:fill-red-600 transition-colors duration-300"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 max-w-[85%]">
                  {featuredTag?.text && (
                    <span
                      className={`${featuredTag.color} text-[12px] font-bold px-3 py-1 rounded`}
                    >
                      {featuredTag.text}
                    </span>
                  )}

                  <h3 className="text-[24px] font-semibold mt-4 leading-snug">
                    {selectedVideo?.title}
                  </h3>

                  <div className="flex items-center gap-4 text-[12px] text-gray-300 mt-3">
                    <AuthorMeta video={selectedVideo} />
                    <span>{date(selectedVideo?.createdAt)}</span>
                    {selectedVideo?.views !== undefined && selectedVideo?.views !== null && (
                      <span>{selectedVideo.views.toLocaleString()} Views</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* SIDE VIDEOS - RIGHT SIDE - EXACTLY MATCHING HEIGHT */}
          <div className="flex flex-col h-[420px]">
            {sideVideos.map((video, index) => {
              const tag = getTag(video);
              const isLast = index === sideVideos.length - 1;

              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setSelectedVideo(video)}
                  className={`
                    flex gap-3 w-full text-left hover:opacity-90 transition group flex-1 items-center
                    ${!isLast ? 'border-b border-white/10' : ''}
                  `}
                >
                  <div className="relative w-[130px] h-[85px] rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={imageUrl(video)}
                      alt={video.title}
                      fill
                      sizes="130px"
                      quality={70}
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition">
                      <div
                        className="
                          w-8 h-8
                          rounded-full
                          bg-white/20
                          backdrop-blur-md
                          border border-white/40
                          shadow-[0_4px_16px_rgba(0,0,0,0.35)]
                          flex items-center justify-center
                          transition-all duration-300
                          group-hover:bg-white/30
                          group-hover:scale-110
                        "
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-3.5 h-3.5 ml-[1px] fill-white group-hover:fill-red-600 transition-colors duration-300"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {tag.text && (
                      <span
                        className={`${tag.color} text-[12px] font-bold px-2 py-0.5 rounded inline-block uppercase tracking-wide w-fit mb-1`}
                      >
                        {tag.text}
                      </span>
                    )}

                    <h4 className="text-[20px] font-semibold leading-snug line-clamp-2 group-hover:text-gray-300 transition">
                      {video.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mt-1 flex-wrap">
                      <AuthorMeta video={video} />
                      <span>•</span>
                      <span>{date(video.createdAt)}</span>
                      <span>•</span>
                      <span>{video.views ?? 0} Views</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
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
    <span className="flex items-center gap-2">
      <AuthorAvatar
        name={video?.author?.name}
        avatarUrl={video?.author?.avatarUrl}
        size={24}
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
    <section className="bg-[#171A1E] pt-[70px] pb-[80px] text-white">
      <div className="max-w-[1320px] mx-auto px-[15px]">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-[36px] font-semibold">Featured Videos</h2>

          <Link
            href="/videos"
            className="text-sm font-medium flex items-center gap-2 hover:underline"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[8fr_4fr] gap-8">
          {/* FEATURED VIDEO */}
          <div className="relative h-[460px] rounded-md overflow-hidden bg-black">
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
                <Image
                  src={imageUrl(selectedVideo)}
                  alt={selectedVideo?.title || "Video"}
                  fill
                  priority
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

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

                <div className="absolute bottom-6 left-6 max-w-[85%]">
                  {featuredTag?.text && (
                    <span
                      className={`${featuredTag.color} text-xs font-bold px-3 py-1 rounded`}
                    >
                      {featuredTag.text}
                    </span>
                  )}

                  <h3 className="text-[28px] font-semibold mt-4 leading-snug">
                    {selectedVideo?.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-300 mt-3">
                    <AuthorMeta video={selectedVideo} />
                    <span>{date(selectedVideo?.createdAt)}</span>
                    {selectedVideo?.views && (
                      <span>{selectedVideo.views.toLocaleString()} Views</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* SIDE VIDEOS */}
          <div className="space-y-6">
            {sideVideos.map((video) => {
              const tag = getTag(video);

              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setSelectedVideo(video)}
                  className="flex gap-4 pb-6 border-b border-white/10 w-full text-left hover:opacity-90 transition"
                >
                  <div className="relative w-[120px] h-[90px] rounded-md overflow-hidden">
                    <Image
                      src={imageUrl(video)}
                      alt={video.title}
                      fill
                      sizes="120px"
                      quality={70}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div
                        className="
                          group
                          w-7 h-7
                          rounded-full
                          bg-white/15
                          backdrop-blur-md
                          border border-white/30
                          shadow-[0_4px_16px_rgba(0,0,0,0.35)]
                          flex items-center justify-center
                          transition-all duration-300
                          hover:bg-white/25
                          hover:scale-110
                        "
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-3 h-3 ml-[1px] fill-white group-hover:fill-red-600 transition-colors duration-300"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    {tag.text && (
                      <span
                        className={`${tag.color} text-xs font-bold px-3 py-1 rounded`}
                      >
                        {tag.text}
                      </span>
                    )}

                    <h4 className="text-base font-semibold mt-2 leading-snug line-clamp-2">
                      {video.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                      <AuthorMeta video={video} />
                      {video.views && (
                        <span>{video.views.toLocaleString()} Views</span>
                      )}
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
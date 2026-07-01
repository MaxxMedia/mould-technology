"use client"

import { useState } from "react"

export default function VideoGallery({
  videos,
}: {
  videos: string[]
}) {
  const getVideoId = (url: string) =>
    url.split("v=")[1]?.split("&")[0] || url.split("/").pop()

  const [activeVideo, setActiveVideo] = useState(
    getVideoId(videos[0])
  )
  const [isPlaying, setIsPlaying] = useState(false)

  const thumbnailUrl = (id?: string) =>
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`

  const PlayButton = ({ size = "lg" }: { size?: "lg" | "sm" }) => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className={`
          group
          ${size === "lg" ? "w-14 h-14" : "w-8 h-8"}
          rounded-full
          bg-white/15
          backdrop-blur-md
          border border-white/30
          shadow-[0_8px_30px_rgba(0,0,0,0.35)]
          flex items-center justify-center
          transition-all duration-300
          hover:bg-white/25
          hover:scale-110
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`
            ${size === "lg" ? "w-6 h-6" : "w-3.5 h-3.5"}
            ml-[2px]
            fill-white
            group-hover:fill-red-600
            transition-colors duration-300
          `}
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  )

  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">
        Video Gallery
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ===== MAIN VIDEO ===== */}
        <div className="md:col-span-2">
          {isPlaying ? (
            <iframe
              key={activeVideo}
              className="w-full aspect-video rounded"
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              className="relative w-full aspect-video rounded overflow-hidden cursor-pointer bg-black"
              onClick={() => setIsPlaying(true)}
            >
              <img
                src={thumbnailUrl(activeVideo)}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <PlayButton size="lg" />
            </div>
          )}
        </div>

        {/* ===== SIDE SCROLL LIST ===== */}
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
          {videos.map((url, idx) => {
            const id = getVideoId(url)

            return (
              <div
                key={idx}
                onClick={() => {
                  setActiveVideo(id)
                  setIsPlaying(false)
                }}
                className={`relative cursor-pointer rounded overflow-hidden transition border
                  ${
                    activeVideo === id
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-transparent hover:border-gray-400"
                  }
                `}
              >
                <img
                  src={thumbnailUrl(id)}
                  alt="Video thumbnail"
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                <PlayButton size="sm" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
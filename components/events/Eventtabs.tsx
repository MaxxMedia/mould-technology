"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronRight } from "lucide-react"

type Event = {
  videoUrl: any
  title: string
  description: string
  images?: string[]
  videos?: string[]
  frequency?: string
  edition?: string
  expectedVisitors?: string
  exhibitors?: string
  organizer?: string
  websiteUrl?: string
  email?: string
  phone?: string
  highlights?: string[]
}

const TABS = [
  { label: "About Us", id: "about" },
  { label: "Images Gallery", id: "gallery" },
  { label: "Video", id: "video" },
  { label: "Other Details", id: "details" },
]


function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function getYoutubeEmbedUrl(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

export default function EventTabs({ event }: { event: Event }) {
  const [imgIndex, setImgIndex] = useState(0)
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const images = event.images ?? []
  const videos = event.videos ?? []

  return (
    <div className="space-y-6">
      {/* TAB NAV */}
      <div className="bg-white rounded-xl border border-gray-100 flex border-b">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-semibold uppercase tracking-wide border-b-2 ${
              activeTab === tab.id
                ? "text-red-600 border-red-600"
                : "text-gray-500 border-transparent hover:text-red-600 hover:border-red-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ABOUT / DESCRIPTION */}
      {activeTab === "about" && (
        <>
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold border-b-2 border-red-600 inline-block pb-1 mb-4">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-line mb-4">{event.description}</p>
            {event.highlights && event.highlights.length > 0 && (
              <ul className="space-y-1">
                {event.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="text-red-500 mt-1">›</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold border-b-2 border-red-600 inline-block pb-1 mb-4">
              Images Gallery
            </h2>
            {images.length > 0 ? (
              <div>
                <div className="relative w-full h-80 rounded-lg overflow-hidden mb-3">
                  <Image src={images[imgIndex]} alt={event.title} fill className="object-cover" />
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-red-600 text-white w-8 h-8 rounded-full"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => setImgIndex(i => (i + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white w-8 h-8 rounded-full"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`relative w-28 h-16 flex-shrink-0 rounded overflow-hidden border-2 ${
                        i === imgIndex ? "border-red-600" : "border-transparent"
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No images available.</p>
            )}
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold border-b-2 border-red-600 inline-block pb-1 mb-4">
              Videos
            </h2>
            {event.videoUrl ? (
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe src={event.videoUrl} className="w-full h-full" allowFullScreen />
              </div>
            ) : (
              <p className="text-gray-500">No video available.</p>
            )}
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold border-b-2 border-red-600 inline-block pb-1 mb-4">
              Other Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm">
              <DetailRow label="Frequency" value={event.frequency} />
              <DetailRow label="Organizer" value={event.organizer} />
              <DetailRow label="Edition" value={event.edition} />
              <DetailRow label="Website" value={event.websiteUrl} fullWidth />
              <DetailRow label="Expected Visitors" value={event.expectedVisitors} />
              <DetailRow label="Email" value={event.email} fullWidth />
              <DetailRow label="Exhibitors" value={event.exhibitors} />
              <DetailRow label="Phone" value={event.phone} />
            </div>
          </section>
        </>
      )}

      {/* IMAGES GALLERY */}

      <section id="gallery" className="bg-white rounded-xl border border-gray-100 p-6 scroll-mt-20">
        <h2 className="text-lg font-bold border-b-2 border-red-600 inline-block pb-1 mb-4">
          Images Gallery
        </h2>
        {images.length > 0 ? (
          <div>
            <div className="relative w-full h-80 rounded-lg overflow-hidden mb-3 bg-gray-100">
              <Image
                src={images[imgIndex]}
                alt={event.title}
                fill
                className="object-cover"
                unoptimized
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImgIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-red-600 text-white w-8 h-8 rounded-full"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white w-8 h-8 rounded-full"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`relative w-28 h-16 flex-shrink-0 rounded overflow-hidden border-2 bg-gray-100 ${i === imgIndex ? "border-red-600" : "border-transparent"
                    }`}
                >
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No images available.</p>
        )}
      </section>

      {/* VIDEOS */}
      <section id="video" className="bg-white rounded-xl border border-gray-100 p-6 scroll-mt-20">
        <h2 className="text-lg font-bold border-b-2 border-red-600 inline-block pb-1 mb-4">
          Videos
        </h2>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((url, i) => (
              <div key={i} className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={getYoutubeEmbedUrl(url)}
                  className="w-full h-full"
                  allowFullScreen
                  title={`${event.title} video ${i + 1}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No video available.</p>
        )}
      </section>

      {/* OTHER DETAILS */}
      {activeTab === "details" && (
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold border-b-2 border-red-600 inline-block pb-1 mb-4">
            Other Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm">
            <DetailRow label="Frequency" value={event.frequency} />
            <DetailRow label="Organizer" value={event.organizer} />
            <DetailRow label="Edition" value={event.edition} />
            <DetailRow label="Website" value={event.websiteUrl} fullWidth />
            <DetailRow label="Expected Visitors" value={event.expectedVisitors} />
            <DetailRow label="Email" value={event.email} fullWidth />
            <DetailRow label="Exhibitors" value={event.exhibitors} />
            <DetailRow label="Phone" value={event.phone} />
          </div>
        </section>
      )}
    </div>
  )
}

function DetailRow({ label, value, fullWidth }: { label: string; value?: string; fullWidth?: boolean }) {
  if (!value) return null
  const isUrl = /^https?:\/\//.test(value)
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  return (
    <div className={`flex items-center gap-2 text-[15px] ${fullWidth ? "md:col-span-2" : ""}`}>
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 flex-shrink-0">
        <ChevronRight size={13} strokeWidth={3} />
      </span>
      <span className="text-gray-500 w-28 flex-shrink-0">{label}</span>
      <span className="text-gray-800 break-words min-w-0">
        {isUrl ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {value}
          </a>
        ) : isEmail ? (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </span>
    </div>
  )
}
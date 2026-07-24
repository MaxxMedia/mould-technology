"use client"

import { useState } from "react"
import Image from "next/image"

type Event = {
  title: string
  description: string
  images?: string[]
  videoUrl?: string
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

export default function EventTabs({ event }: { event: Event }) {
  const [imgIndex, setImgIndex] = useState(0)
  const images = event.images ?? []

  return (
    <div className="space-y-6">
      {/* TAB NAV — scrolls to each section below */}
      <div className="bg-white rounded-xl border border-gray-100 flex border-b sticky top-0 z-10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => scrollToSection(tab.id)}
            className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-gray-500 border-b-2 border-transparent hover:text-red-600 hover:border-red-600"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ABOUT / DESCRIPTION */}
      <section id="about" className="bg-white rounded-xl border border-gray-100 p-6 scroll-mt-20">
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

      {/* IMAGES GALLERY */}
      <section id="gallery" className="bg-white rounded-xl border border-gray-100 p-6 scroll-mt-20">
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

      {/* VIDEOS */}
      <section id="video" className="bg-white rounded-xl border border-gray-100 p-6 scroll-mt-20">
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

      {/* OTHER DETAILS */}
      <section id="details" className="bg-white rounded-xl border border-gray-100 p-6 scroll-mt-20">
        <h2 className="text-lg font-bold border-b-2 border-red-600 inline-block pb-1 mb-4">
          Other Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm">
          <DetailRow label="Frequency" value={event.frequency} />
          <DetailRow label="Organizer" value={event.organizer} />
          <DetailRow label="Edition" value={event.edition} />
          <DetailRow label="Website" value={event.websiteUrl} />
          <DetailRow label="Expected Visitors" value={event.expectedVisitors} />
          <DetailRow label="Email" value={event.email} />
          <DetailRow label="Exhibitors" value={event.exhibitors} />
          <DetailRow label="Phone" value={event.phone} />
        </div>
      </section>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex gap-2">
      <span className="text-red-500">›</span>
      <span className="text-gray-500 w-36">{label}</span>
      <span className="text-gray-800">: {value}</span>
    </div>
  )
}
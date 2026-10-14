// SupplierAds.tsx
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { getApiUrl } from "@/lib/apiUrl"

type Banner = {
  id: number
  title: string
  imageUrl: string
  targetUrl?: string
  placement: string
}

export default function SupplierAds() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    let cancelled = false

    const fetchSidebarAds = async () => {
      try {
        const res = await fetch(
          `${getApiUrl()}/api/banners?placement=SIDEBAR`,
          { cache: "no-store" }
        )
        const data = await res.json()
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : []
        if (!cancelled) setBanners(list)
      } catch (err) {
        console.error("SupplierAds fetch error:", err)
        if (!cancelled) setBanners([])
      }
    }

    fetchSidebarAds()
    return () => {
      cancelled = true
    }
  }, [])

  // Preload images so transitions are instant
  useEffect(() => {
    if (!banners.length) return
    banners.forEach((b) => {
      if (b.imageUrl && typeof window !== "undefined") {
        const img = new window.Image()
        img.src = b.imageUrl
      }
    })
  }, [banners])

  // Auto-rotate every 10s if multiple banners exist
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [banners.length, isPaused])

  if (!banners.length) return null

  // Show up to 3 ads (or 1 if only 1), rotating the active window every 10s
  const visibleCount = Math.min(banners.length, 3)
  const visibleAds = Array.from({ length: visibleCount }, (_, i) =>
    banners[(currentIndex + i) % banners.length]
  )

  return (
    <div
      className="space-y-6 sticky top-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {visibleAds.map((ad) => (
        <Ad key={ad.id} ad={ad} />
      ))}
    </div>
  )
}

/* ---------- AD COMPONENT ---------- */

function Ad({ ad }: { ad: Banner }) {
  const bannerHref = ad.targetUrl
    ? `${getApiUrl()}/api/banners/${ad.id}/click`
    : "#"

  return (
    <Link
      key={ad.id}
      href={bannerHref}
      target={ad.targetUrl ? "_blank" : undefined}
      rel={ad.targetUrl ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (!ad.targetUrl) e.preventDefault()
      }}
      className="block w-full overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200 animate-banner-fade"
    >
      <div className="relative w-full" style={{ aspectRatio: "200 / 150" }}>
        <Image
          src={ad.imageUrl}
          alt={ad.title || "Advertisement"}
          fill
          sizes="300px"
          className="object-contain"
        />
      </div>
    </Link>
  )
}

/* ---------- RECRUITER CTA AD ---------- */
function RecruiterAd({ src }: { src: string }) {
  return (
    <Link
      href="/signup?role=recruiter"
      className="relative block group overflow-hidden w-full"
    >
      <div className="relative w-full" style={{ aspectRatio: "300 / 250" }}>
        <Image
          src={src}
          alt="Hire Candidates"
          fill
          sizes="300px"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h3 className="text-white text-xl font-bold mb-2">
            Hiring Talent?
          </h3>
          <p className="text-white/90 text-sm mb-4">
            Register your company & post jobs
          </p>

          <span className="inline-block bg-indigo-600 text-white px-4 py-2 text-sm font-semibold group-hover:bg-indigo-700 transition">
            Hire Candidates
          </span>
        </div>
      </div>
    </Link>
  )
}
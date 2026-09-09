"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

type CoverStory = {
  id: number
  title: string
  slug: string
  shortDescription?: string
  badge?: string
  coverImageUrl?: string
}

type Magazine = {
  id: number
  title: string
  slug: string
  coverImageUrl?: string
  createdAt?: string
  coverStory?: CoverStory
}

export default function MagazineWithCoverStory({
  initialMagazine = null,
}: {
  initialMagazine?: Magazine | null
}) {
  const [magazine, setMagazine] = useState<Magazine | null>(initialMagazine)
  const [loading, setLoading] = useState(!initialMagazine)

  useEffect(() => {
    if (initialMagazine) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/magazines`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : []
        if (list.length > 0) {
          setMagazine(list[0])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [initialMagazine])

  if (loading) return <p className="p-10">Loading...</p>
  if (!magazine) return null

  return (
    <section className="bg-[#E9ECEF] p-4">
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[420px_1fr]">

        {/* ================= LEFT – LATEST ISSUE ================= */}
        <div className="p-10 flex flex-col justify-center">
          <h2 className="text-[28px] font-bold text-[#003B5C] mb-8">
            Latest Issue
          </h2>

          <Link href={`/magazines/${magazine.slug}`}>
            <div className="relative w-[220px] h-[300px] mb-6 cursor-pointer shadow-xl">
              <Image
                src={magazine.coverImageUrl || "/placeholder.jpg"}
                alt={magazine.title}
                fill
                className="object-cover"
                sizes="220px"
                priority
              />
            </div>
          </Link>

          {magazine.createdAt && (
            <p className="text-[#003B5C] font-semibold mb-2">
              {new Date(magazine.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          <span className="inline-block bg-[#C70000] text-white text-xs font-bold px-3 py-2 w-fit">
            DIGITAL EDITION
          </span>
        </div>

        {/* ================= RIGHT – COVER STORY HERO ================= */}
        {magazine.coverStory && (
          <div className="relative h-[520px]">
            <Image
              src={magazine.coverStory.coverImageUrl || "/placeholder.jpg"}
              alt={magazine.coverStory.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 70vw"
            />

            <div className="absolute inset-0 bg-black/50" />

            <div className="absolute bottom-0 left-0 p-10 max-w-3xl text-white">
              {magazine.coverStory.badge && (
                <span className="inline-block bg-[#0072BC] text-xs font-bold px-3 py-1 mb-4 uppercase">
                  {magazine.coverStory.badge}
                </span>
              )}

              <h2 className="text-[28px] font-bold leading-snug mb-3">
                {magazine.coverStory.title}
              </h2>

              <p className="text-sm text-gray-200 mb-4">
                {magazine.coverStory.shortDescription}
              </p>

              <Link
                href={`/magazines/${magazine.slug}/cover-story/${magazine.coverStory.slug}`}
                className="text-[#C70000] font-bold uppercase text-sm"
              >
                Read More →
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
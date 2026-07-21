"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Banner from "@/components/Banners/Banner"

type Magazine = {
  id: number
  title: string
  slug: string
  coverImageUrl?: string
  createdAt?: string
}

export default function MagazineArchive() {
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/magazines`)
      .then((res) => res.json())
      .then((data) => {
        const list: Magazine[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : []

        const sorted = [...list].sort((a, b) => {
          const aTime = new Date(a.createdAt || 0).getTime()
          const bTime = new Date(b.createdAt || 0).getTime()
          return bTime - aTime
        })

        setMagazines(sorted)
      })
      .catch((err) => {
        console.error("Error fetching magazines:", err)
        setMagazines([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="p-10">Loading...</p>

  const archiveMagazines = magazines.slice(0, 12)

  return (
    <section className="bg-white py-20">
      <div className="max-w-[1320px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-14">
          <h2 className="text-[44px] leading-none font-bold text-[#003B5C]">
            Archive
          </h2>

          <Link
            href="/magazines"
            className="inline-flex items-center gap-2 border border-[#003B5C] px-6 py-3 text-sm font-semibold text-[#003B5C] hover:bg-[#003B5C] hover:text-white transition w-fit"
          >
            SEE MORE ISSUES <span aria-hidden="true">›</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-14">
            {archiveMagazines.map((mag) => {
              const date = mag.createdAt
                ? new Date(mag.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : ""

              return (
                <article key={mag.id} className="text-center">
                  <Link href={`/magazines/${mag.slug}`}>
                    <div className="relative mx-auto w-[220px] h-[300px] bg-[#d7e8f7] overflow-hidden">
                      <Image
                        src={mag.coverImageUrl || "/placeholder.svg"}
                        alt={mag.title}
                        fill
                        className="object-cover object-center transition-transform duration-300 hover:scale-105"
                        sizes="220px"
                      />
                    </div>
                  </Link>

                  <h3 className="mt-6 text-[24px] font-bold text-[#6B7280]">
                    {date}
                  </h3>

                  <Link
                    href={`/magazines/${mag.slug}`}
                    className="inline-block mt-2 text-[#C70000] font-bold text-xs uppercase tracking-wide"
                  >
                    READ NOW <span aria-hidden="true">›</span>
                  </Link>
                </article>
              )
            })}
          </div>

          <aside className="space-y-6 hidden lg:block">
            <Banner placement="Archive" />
          </aside>
        </div>
      </div>
    </section>
  )
}

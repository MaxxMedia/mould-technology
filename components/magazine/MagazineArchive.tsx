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
      console.log("Magazines API Response:", data);

      if (Array.isArray(data)) {
        setMagazines(data);
      } else {
        setMagazines([]);
      }
    })
    .catch((err) => {
      console.error("Error fetching magazines:", err);
      setMagazines([]);
    })
    .finally(() => {
      setLoading(false);
    });
}, []);

  if (loading) return <p className="p-10">Loading...</p>

  return (
    <section className="bg-[#f2f2f2] py-20">
      <div className="max-w-[1200px] mx-auto px-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-[32px] font-bold text-[#003B5C]">
            Archive
          </h2>

          <Link
            href="/magazines"
            className="border border-[#003B5C] px-5 py-2 text-sm font-semibold text-[#003B5C] hover:bg-[#003B5C] hover:text-white transition"
          >
            SEE MORE ISSUES →
          </Link>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-20">

          {/* LEFT – MAGAZINES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
            {magazines.map((mag) => {
              const date = mag.createdAt
                ? new Date(mag.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : ""

              return (
                <div key={mag.id} className="text-center">

                  <Link href={`/magazines/${mag.slug}`}>
                    {mag.coverImageUrl && (
  <div className="relative mx-auto w-full h-[300px]">
    <Image
      src={mag.coverImageUrl}
      alt={mag.title}
      fill
      className="object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
      sizes="(max-width:768px) 100vw, 300px"
    />
  </div>
)}
                  </Link>

                  <h3 className="mt-6 text-[16px] font-semibold text-gray-700">
                    {date}
                  </h3>

                  <Link
                    href={`/magazines/${mag.slug}`}
                    className="block mt-2 text-[#C70000] font-bold text-xs uppercase tracking-wide"
                  >
                    READ NOW →
                  </Link>

                </div>
              )
            })}
          </div>

          {/* RIGHT – SIDEBAR ADS */}
          <aside className="space-y-6">
            <Banner placement="Archive" />
          </aside>

        </div>
      </div>
    </section>
  )
}
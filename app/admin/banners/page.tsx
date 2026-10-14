"use client"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BANNER_PLACEMENTS, getBannerPlacementInfo } from "@/lib/bannerPlacements"
import { Eye, Image as ImageIcon } from "lucide-react"

type Banner = {
  id: number
  title: string
  imageUrl: string
  placement: string
  status: "ACTIVE" | "INACTIVE"
  position: number
  clicks: number
}

export default function BannerListPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [placement, setPlacement] = useState("ALL")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  /* ================= FETCH ================= */

  const fetchBanners = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/banners/admin/all`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )

    const data = await res.json()
    setBanners(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  /* ================= STATS ================= */

  const totalBanners = banners.length

  const totalClicks = useMemo(
    () => banners.reduce((sum, b) => sum + (b.clicks ?? 0), 0),
    [banners]
  )

  /* ================= FILTER ================= */

  const filteredBanners =
    placement === "ALL"
      ? banners
      : banners.filter(b => b.placement === placement)

  /* ================= DELETE ================= */

  const deleteBanner = async (id: number) => {
    if (!confirm("Delete this banner permanently?")) return

    setDeletingId(id)

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/banners/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )

    setBanners(prev => prev.filter(b => b.id !== id))
    setDeletingId(null)
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6 bg-[#f6f8fc] min-h-screen">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Advertisement Banners
        </h1>

        <div className="flex gap-3">
          <Link
            href="/admin/banners/reorder"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Reorder Banners
          </Link>

          <Link
            href="/admin/banners/new"
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            + New Banner
          </Link>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid sm:grid-cols-2 gap-6">
        <StatCard
          label="Total Banners Posted"
          value={totalBanners}
          icon={<ImageIcon className="w-6 h-6 text-white" />}
          color="from-blue-500 to-blue-600"
        />

        <StatCard
          label="Total Banner Clicks"
          value={totalClicks}
          icon={<Eye className="w-6 h-6 text-white" />}
          color="from-green-500 to-green-600"
        />
      </div>

      {/* ================= FILTER ================= */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">
          Filter by placement:
        </label>

        <select
          value={placement}
          onChange={e => setPlacement(e.target.value)}
          className="border px-3 py-2 rounded bg-white text-sm"
        >
          <option value="ALL">All Placements</option>
          {BANNER_PLACEMENTS.map(p => (
            <option key={p.value} value={p.value}>
              {p.label} ({p.dimensions})
            </option>
          ))}
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Placement</th>
              <th className="p-3 text-left">Dimensions</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Clicks</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBanners.map(b => {
              const info = getBannerPlacementInfo(b.placement)
              return (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{b.position}</td>

                  <td className="p-3">
                    <div className="relative w-24 h-14">
                      <Image
                        src={b.imageUrl}
                        alt={b.title || "Banner"}
                        fill
                        className="object-cover rounded border"
                        sizes="96px"
                      />
                    </div>
                  </td>

                  <td className="p-3 font-medium">{b.title}</td>

                  <td className="p-3 text-gray-700">
                    <span className="font-medium">{info?.label || b.placement}</span>
                    <div className="text-[11px] text-gray-400">{b.placement}</div>
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                      {info?.dimensions ?? "Custom"}
                    </div>
                    {info?.recommended && (
                      <div className="text-[11px] text-gray-500 whitespace-nowrap mt-0.5">
                        <span className="text-gray-400">Rec:</span> {info.recommended}
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        b.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  {/* 👁️ CLICKS */}
                  <td className="p-3 font-semibold text-gray-700">
                    {b.clicks ?? 0}
                  </td>

                  <td className="p-3 text-right space-x-4">
                    <Link
                      href={`/admin/banners/edit/${b.id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => deleteBanner(b.id)}
                      disabled={deletingId === b.id}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingId === b.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              )
            })}

            {filteredBanners.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  No banners found for this placement
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ================= STAT CARD ================= */
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>
      <div
        className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  )
}

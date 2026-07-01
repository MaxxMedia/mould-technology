"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, Eye, Share2 } from "lucide-react"

/* ================= TYPES ================= */

type Directory = {
  id: number
  name: string
  slug: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  isLiveEditable: boolean
  views?: number
  connections?: number
  company?: { name: string }
  submittedBy?: { email: string }
  createdAt: string
}

/* ================= PAGE ================= */

export default function AdminDirectoriesPage() {
  const [directories, setDirectories] = useState<Directory[]>([])
  const [loading, setLoading] = useState(true)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null

  /* ================= FETCH ================= */

 useEffect(() => {
  if (!token) return;

  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/admin`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      console.log("API RESPONSE:", data);

      const rows = Array.isArray(data)
        ? data.map((d: any) => ({
            ...d,
            company: d.Company,
            submittedBy: d.User_SupplierDirectory_submittedByIdToUser,
            approvedBy: d.User_SupplierDirectory_approvedByIdToUser,
          }))
        : [];

      setDirectories(rows);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
}, [token]);

  /* ================= STATS ================= */

  const totalDirectories = directories.length

  const totalViews = directories.reduce(
    (sum, d) => sum + (d.views ?? 0),
    0
  )

  const totalConnections = directories.reduce(
    (sum, d) => sum + (d.connections ?? 0),
    0
  )

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fc]">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-8">
      <div className="max-w-6xl mx-auto space-y-8">

       {/* HEADER */}
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold">
      Supplier Listing
    </h1>
    <p className="text-sm text-gray-500">
      Review and manage supplier listing
    </p>
  </div>

  <div className="flex gap-3">
    {/* OLD BUTTON */}
    {/* <Link
      href="/admin/directories/company-dashboard"
      className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
    >
      + Create Supplier
    </Link> */}

    <Link
      href="/admin/directories/bulk-upload"
      className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
    >
      + Bulk Supplier Creation
    </Link>

    {/* ✅ NEW BUTTON */}
    <Link
      href="/admin/directories/full-setup"
      className="bg-purple-600 text-white px-5 py-2 rounded-lg shadow hover:bg-purple-700 transition"
    >
      + Create Company Supplier Listing
    </Link>
  </div>
</div>



        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            label="Total Suppliers"
            value={totalDirectories}
            icon={<Building2 className="w-6 h-6 text-white" />}
            color="from-blue-500 to-blue-600"
          />

          <StatCard
            label="Total Views"
            value={totalViews}
            icon={<Eye className="w-6 h-6 text-white" />}
            color="from-green-500 to-green-600"
          />

          <StatCard
            label="Total Connections"
            value={totalConnections}
            icon={<Share2 className="w-6 h-6 text-white" />}
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow p-6">
          {directories.length === 0 && (
            <p className="text-gray-500">
              No suppliers found
            </p>
          )}

          {directories.length > 0 && (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="py-3">Name</th>
                  <th>Status</th>
                  <th>Company</th>
                  <th>Submitted By</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {directories.map(dir => (
                  <tr key={dir.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium">
                      {dir.name}
                      <div className="text-xs text-gray-400">
                        /suppliers/{dir.slug}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          dir.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : dir.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {dir.status}
                      </span>
                    </td>

                    <td>{dir.company?.name || "—"}</td>
                    <td>{dir.submittedBy?.email || "—"}</td>

                    <td className="text-xs text-gray-500">
                     {new Date(dir.createdAt).toISOString().split("T")[0]}
                    </td>

                    <td className="text-right">
                      <Link
                        href={`/admin/directories/${dir.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
  value: number | string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div
        className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  )
}

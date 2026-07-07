"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type Directory = {
  id: number
  name: string
  slug: string
  description: string
  website?: string
  logoUrl?: string
  coverImageUrl?: string
  submittedBy: {
    fullName?: string
    email: string
  }
}

export default function ReviewDirectoryPage() {
  const { id } = useParams()
  const router = useRouter()

  const [directory, setDirectory] = useState<Directory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/directories/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) {
        alert("Failed to load directory")
        return
      }

      const data = await res.json()
      setDirectory(data)
      setLoading(false)
    }

    load()
  }, [id])

  async function approve() {
    const token = localStorage.getItem("token")

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/directories/${id}/approve`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    alert("Directory approved")
    router.push("/admin/directories")
  }

  async function reject() {
    const token = localStorage.getItem("token")

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/directories/${id}/reject`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    alert("Directory rejected")
    router.push("/admin/directories")
  }

  if (loading) return <div className="p-10">Loading...</div>
  if (!directory) return <div className="p-10">Not found</div>

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-4">
        Review Supplier Directory
      </h1>

      <div className="bg-white rounded shadow p-6 space-y-4">
        <div>
          <strong>Company:</strong> {directory.name}
        </div>

        <div>
          <strong>Slug:</strong> {directory.slug}
        </div>

        <div>
          <strong>Submitted by:</strong>{" "}
          {directory.submittedBy?.fullName || directory.submittedBy?.email || "—"}
        </div>

        <div>
          <strong>Description:</strong>
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
            {directory.description}
          </p>
        </div>

        {directory.website && (
          <div>
            <strong>Website:</strong>{" "}
            <a
              href={directory.website}
              target="_blank"
              className="text-blue-600 underline"
            >
              {directory.website}
            </a>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={approve}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Approve
        </button>

        <button
          onClick={reject}
          className="bg-red-600 text-white px-6 py-2 rounded"
        >
          Reject
        </button>

        <button
          onClick={() => router.back()}
          className="border px-6 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

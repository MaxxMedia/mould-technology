"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Clock, Bookmark, ArrowLeft } from "lucide-react"
import { useCandidateGuard } from "@/lib/useCandidateGuard"

type SavedJob = {
  id: number
  createdAt: string
  Job: {
    id: number
    title: string
    slug: string
    location: string
    employmentType: string
    Company?: {
      name: string
      slug: string
    }
    companyName?: string
  }
}

export default function SavedJobsPage() {
  useCandidateGuard()

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSavedJobs() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/saved/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        if (Array.isArray(data)) setSavedJobs(data)
      } catch (err) {
        console.error("Failed to load saved jobs", err)
      } finally {
        setLoading(false)
      }
    }

    loadSavedJobs()
  }, [])

  async function handleUnsave(jobId: number) {
    try {
      const token = localStorage.getItem("token")
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}/save`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setSavedJobs((prev) => prev.filter((s) => s.Job.id !== jobId))
    } catch (err) {
      console.error("Failed to unsave job", err)
    }
  }

  if (loading) {
    return <div className="p-10">Loading saved jobs...</div>
  }

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link
          href="/candidate/feed"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4"
        >
          <ArrowLeft size={14} />
          Back to feed
        </Link>

        <h1 className="text-2xl font-bold mb-6">Saved Jobs</h1>

        {savedJobs.length === 0 && (
          <div className="bg-white p-6 rounded shadow-sm text-gray-500">
            You haven&apos;t saved any jobs yet. Browse the{" "}
            <Link href="/candidate/feed" className="text-blue-600 hover:underline">
              job feed
            </Link>{" "}
            and bookmark jobs you&apos;re interested in.
          </div>
        )}

        <div className="space-y-4">
          {savedJobs.map((saved) => (
            <div
              key={saved.id}
              className="bg-white rounded-lg shadow-sm p-5"
            >
              <Link
                href={`/company/${saved.Job.Company?.slug ?? ""}`}
                className="font-semibold text-sm text-blue-600 hover:underline"
              >
                {saved.Job.Company?.name || saved.Job.companyName || "Company"}
              </Link>

              <Link
                href={`/jobs/${saved.Job.slug}`}
                className="block text-lg font-medium mt-1 hover:underline"
              >
                {saved.Job.title}
              </Link>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {saved.Job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Saved on {new Date(saved.createdAt).toLocaleDateString()}
                </span>
                <span>{saved.Job.employmentType}</span>
              </div>

              <button
                onClick={() => handleUnsave(saved.Job.id)}
                className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <Bookmark size={14} className="fill-blue-600" />
                Remove from saved
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

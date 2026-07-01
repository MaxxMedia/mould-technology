"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, MapPin, Briefcase } from "lucide-react"
import { useCandidateGuard } from "@/lib/useCandidateGuard"

type Job = {
  id: number
  title: string
  slug: string
  location: string
  employmentType: string
  Company?: { name: string; slug: string }
  companyName?: string
}

export default function AlertMatchesPage() {
  useCandidateGuard()

  const { id } = useParams<{ id: string }>()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMatches() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/job-alerts/${id}/matches`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        if (Array.isArray(data)) setJobs(data)
      } catch (err) {
        console.error("Failed to load matches", err)
      } finally {
        setLoading(false)
      }
    }

    if (id) loadMatches()
  }, [id])

  if (loading) {
    return <div className="p-10">Loading matching jobs...</div>
  }

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link
          href="/candidate/job-alerts"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4"
        >
          <ArrowLeft size={14} />
          Back to job alerts
        </Link>

        <h1 className="text-2xl font-bold mb-6">Matching Jobs</h1>

        {jobs.length === 0 && (
          <div className="bg-white p-6 rounded shadow-sm text-gray-500">
            No jobs match this alert right now. Check back later.
          </div>
        )}

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm p-5">
              <Link
                href={`/company/${job.Company?.slug ?? ""}`}
                className="font-semibold text-sm text-blue-600 hover:underline"
              >
                {job.Company?.name || job.companyName || "Company"}
              </Link>

              <Link
                href={`/jobs/${job.slug}`}
                className="block text-lg font-medium mt-1 hover:underline"
              >
                {job.title}
              </Link>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={12} />
                  {job.employmentType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

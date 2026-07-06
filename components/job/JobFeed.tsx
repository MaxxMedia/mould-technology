"use client"

import { useEffect, useState } from "react"
import { MapPin, Briefcase, Clock, Users, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

type Job = {
  id: number
  title: string
  slug: string
  description: string
  location: string
  createdAt: string
  employmentType?: string
   views: number
  Company?: {
    name: string
    slug: string
  }
}

export default function JobFeed({ isPublic = false }: { isPublic?: boolean }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadJobs() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs`,
        { cache: "no-store" }
      )
      const data = await res.json()
      setJobs(Array.isArray(data) ? data : data.jobs || [])
      setLoading(false)
    }

    loadJobs()
  }, [])

  // ✅ ADD THIS HERE
  function stripHtml(html: string) {
    const temp = document.createElement("div")
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ""
  }

function getPostedText(createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();

  const diffMs = now.getTime() - created.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return "Posted just now";
  }

  if (diffHours < 24) {
    return `Posted ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }

  if (diffDays === 1) {
    return "Posted yesterday";
  }

  return `Posted ${diffDays} days ago`;
}

  /** 🔐 Apply is protected */
  function handleApply(slug: string) {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (!user?.id) {
      router.push("/signup?role=candidate")
      return
    }

    router.push(`/jobs/${slug}#apply`)
  }

  if (loading) {
    return <div className="p-10">Loading jobs...</div>
  }

  return (
    <main className="space-y-4">
      {jobs.map(job => (
        <div key={job.id} className="bg-white rounded-md shadow-sm p-5">

          {/* COMPANY */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Briefcase size={18} className="text-blue-600" />
            </div>
            <div>
             <p
  onClick={() => {
    if (job.Company?.slug) {
      router.push(`/company/${job.Company.slug}`)
    }
  }}
  className="font-semibold text-sm cursor-pointer text-blue-600 hover:underline"
>
  {job.Company?.name || "Company"}
</p>
              <p className="text-xs text-gray-500">
                {job.employmentType || "Full-time"}
              </p>
            </div>
          </div>

          {/* TITLE */}
          <h2 className="font-semibold mb-1">
            {job.title}
          </h2>

          {/* META */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
  <Clock size={12} />
  {getPostedText(job.createdAt)}
</span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              Actively hiring
            </span>
            <span className="flex items-center gap-1">
    <Eye className="w-4 h-4" />
    {job.views ?? 0} Views
  </span>
          </div>

          {/* DESCRIPTION */}
    <p className="text-sm text-gray-700 line-clamp-3 mb-4">
  {stripHtml(job.description || "")}
</p>

          {/* ACTIONS */}
          <div className="flex gap-4 text-sm">
            {/* ✅ PUBLIC */}
            <button
              onClick={() => router.push(`/jobs/${job.slug}`)}
              className="text-blue-600 font-medium hover:underline"
            >
              View job
            </button>

            {/* 🔐 PROTECTED */}
            {/* <button
              onClick={() => handleApply(job.slug)}
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              Apply
            </button> */}
          </div>
        </div>
      ))}
    </main>
  )
}

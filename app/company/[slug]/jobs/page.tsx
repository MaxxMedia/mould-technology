"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MapPin, Briefcase, CheckCircle } from "lucide-react"
import CompanyTabs from "@/components/company/CompanyTabs"
import CompanyHeader from "@/components/company/CompanyHeader"

type Job = {
  id: number
  title: string
  slug: string
  location: string
  employmentType: string
  isRemote?: boolean
  createdAt: string
}

type Company = {
  id: number
  name: string
  slug: string
  tagline?: string
  logoUrl?: string
  isVerified: boolean // Changed from optional to required
  followers: number // Added followers field
  jobs: Job[]
}

export default function CompanyJobsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${slug}`
        )
        if (res.ok) {
          const data = await res.json()
          setCompany(data)

          // Check if user is following this company
          const token = localStorage.getItem("token")
          if (token && data.id) {
            const followStatusRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${data.id}/follow-status`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (followStatusRes.ok) {
              const statusData = await followStatusRes.json();
              setFollowing(statusData.isFollowing);
            }
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) load()
  }, [slug])

  async function toggleFollow() {
    if (!company) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login required");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${company.id}/follow`,
        {
          method: following ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setFollowing(!following);
        setCompany((prev) =>
          prev
            ? {
                ...prev,
                followers: following ? prev.followers - 1 : prev.followers + 1,
              }
            : prev
        );
      } else if (response.status === 409) {
        setFollowing(true);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Action failed");
      }
    } catch (error) {
      console.error("Follow toggle error:", error);
      alert("An error occurred");
    }
  }

  if (loading) return <div className="p-10">Loading…</div>
  if (!company) return <div className="p-10 text-center">Company not found</div>

  const jobs = company.jobs ?? []

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-[1128px] mx-auto px-4 py-6 space-y-6">
        <CompanyHeader 
          company={company}
          isFollowing={following}
          onFollow={toggleFollow}
        />

        <CompanyTabs slug={company.slug} active="jobs" />

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Open Jobs ({jobs.length})</h2>

          {jobs.length === 0 ? (
            <p className="text-sm text-gray-500">No active jobs at the moment.</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <MapPin size={14} />
                    {job.location} · {job.employmentType}
                    {job.isRemote && " · Remote"}
                  </p>
                  <span className="text-sm text-blue-600 mt-2 inline-flex items-center gap-1">
                    <Briefcase size={14} />
                    View job
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
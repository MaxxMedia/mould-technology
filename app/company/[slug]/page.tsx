"use client"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Briefcase, CheckCircle } from "lucide-react"
import CompanyTabs from "@/components/company/CompanyTabs"

type Job = {
  id: number
  title: string
  slug: string
  location: string
  employmentType: string
}

type Company = {
  id: number
  name: string
  slug: string
  tagline?: string
  description?: string
  industry?: string
  location?: string
  companySize?: string
  website?: string
  logoUrl?: string
  coverImageUrl?: string
  followers: number
  isVerified: boolean
  jobs: Job[]
}

export default function CompanyProfilePage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = React.use(props.params)

  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    const fetchCompanyAndFollowStatus = async () => {
      try {
        // Fetch company details
        const companyRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${slug}`
        )
        const companyData = await companyRes.json()
        setCompany(companyData)

        // Check if user is following this company
        const token = localStorage.getItem("token")
        if (token && companyData.id) {
          const followStatusRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${companyData.id}/follow-status`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          
          if (followStatusRes.ok) {
            const statusData = await followStatusRes.json()
            setFollowing(statusData.isFollowing)
          }
        }
      } catch (error) {
        console.error("Error fetching company data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyAndFollowStatus()
  }, [slug])

  async function toggleFollow() {
    if (!company) return

    const token = localStorage.getItem("token")
    if (!token) {
      alert("Login required")
      return
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
      )

      if (response.ok) {
        // Toggle the following state
        setFollowing(!following)
        setCompany((prev) =>
          prev
            ? {
                ...prev,
                followers: following
                  ? prev.followers - 1
                  : prev.followers + 1,
              }
            : prev
        )
      } else if (response.status === 409) {
        // Already following - just update the state
        setFollowing(true)
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Action failed")
      }
    } catch (error) {
      console.error("Follow toggle error:", error)
      alert("An error occurred")
    }
  }

  if (loading) return <div className="p-10">Loading…</div>
  if (!company) return <div className="p-10 text-center">Company not found</div>

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-[1128px] mx-auto px-4 py-6 space-y-6">

        {/* ================= HEADER ================= */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-900" />

          <div className="p-6 flex gap-6">
           <div className="relative w-28 h-28 -mt-16">
 <Image
  src={
    company.logoUrl ||
    "https://ui-avatars.com/api/?name=Company"
  }
  alt={company?.name ? `${company.name} logo` : "Company logo"}
  fill
  className="rounded-lg bg-white border object-contain"
  sizes="112px"
/>
</div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {company.name}
                {company.isVerified && (
                  <CheckCircle size={18} className="text-blue-600" />
                )}
              </h1>

              {company.tagline && (
                <p className="text-gray-700 mt-1">{company.tagline}</p>
              )}

              <div className="text-sm text-gray-500 mt-2 space-y-1">
                {company.industry && <p>{company.industry}</p>}
                {company.location && (
                  <p className="flex items-center gap-1">
                    <MapPin size={14} />
                    {company.location}
                  </p>
                )}
                {company.companySize && <p>{company.companySize}</p>}
                <p>{company.followers} followers</p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={toggleFollow}
                  className={`px-5 py-1.5 rounded-full text-sm font-medium ${
                    following
                      ? "border text-gray-700"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {following ? "Following" : "Follow"}
                </button>

                {company.website && (
                  <Link
                    href={company.website}
                    target="_blank"
                    className="border px-5 py-1.5 rounded-full text-sm"
                  >
                    Visit website
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <CompanyTabs slug={company.slug} active="home" />

        {/* ================= JOBS ================= */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Jobs</h2>

          {(company.jobs ?? []).length === 0 ? (
            <p className="text-sm text-gray-500">
              No active jobs at the moment.
            </p>
          ) : (
            <div className="space-y-4">
              {(company.jobs ?? []).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="block border rounded-lg p-4 hover:bg-gray-50"
                >
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {job.location} · {job.employmentType}
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
"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MapPin, Briefcase, CheckCircle } from "lucide-react"
import CompanyTabs from "@/components/company/CompanyTabs"

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
  isVerified: boolean
  jobs: Job[]
}

export default function CompanyJobsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${slug}`
        )
        if (res.ok) setCompany(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) load()
  }, [slug])

  if (loading) return <div className="p-10">Loading…</div>
  if (!company) return <div className="p-10 text-center">Company not found</div>

  const jobs = company.jobs ?? []

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-[1128px] mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={company.logoUrl || "https://ui-avatars.com/api/?name=Company"}
              alt={company.name}
              fill
              className="rounded-lg bg-white border object-contain"
              sizes="64px"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {company.name}
              {company.isVerified && (
                <CheckCircle size={16} className="text-blue-600" />
              )}
            </h1>
            {company.tagline && (
              <p className="text-sm text-gray-500">{company.tagline}</p>
            )}
          </div>
        </div>

        <CompanyTabs slug={company.slug} active="jobs" />

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="font-semibold mb-4">
            Open Jobs ({jobs.length})
          </h2>

          {jobs.length === 0 ? (
            <p className="text-sm text-gray-500">
              No active jobs at the moment.
            </p>
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

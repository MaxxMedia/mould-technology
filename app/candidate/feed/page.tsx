"use client"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useCandidateGuard } from "@/lib/useCandidateGuard"
import JobFeed from "@/components/job/JobFeed"

type CandidateProfile = {
  fullName?: string
  headline?: string
  username?: string
  avatarUrl?: string
}

export default function CandidateFeedPage() {
  useCandidateGuard()

  const [profile, setProfile] = useState<CandidateProfile | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch (err) {
        console.error("Failed to load profile", err)
      }
    }

    loadProfile()
  }, [])

  const displayName =
    profile?.fullName || profile?.username || "Candidate"
  const displayHeadline =
    profile?.headline || "Aspiring Professional"
  const avatarSrc =
    profile?.avatarUrl || "https://i.pravatar.cc/100"

  return (
    <div className="bg-[#f3f2ef] min-h-screen lg:h-screen lg:overflow-hidden scrollbar-hide">
      <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-12 gap-6 lg:h-full">

        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="col-span-12 lg:col-span-3 space-y-4 lg:sticky lg:top-6 self-start">

          <div className="bg-white rounded-md overflow-hidden shadow-sm">
            <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="flex flex-col items-center -mt-8 pb-4">
              <div className="relative w-16 h-16">
  <Image
    src={avatarSrc}
    alt={displayName}
    fill
    className="rounded-full border-2 border-white object-cover"
    sizes="64px"
  />
</div>
              <h3 className="font-semibold mt-2">{displayName}</h3>
              <p className="text-xs text-gray-500">
                {displayHeadline}
              </p>
            </div>

            <div className="border-t px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Profile viewers
                </span>
                <span className="text-blue-600 font-medium">
                  24
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm p-4 text-sm space-y-2">
            <p className="font-medium">Quick links</p>
            <Link
              href="/candidate/saved-jobs"
              className="text-gray-600 hover:underline block"
            >
              Saved jobs
            </Link>
            <Link
              href="/candidate/applications"
              className="text-gray-600 hover:underline block"
            >
              My applications
            </Link>
            <Link
              href="/candidate/job-alerts"
              className="text-gray-600 hover:underline block"
            >
              Job alerts
            </Link>
          </div>
        </aside>

        {/* ================= FEED ================= */}
        <main className="col-span-12 lg:col-span-6 space-y-4 lg:overflow-y-auto scrollbar-hide lg:h-full pr-2">

          {/* SEARCH BAR (unchanged UI) */}
          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="flex items-center gap-3">
             <div className="relative w-10 h-10">
  <Image
    src={avatarSrc}
    alt={displayName}
    fill
    className="rounded-full object-cover"
    sizes="40px"
  />
</div>
              <input
                disabled
                placeholder="Search jobs, companies, locations"
                className="flex-1 border rounded-full px-4 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>

          {/* 🔥 REUSED COMPONENT */}
          <JobFeed />

        </main>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="col-span-12 lg:col-span-3 space-y-4 lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-md shadow-sm p-4">
            <h4 className="font-semibold mb-3">
              Job Market News
            </h4>

            <ul className="space-y-3 text-sm">
              <li>
                <p className="font-medium">
                  Hiring increases in tech
                </p>
                <p className="text-xs text-gray-500">
                  2h ago · 4,200 readers
                </p>
              </li>
              <li>
                <p className="font-medium">
                  Remote jobs still trending
                </p>
                <p className="text-xs text-gray-500">
                  4h ago · 2,100 readers
                </p>
              </li>
              <li>
                <p className="font-medium">
                  Interview tips for 2026
                </p>
                <p className="text-xs text-gray-500">
                  1d ago · 6,800 readers
                </p>
              </li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  )
}

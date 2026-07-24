"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getMyProfile } from "@/lib/api/candidate/profile"
import { getExperiences } from "@/lib/api/candidate/experience"
import { getEducation } from "@/lib/api/candidate/education"

export function ApplySection({ jobId }: { jobId: number }) {
  const router = useRouter()
  const [coverNote, setCoverNote] = useState("")
  const [resume, setResume] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [alreadyApplied, setAlreadyApplied] = useState(false)

  const [profileLoading, setProfileLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [experiences, setExperiences] = useState<any[]>([])
  const [education, setEducation] = useState<any[]>([])

  // ✅ Load candidate profile for auto-fill, LinkedIn-style, when the form opens
  useEffect(() => {
    async function loadProfileForApply() {
      try {
        const [profileData, expData, eduData] = await Promise.all([
          getMyProfile().catch(() => null),
          getExperiences().catch(() => []),
          getEducation().catch(() => []),
        ])
        setProfile(profileData)
        setExperiences(Array.isArray(expData) ? expData : [])
        setEducation(Array.isArray(eduData) ? eduData : [])
      } finally {
        setProfileLoading(false)
      }
    }
    loadProfileForApply()
  }, [])

  async function apply() {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    // 🔐 AUTH CHECK — kept consistent with JobDetailPage's handleApply,
    // which already routes unauthenticated users to /login, not /signup.
    if (!user?.id) {
      router.push("/login")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const token = localStorage.getItem("token")

      const formData = new FormData()
      formData.append("jobId", jobId.toString())
      formData.append("coverNote", coverNote)
      if (resume) {
        formData.append("resume", resume)
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      const data = await res.json()

      if (!res.ok) {
        // ✅ Surface "already applied" clearly instead of a generic error
        if (res.status === 400 && data.error?.toLowerCase().includes("already applied")) {
          setAlreadyApplied(true)
          setMessage("You've already applied for this job.")
        } else {
          setMessage(data.error || "Failed to apply")
        }
      } else {
        setMessage("✅ Successfully applied!")
        setAlreadyApplied(true)
      }
    } catch (err) {
      console.error("Apply request failed:", err)
      setMessage("Something went wrong. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const fullName = profile?.fullName || ""
  const email = profile?.email || ""
  const headline = profile?.headline || ""
  const latestExperience = experiences[0]
  const latestEducation = education[0]

  const missingFields: string[] = []
  if (!fullName) missingFields.push("Full name")
  if (!headline) missingFields.push("Headline")
  if (experiences.length === 0) missingFields.push("Work experience")
  if (education.length === 0) missingFields.push("Education")

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">
        Apply for this job
      </h3>

      {/* ✅ LinkedIn-style profile summary auto-filled from candidate profile */}
      {!profileLoading && profile && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Applying as
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {fullName || "Name not set"}
          </p>
          {email && <p className="text-xs text-gray-500">{email}</p>}
          {headline && <p className="text-xs text-gray-600 mt-1">{headline}</p>}
          {latestExperience && (
            <p className="text-xs text-gray-500 mt-1">
              {latestExperience.designation} at {latestExperience.companyName}
            </p>
          )}
          {latestEducation && (
            <p className="text-xs text-gray-500">
              {latestEducation.degree}, {latestEducation.institution}
            </p>
          )}

          {missingFields.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-amber-700 mb-1">
                Your profile is missing: {missingFields.join(", ")}
              </p>
              <Link
                href={`/candidate/${profile.username}?tab=edit`}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Complete your profile →
              </Link>
            </div>
          )}
        </div>
      )}

      {alreadyApplied ? (
        <p className="text-sm text-center text-gray-600 py-4">
          {message || "You've already applied for this job."}
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resume (PDF or image)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setResume(e.target.files[0])
                }
              }}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <textarea
            placeholder="Cover note (optional)"
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            rows={4}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={apply}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Applying..." : "Apply Now"}
          </button>

          {message && !alreadyApplied && (
            <p className="text-sm mt-3 text-center text-red-600">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Mail, Clock, FileText, Check, X } from "lucide-react"

type Application = {
  id: number
  resumeUrl: string | null
  coverNote: string | null
  status: string
  createdAt: string

  User: {
    id: number
    fullName: string | null
    email: string
    headline: string | null
  }

  Job: {
    title: string
    location: string
    employmentType: string

    Company: {
      name: string
    } | null
  } | null
}

export default function JobApplicantsPage() {
  const params = useParams()
  const jobId = params.jobId as string

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadApplicants() {
      try {
        const token = localStorage.getItem("token")

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/applications/job/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await res.json()
        if (Array.isArray(data)) {
          setApplications(data)
        }
      } catch (err) {
        console.error("Failed to load applicants", err)
      } finally {
        setLoading(false)
      }
    }

    loadApplicants()
  }, [jobId])

  async function updateStatus(applicationId: number, status: "shortlisted" | "rejected") {
    const token = localStorage.getItem("token")

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/applications/${applicationId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    )

    // ✅ Update UI instantly
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status } : app
      )
    )
  }

  if (loading) {
    return <div className="p-10">Loading applicants...</div>
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          Job Applicants
        </h1>

        {applications.length === 0 && (
          <div className="bg-white p-6 rounded shadow-sm text-gray-500">
            No applications yet.
          </div>
        )}

        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow p-5"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-blue-600">
  {app.User?.fullName || "Candidate"}
</h2>

                  <p className="text-gray-600 mt-1">
                    {app.User?.headline || "—"}
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full capitalize
                    ${
                      app.status === "shortlisted"
                        ? "bg-green-100 text-green-700"
                        : app.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-600"
                    }`}
                >
                  {app.status}
                </span>
              </div>

              {/* ✅ META - Email and Date only */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <Mail size={12} />
                  {app.User?.email}
                </span>

                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* ✅ JOB DETAILS - Moved here with border top */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm border-t pt-4">
                <div>
                  <span className="font-semibold">Job:</span>{" "}
                  {app.Job?.title}
                </div>

    

                <div>
                  <span className="font-semibold">Location:</span>{" "}
                  {app.Job?.location}
                </div>

                <div>
                  <span className="font-semibold">Employment Type:</span>{" "}
                  {app.Job?.employmentType}
                </div>
              </div>

              {/* COVER NOTE */}
              {app.coverNote && (
                <div className="mt-5">
                  <p className="font-semibold mb-2">
                    Cover Note
                  </p>

                  <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700">
                    {app.coverNote}
                  </div>
                </div>
              )}

              {/* RESUME */}
              {app.resumeUrl && (
                <div className="mt-5">
                  <p className="font-semibold mb-2">
                    Resume
                  </p>

                  <a
                    href={`${app.resumeUrl}?dl=1`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FileText size={18} />
                    Download Resume
                  </a>
                </div>
              )}

              {/* ACTIONS */}
              <hr className="my-5" />
              {app.status === "applied" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => updateStatus(app.id, "shortlisted")}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded text-sm"
                  >
                    <Check size={14} />
                    Shortlist
                  </button>

                  <button
                    onClick={() => updateStatus(app.id, "rejected")}
                    className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded text-sm"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
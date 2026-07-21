"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import "react-quill-new/dist/quill.snow.css"
import {
  fetchJobPostingEligibility,
  type JobPostingEligibility,
  type JobPostingEligibilityResponse,
} from "@/lib/jobPosting"
import JobPostingPolicySummary from "@/components/recruiter/JobPostingPolicySummary"
import { Switch } from "@/components/ui/switch"

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
})

function getFeaturedJobEligibility(plan?: string, planLabel?: string) {
  const normalizedPlan = (plan || "").toLowerCase()
  const canFeature =
    normalizedPlan === "professional" || normalizedPlan === "enterprise"

  if (normalizedPlan === "professional") {
    return {
      canFeature,
      plan,
      planLabel,
      durationDays: 10,
      message: "Professional plan includes Featured Job for 10 days.",
    }
  }

  if (normalizedPlan === "enterprise") {
    return {
      canFeature,
      plan,
      planLabel,
      durationDays: 30,
      message: "Enterprise plan includes Featured Job for 30 days.",
    }
  }

  return {
    canFeature,
    plan,
    planLabel,
    durationDays: null,
    message:
      "Featured Job is available only on Professional and Enterprise plans.",
  }
}

export default function CreateJobPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    employmentType: "Full-time",
    experience: "",
    salaryRange: "",
    location: "",
    isRemote: false,
    acceptedPolicy: false,
    featuredJob: false,
  })

  const [loading, setLoading] = useState(false)
  const [checkingEligibility, setCheckingEligibility] = useState(true)
  const [eligibility, setEligibility] =
    useState<JobPostingEligibilityResponse | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function checkEligibility() {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const data = await fetchJobPostingEligibility(token)
        setEligibility(data)
      } catch {
        setError("Failed to verify your job posting allowance")
      } finally {
        setCheckingEligibility(false)
      }
    }

    checkEligibility()
  }, [router])

  const isInternship = form.employmentType === "Internship"

  const activeEligibility: JobPostingEligibility | null = useMemo(() => {
    if (!eligibility) return null
    return isInternship ? eligibility.internship ?? eligibility : eligibility.job ?? eligibility
  }, [eligibility, isInternship])

  const featuredJobEligibility = getFeaturedJobEligibility(
    eligibility?.plan,
    eligibility?.planLabel
  )

  const blockedByLimit =
    !checkingEligibility && activeEligibility != null && !activeEligibility.canPost

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    })

    if (name === "employmentType") {
      setError("")
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value

    setForm(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.acceptedPolicy) {
      setError("Please read and agree to the Job Posting Policy.")
      return
    }

    if (blockedByLimit) {
      setError("Your current package does not allow this job post.")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const { acceptedPolicy: _acceptedPolicy, ...payload } = form
      const featuredJob = featuredJobEligibility.canFeature && form.featuredJob

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          featuredJob,
          featuredJobDurationDays: featuredJob
            ? featuredJobEligibility.durationDays
            : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === "JOB_POSTING_LIMIT_REACHED") {
          setEligibility(prev => (prev ? { ...prev, job: data.eligibility } : prev))
        } else if (data.code === "INTERNSHIP_LISTING_LIMIT_REACHED") {
          setEligibility(prev =>
            prev ? { ...prev, internship: data.eligibility } : prev
          )
        }
        setError(data.error || "Failed to create job")
        return
      }

      router.push("/recruiter/jobs")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8 flex w-full items-center gap-4">
        <h1 className="text-[28px] font-bold tracking-tight">Create Job</h1>

        {featuredJobEligibility.canFeature && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[15px] font-normal text-gray-900">
              {form.featuredJob ? "Enabled" : "Disabled"}
            </span>
            <Switch
              checked={form.featuredJob}
              onCheckedChange={checked =>
                setForm(prev => ({
                  ...prev,
                  featuredJob: checked,
                }))
              }
              className="h-7 w-12"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {checkingEligibility ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-gray-500">Loading...</p>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="title"
            required
            placeholder="Job Title"
            className="w-full border p-3 rounded"
            value={form.title}
            onChange={handleTitleChange}
          />

          <input
            name="slug"
            required
            readOnly
            className="w-full border p-3 rounded bg-gray-100"
            value={form.slug}
          />

          <select
            name="employmentType"
            className="w-full border p-3 rounded"
            value={form.employmentType}
            onChange={handleChange}
          >
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
          </select>

          <input
            name="experience"
            placeholder="Experience (e.g. 2-5 years)"
            className="w-full border p-3 rounded"
            value={form.experience}
            onChange={handleChange}
          />

          <input
            name="salaryRange"
            placeholder="Salary Range (e.g. ₹6L - ₹12L)"
            className="w-full border p-3 rounded"
            value={form.salaryRange}
            onChange={handleChange}
          />

          <input
            name="location"
            required
            placeholder="Location"
            className="w-full border p-3 rounded"
            value={form.location}
            onChange={handleChange}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isRemote"
              checked={form.isRemote}
              onChange={handleChange}
            />
            Remote Job
          </label>

          <div>
            <label className="block font-semibold mb-2">Job Description</label>
            <ReactQuill
              theme="snow"
              value={form.description}
              onChange={value =>
                setForm(prev => ({ ...prev, description: value }))
              }
              className="bg-white"
            />
          </div>

          <div className="space-y-5 pt-2">
            <JobPostingPolicySummary />

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-[16px] text-slate-900">
              <input
                type="checkbox"
                name="acceptedPolicy"
                checked={form.acceptedPolicy}
                onChange={handleChange}
                className="mt-1 h-5 w-5 rounded border border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span>I have read and agree to the Job Posting Policy.</span>
            </label>

            <div className="flex justify-start pt-2">
              <button
                disabled={loading || !form.acceptedPolicy || blockedByLimit}
                className="w-full max-w-55 rounded-xl bg-blue-600 px-8 py-4 text-[16px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading
                  ? "Publishing..."
                  : blockedByLimit
                    ? "Upgrade to Continue"
                    : "Publish Job"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

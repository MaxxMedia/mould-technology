"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
]

const WORKPLACE_TYPES = [
  { value: "ON_SITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "REMOTE", label: "Remote" },
]

const SENIORITY_LEVELS = [
  { value: "ENTRY", label: "Entry level" },
  { value: "ASSOCIATE", label: "Associate" },
  { value: "MID_SENIOR", label: "Mid-Senior level" },
  { value: "DIRECTOR", label: "Director" },
  { value: "EXECUTIVE", label: "Executive" },
]

const START_OPTIONS = [
  { value: "IMMEDIATELY", label: "Immediately" },
  { value: "WITHIN_2_WEEKS", label: "Within 2 weeks" },
  { value: "WITHIN_MONTH", label: "Within a month" },
  { value: "FLEXIBLE", label: "Flexible" },
]

const SALARY_PERIODS = [
  { value: "PER_YEAR", label: "per year" },
  { value: "PER_MONTH", label: "per month" },
]

const DEFAULT_BENEFITS = [
  "Health insurance",
  "Flexible working",
  "Provident Fund",
  "Paid time off",
  "Learning & development",
]

type FormState = {
  title: string
  companyName: string
  location: string
  employmentType: string
  workplaceType: string
  jobFunction: string
  seniorityLevel: string
  experience: string
  salaryMin: string
  salaryMax: string
  salaryPeriod: string
  openings: string
  startDate: string
  applicationDeadline: string
  description: string
  responsibilities: string
  requirements: string
  benefits: string[]
  industry: string
  companySize: string
  reportsTo: string
  referralBonus: string
  applyUrl: string
  linkedinUrl: string
  featured: boolean
}

const initialForm: FormState = {
  title: "",
  companyName: "",
  location: "",
  employmentType: "FULL_TIME",
  workplaceType: "ON_SITE",
  jobFunction: "",
  seniorityLevel: "",
  experience: "",
  salaryMin: "",
  salaryMax: "",
  salaryPeriod: "PER_YEAR",
  openings: "1",
  startDate: "IMMEDIATELY",
  applicationDeadline: "",
  description: "",
  responsibilities: "",
  requirements: "",
  benefits: [],
  industry: "",
  companySize: "",
  reportsTo: "",
  referralBonus: "",
  applyUrl: "",
  linkedinUrl: "",
  featured: false,
}

const REQUIRED_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: "companyName", label: "Company name" },
  { key: "title", label: "Job title" },
  { key: "location", label: "Job location" },
  { key: "employmentType", label: "Employment type" },
  { key: "workplaceType", label: "Workplace type" },
  { key: "jobFunction", label: "Job function" },
  { key: "seniorityLevel", label: "Seniority level" },
  { key: "openings", label: "Job openings" },
  { key: "startDate", label: "When should this job start?" },
  { key: "description", label: "About the job" },
  { key: "responsibilities", label: "Key responsibilities" },
  { key: "requirements", label: "Requirements" },
  { key: "industry", label: "Industry" },
  { key: "companySize", label: "Company size" },
  { key: "reportsTo", label: "Reports to" },
]

export default function CreateJobPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)
  const [customBenefit, setCustomBenefit] = useState("")
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    REQUIRED_FIELDS.forEach(({ key, label }) => {
      const value = form[key]
      if (typeof value === "string" && value.trim() === "") {
        nextErrors[key] = `${label} is required`
      }
    })
    return nextErrors
  }

  const toggleBenefit = (benefit: string) => {
    setForm(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit],
    }))
  }

  const addCustomBenefit = () => {
    const trimmed = customBenefit.trim()
    if (!trimmed || form.benefits.includes(trimmed)) return
    setForm(prev => ({ ...prev, benefits: [...prev.benefits, trimmed] }))
    setCustomBenefit("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstKey = REQUIRED_FIELDS.find(f => nextErrors[f.key])?.key
      if (firstKey) {
        const el = document.querySelector(`[name="${firstKey}"]`)
        el?.scrollIntoView({ behavior: "smooth", block: "center" })
        ;(el as HTMLElement)?.focus?.()
      }
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          slug: form.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, ""),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Failed to save job")
        setLoading(false)
        return
      }

      router.push("/recruiter/jobs")
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
      setLoading(false)
    }
  }

  const responsibilityLines = form.responsibilities
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Job post
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Edit a job post that will appear on your job board.
            </p>
          </div>
          <span className="text-xs text-gray-400">* Required fields</span>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mb-6 border border-red-200 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">
            Please fill in all required fields before saving the job (
            {Object.keys(errors).length} missing).
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* ================= MAIN COLUMN ================= */}
            <div className="space-y-6">

              {/* 1. Company details */}
              <Section number={1} title="Company details">
                <Input
                  label="Company name"
                  required
                  name="companyName"
                  error={errors.companyName}
                  value={form.companyName}
                  onChange={v => update("companyName", v)}
                />
              </Section>

              {/* 2. Job details */}
              <Section number={2} title="Job details">
                <Input
                  label="Job title"
                  required
                  name="title"
                  error={errors.title}
                  value={form.title}
                  onChange={v => update("title", v)}
                />

                <Input
                  label="Job location"
                  required
                  name="location"
                  error={errors.location}
                  value={form.location}
                  onChange={v => update("location", v)}
                />

                <Row cols={3}>
                  <Select
                    label="Employment type"
                    required
                    name="employmentType"
                    error={errors.employmentType}
                    value={form.employmentType}
                    onChange={v => update("employmentType", v)}
                    options={EMPLOYMENT_TYPES}
                  />
                  <Select
                    label="Workplace type"
                    required
                    name="workplaceType"
                    error={errors.workplaceType}
                    value={form.workplaceType}
                    onChange={v => update("workplaceType", v)}
                    options={WORKPLACE_TYPES}
                  />
                  <Input
                    label="Job function"
                    required
                    name="jobFunction"
                    error={errors.jobFunction}
                    value={form.jobFunction}
                    onChange={v => update("jobFunction", v)}
                    placeholder="e.g. Marketing"
                  />
                </Row>

                <Row cols={2}>
                  <Select
                    label="Seniority level"
                    required
                    name="seniorityLevel"
                    error={errors.seniorityLevel}
                    value={form.seniorityLevel}
                    onChange={v => update("seniorityLevel", v)}
                    options={SENIORITY_LEVELS}
                    placeholder="Select level"
                  />
                  <Input
                    label="Experience"
                    value={form.experience}
                    onChange={v => update("experience", v)}
                    placeholder="e.g. 3 – 5 years"
                  />
                </Row>

                <div>
                  <FieldLabel>Salary range (₹)</FieldLabel>
                  <div className="flex items-center gap-2">
                    <input
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Min"
                      value={form.salaryMin}
                      onChange={e => update("salaryMin", e.target.value)}
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Max"
                      value={form.salaryMax}
                      onChange={e => update("salaryMax", e.target.value)}
                    />
                    <select
                      className="border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.salaryPeriod}
                      onChange={e => update("salaryPeriod", e.target.value)}
                    >
                      {SALARY_PERIODS.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    This will be displayed on your job post.
                  </p>
                </div>

                <Row cols={2}>
                  <Input
                    label="Job openings"
                    required
                    name="openings"
                    error={errors.openings}
                    value={form.openings}
                    onChange={v => update("openings", v.replace(/[^\d]/g, ""))}
                  />
                  <Select
                    label="When should this job start?"
                    required
                    name="startDate"
                    error={errors.startDate}
                    value={form.startDate}
                    onChange={v => update("startDate", v)}
                    options={START_OPTIONS}
                  />
                </Row>

                <Input
                  label="Application deadline"
                  type="date"
                  value={form.applicationDeadline}
                  onChange={v => update("applicationDeadline", v)}
                />
              </Section>

              {/* 3. Job description */}
              <Section number={3} title="Job description">
                <Textarea
                  label="About the job"
                  required
                  name="description"
                  error={errors.description}
                  value={form.description}
                  onChange={v => update("description", v)}
                  rows={5}
                  maxLength={5000}
                />

                <Textarea
                  label="Key responsibilities"
                  required
                  name="responsibilities"
                  error={errors.responsibilities}
                  value={form.responsibilities}
                  onChange={v => update("responsibilities", v)}
                  rows={4}
                  maxLength={5000}
                  placeholder={"One per line, e.g.\nManage SEO, SEM, social media, email and content marketing."}
                />

                <Textarea
                  label="Requirements"
                  required
                  name="requirements"
                  error={errors.requirements}
                  value={form.requirements}
                  onChange={v => update("requirements", v)}
                  rows={4}
                  maxLength={5000}
                  placeholder={"One per line, e.g.\n3–5 years of relevant experience."}
                />

                <div>
                  <FieldLabel>Benefits & perks (select all that apply)</FieldLabel>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
                    {Array.from(new Set([...DEFAULT_BENEFITS, ...form.benefits])).map(
                      benefit => (
                        <label
                          key={benefit}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={form.benefits.includes(benefit)}
                            onChange={() => toggleBenefit(benefit)}
                          />
                          {benefit}
                        </label>
                      )
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      className="border border-gray-300 rounded-lg p-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Add custom benefit"
                      value={customBenefit}
                      onChange={e => setCustomBenefit(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addCustomBenefit()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCustomBenefit}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                    >
                      + Add benefit
                    </button>
                  </div>
                </div>
              </Section>

              {/* 4. Additional details */}
              <Section number={4} title="Additional details">
                <Row cols={2}>
                  <Input
                    label="Industry"
                    required
                    name="industry"
                    error={errors.industry}
                    value={form.industry}
                    onChange={v => update("industry", v)}
                  />
                  <Input
                    label="Company size"
                    required
                    name="companySize"
                    error={errors.companySize}
                    value={form.companySize}
                    onChange={v => update("companySize", v)}
                    placeholder="e.g. 1,201 – 5,000 employees"
                  />
                </Row>

                <Row cols={2}>
                  <Input
                    label="Reports to"
                    required
                    name="reportsTo"
                    error={errors.reportsTo}
                    value={form.reportsTo}
                    onChange={v => update("reportsTo", v)}
                  />
                  <Input
                    label="Referral bonus (₹) (optional)"
                    value={form.referralBonus}
                    onChange={v => update("referralBonus", v.replace(/[^\d]/g, ""))}
                    placeholder="Enter amount"
                  />
                </Row>

                <Row cols={2}>
                  <Input
                    label="Apply URL (Company website)"
                    value={form.applyUrl}
                    onChange={v => update("applyUrl", v)}
                  />
                  <Input
                    label="LinkedIn job URL"
                    value={form.linkedinUrl}
                    onChange={v => update("linkedinUrl", v)}
                  />
                </Row>
              </Section>

              {/* Featured job */}
              <Section number={5} title="Visibility">
                <label
                  className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                    form.featured
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={form.featured}
                    onChange={e => update("featured", e.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">
                      Featured job
                    </span>
                    <span className="block text-sm text-gray-500">
                      Pin this job to the top of listings and highlight it on the job board.
                    </span>
                  </span>
                </label>
              </Section>

              <div className="flex justify-end gap-4 pt-2 pb-8">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Job"}
                </button>
              </div>
            </div>

            {/* ================= PREVIEW COLUMN ================= */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                  Job post preview
                </h2>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {form.companyName ? form.companyName[0].toUpperCase() : "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {form.companyName || "Company name"}
                    </p>
                    {form.companySize && (
                      <p className="text-xs text-gray-400">{form.companySize}</p>
                    )}
                  </div>
                </div>

                <p className="text-base font-semibold text-gray-900 mb-1">
                  {form.title || "Job title"}
                </p>

                <div className="flex flex-col gap-1 text-xs text-gray-500 mb-3">
                  {form.location && (
                    <span>
                      {form.location}
                      {form.workplaceType &&
                        ` (${WORKPLACE_TYPES.find(w => w.value === form.workplaceType)?.label})`}
                    </span>
                  )}
                  <span>
                    {EMPLOYMENT_TYPES.find(e => e.value === form.employmentType)?.label}
                    {form.seniorityLevel &&
                      ` · ${SENIORITY_LEVELS.find(s => s.value === form.seniorityLevel)?.label}`}
                  </span>
                  {(form.salaryMin || form.salaryMax) && (
                    <span>
                      ₹{form.salaryMin || "0"} – ₹{form.salaryMax || "0"}{" "}
                      {SALARY_PERIODS.find(p => p.value === form.salaryPeriod)?.label}
                    </span>
                  )}
                </div>

                {form.description && (
                  <>
                    <p className="text-xs font-semibold text-gray-900 mb-1">
                      About the job
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-3 mb-3">
                      {form.description}
                    </p>
                  </>
                )}

                {responsibilityLines.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-900 mb-1">
                      Key responsibilities
                    </p>
                    <ul className="text-xs text-gray-500 list-disc pl-4 space-y-0.5">
                      {responsibilityLines.slice(0, 3).map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </>
                )}

                {form.featured && (
                  <span className="inline-block mt-4 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ================= LAYOUT HELPERS ================= */

function Section({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-sm font-semibold text-gray-900 mb-5">
        {number}. {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

function Row({
  cols,
  children,
}: {
  cols: 2 | 3
  children: React.ReactNode
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 ${
        cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      }`}
    >
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
    </label>
  )
}

/* ================= FIELD COMPONENTS ================= */

function Input({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
  name,
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
  type?: string
  name?: string
  error?: string
}) {
  return (
    <div>
      <FieldLabel>
        {label} {required && <span className="text-red-500">*</span>}
      </FieldLabel>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-gray-300 focus:ring-indigo-500"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function Textarea({
  label,
  value,
  onChange,
  required,
  rows = 4,
  maxLength,
  placeholder,
  name,
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  rows?: number
  maxLength?: number
  placeholder?: string
  name?: string
  error?: string
}) {
  return (
    <div>
      <FieldLabel>
        {label} {required && <span className="text-red-500">*</span>}
      </FieldLabel>
      <textarea
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-y ${
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-gray-300 focus:ring-indigo-500"
        }`}
      />
      <div className="flex justify-between items-center mt-1">
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : (
          <span />
        )}
        {maxLength && (
          <p className="text-right text-xs text-gray-400">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
  name,
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  name?: string
  error?: string
}) {
  return (
    <div>
      <FieldLabel>
        {label} {required && <span className="text-red-500">*</span>}
      </FieldLabel>
      <select
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full border rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent ${
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-gray-300 focus:ring-indigo-500"
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
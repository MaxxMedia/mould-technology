import Link from "next/link"
import {
  CheckCircle2,
  FileText,
  ExternalLink,
} from "lucide-react"

const leftItems = [
  "Company information is accurate and up to date.",
  "You are authorized to recruit for this role.",
  "Job titles and descriptions are truthful.",
]

const rightItems = [
  "Duplicate or misleading job posts are prohibited.",
  "Job listings are reviewed before publication.",
  "Follow Job Posting Policy.",
]

export default function JobPostingPolicySummary() {
  return (
    <div className="rounded-xl border border-blue-200 bg-white p-6">
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute left-0 h-px w-full bg-slate-200" />

        <div className="relative z-10 flex items-center gap-2 bg-white px-5">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-900">
            Before You Submit
          </h3>
        </div>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
        <div className="space-y-5 md:border-r md:border-slate-200 md:pr-8">
          {leftItems.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <p className="text-sm leading-6 text-slate-700">{item}</p>
            </div>
          ))}
        </div>

        <div className="space-y-5 md:pl-8">
          {rightItems.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <p className="text-sm leading-6 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="my-6 border-t border-slate-200" />

      <Link
        href="/job-posting-policy"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
      >
        <FileText className="h-4 w-4" />
        View Full Job Posting Policy
        <ExternalLink className="h-4 w-4" />
      </Link>
    </div>
  )
}

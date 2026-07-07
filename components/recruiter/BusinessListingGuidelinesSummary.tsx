import Link from "next/link"
import {
  CheckCircle2,
  FileText,
  ExternalLink,
} from "lucide-react"

const leftItems = [
  "Company information is accurate and up to date.",
  "You own or have permission to upload all images.",
  "Product descriptions are truthful.",
]

const rightItems = [
  "Duplicate or misleading listings are prohibited.",
  "Listings are reviewed before publication.",
  "Follow Business Listing Guidelines.",
]

export default function BusinessListingGuidelinesSummary() {
  return (
    <div className="rounded-xl border border-blue-200 bg-white p-6">

      {/* Heading */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute left-0 h-px w-full bg-slate-200" />

        <div className="relative z-10 flex items-center gap-2 bg-white px-5">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-900">
            Before You Submit
          </h3>
        </div>
      </div>

      {/* 2 x 3 Layout */}
      <div className="grid grid-cols-2 gap-10 mt-6">
  {/* Left */}
  <div className="space-y-5 border-r border-slate-200 pr-8">
    {leftItems.map((item) => (
      <div key={item} className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <p className="text-sm leading-6 text-slate-700">{item}</p>
      </div>
    ))}
  </div>

  {/* Right */}
  <div className="space-y-5 pl-8">
    {rightItems.map((item) => (
      <div key={item} className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <p className="text-sm leading-6 text-slate-700">{item}</p>
      </div>
    ))}
  </div>
</div>

      {/* Divider */}
      <div className="my-6 border-t border-slate-200" />

      {/* Link */}
      <Link
        href="/business-listing-guidelines"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
      >
        <FileText className="h-4 w-4" />
        View Full Business Listing Guidelines
        <ExternalLink className="h-4 w-4" />
      </Link>

    </div>
  )
}
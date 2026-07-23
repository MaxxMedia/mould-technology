"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Eye,
  Building2,
  ChevronRight,
  Bookmark,
  ArrowLeft,
  CheckCircle2,
  Users,
  Globe,
  Calendar,
  ChevronUp,
  ChevronDown,
  Lightbulb,
  TrendingUp,
  FileText,
  MessageSquare,
  Star,
} from "lucide-react"
import { ApplySection } from "@/components/ApplySection"

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  const [job, setJob] = useState<any>(null)
  const [otherJobs, setOtherJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [savingJob, setSavingJob] = useState(false)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showFullDesc, setShowFullDesc] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    if (!slug) return;

    async function loadJob() {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${slug}/view`,
          {
            method: "POST",
          }
        );

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${slug}`
        );

        const data = await res.json();
        setJob(data);

        const jobsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobs`
        );

        const jobsData = await jobsRes.json();

        const jobs = jobsData.jobs || [];

        setOtherJobs(
          jobs.filter((j: any) => j.slug !== slug).slice(0, 6)
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [slug]);

  useEffect(() => {
    if (!job?.id || user?.role !== "candidate") return;

    async function checkSaveStatus() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.id}/save-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setSaved(data.isSaved);
        }
      } catch (err) {
        console.error(err);
      }
    }

    checkSaveStatus();
  }, [job?.id, user?.role]);

  async function toggleSave() {
    if (!user?.id) {
      router.push("/login");
      return;
    }
    if (user?.role !== "candidate") return;

    setSavingJob(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.id}/save`,
        {
          method: saved ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) setSaved(!saved);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingJob(false);
    }
  }

  const handleApply = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (!user?.id) {
      router.push("/login")
      return
    }

    setShowApplyForm(true)
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Loading job details...
          </p>
        </div>
      </div>
    )

  if (!job)
    return (
      <div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-700">
            Job not found
          </p>
          <p className="text-sm text-gray-400 mt-1">
            This listing may have been removed.
          </p>
        </div>
      </div>
    )

  const postedDate = new Date(job.createdAt)
  const daysAgo = Math.floor(
    (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const company = job.Company || job.company || {}
  const companyName = company.name || job.companyName || "N/A"
  const benefits: string[] = job.benefits || []
  const hiringTeam: any[] = job.hiringTeam || []

  return (
    <div
      className="min-h-screen bg-[#F4F2EE]"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Breadcrumb */}
      <div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Jobs
          </button>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-gray-800 font-medium truncate">
            {job.title}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4 min-w-0">

 
<div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden">

  {/* Banner */}
  <div className="relative h-32 bg-gradient-to-br from-[#0B1E4D] via-[#142B63] to-[#1E3A8A] overflow-visible">
    <div className="absolute -right-6 top-4 w-40 h-40 rounded-full bg-white/5" />
    <div className="absolute right-10 bottom-0 w-24 h-24 rounded-full bg-white/5" />
    <div className="absolute left-24 top-6 flex gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="w-1 h-1 rounded-full bg-white/30" />
      ))}
    </div>
    <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-blue-300/60" />

    {/* Floating Logo + Buttons */}
    <div className="absolute left-8 right-8 -bottom-10 flex items-end justify-between">
      {/* Company Logo */}
      <div className="w-20 h-20 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden flex items-center justify-center">
        {company.logoUrl ? (
          <Image
            src={company.logoUrl}
            alt={companyName}
            width={80}
            height={80}
            className="object-contain w-full h-full p-2"
          />
        ) : (
          <Building2 size={28} className="text-gray-400" />
        )}
      </div>


    </div>
  </div>

  {/* Content */}
  <div className="px-8 pt-14 pb-8">
    <div className="flex items-start justify-between gap-3 flex-wrap">
        <h1 className="text-[30px] font-bold text-gray-900">
      {job.title}
    </h1>
          {/* Buttons */}
 <div className="flex items-center gap-3">
  <button
    onClick={toggleSave}
    className="border border-blue-500 text-blue-600 bg-white px-5 py-2 rounded-full font-medium"
  >
    Save
  </button>

  <button
    onClick={handleApply}
    className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium"
  >
    Easy Apply
  </button>
</div>
    </div>
  

    <div className="flex items-center gap-2 mt-2">
      <span className="text-base font-semibold text-gray-700">
        {companyName}
      </span>
      <CheckCircle2
        size={15}
        className="text-blue-600 fill-blue-100"
      />
    </div>

    <p className="text-sm text-gray-500 mt-2">
      {job.location} • Posted{" "}
      {daysAgo === 0
        ? "today"
        : daysAgo === 1
        ? "yesterday"
        : `${daysAgo} days ago`}
      {job.applicants != null && ` • ${job.applicants} applicants`}
    </p>

    {/* Tags */}
    <div className="flex flex-wrap gap-2 mt-5">
      {job.salaryRange && (
        <Tag
          icon={<IndianRupee size={12} />}
          label={job.salaryRange}
        />
      )}

      {job.employmentType && (
        <Tag
          icon={<Briefcase size={12} />}
          label={job.employmentType}
        />
      )}

      <Tag
        icon={<span className="w-2 h-2 rounded-full bg-green-500" />}
        label="Actively hiring"
        variant="success"
      />
    </div>

    <div className="flex flex-wrap gap-2 mt-2">
      {job.experience && (
        <Tag
          icon={<Clock size={12} />}
          label={job.experience}
          variant="muted"
        />
      )}

      <Tag
        icon={<Eye size={12} />}
        label={`${job.views ?? 0} views`}
        variant="muted"
      />
    </div>
  </div>
</div>

          {/* Description */}
          <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              About the job
            </h2>

            <div
              className={`prose max-w-none prose-sm text-gray-700
                         prose-h1:text-lg prose-h2:text-base
                         prose-h1:font-bold prose-h2:font-semibold
                         prose-ul:list-disc prose-ul:pl-5
                         prose-strong:text-gray-900
                         break-words overflow-hidden
                         ${!showFullDesc ? "max-h-40 overflow-hidden relative" : ""}`}
              dangerouslySetInnerHTML={{ __html: job.description }}
            />

            {!showFullDesc && (
              <div className="h-10 -mt-10 bg-gradient-to-t from-white to-transparent relative" />
            )}

            <button
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 mt-2"
            >
              {showFullDesc ? "Show less" : "Show more"}
              {showFullDesc ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {benefits.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {benefits.map((b, i) => (
                    <Tag key={i} label={b} variant="muted" />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-gray-100">
              {job.isExternal ? (
                <div className="flex flex-wrap gap-3">
                  {job.applyUrl && (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-7 py-2.5 rounded-full"
                    >
                      Apply on Company Website
                    </a>
                  )}
                </div>
              ) : (
                <>
                  {user?.role === "candidate" && (
                    <>
                      <button
                        onClick={handleApply}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-7 py-2.5 rounded-full transition-all duration-150 shadow-[0_2px_8px_rgba(37,99,235,0.35)]"
                      >
                        Apply for this position
                      </button>

                      {showApplyForm && (
                        <div className="mt-6 border-t pt-6">
                          <ApplySection jobId={job.id} />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* About Company (full width, left column) */}
          <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
              About the company
            </h3>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                  {company.logoUrl ? (
                    <Image
                      src={company.logoUrl}
                      alt={companyName}
                      width={48}
                      height={48}
                      className="object-contain w-full h-full p-1.5"
                    />
                  ) : (
                    <Building2 size={18} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-800">{companyName}</p>
                    <CheckCircle2 size={13} className="text-blue-600 fill-blue-100" />
                  </div>
                  {company.industry && (
                    <p className="text-xs text-gray-400">{company.industry}</p>
                  )}
                  {company.employeeCount && (
                    <p className="text-xs text-gray-400">{company.employeeCount} employees</p>
                  )}
                </div>
              </div>

              <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold px-5 py-1.5 rounded-full transition-colors">
                + Follow
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mt-4">
              {company.description ||
                "More information about this company is not available at the moment."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
              {company.website && (
                <CompanyMeta icon={<Globe size={13} />} label="Website" value={company.website} />
              )}
              {company.industry && (
                <CompanyMeta icon={<Briefcase size={13} />} label="Industry" value={company.industry} />
              )}
              {company.employeeCount && (
                <CompanyMeta icon={<Users size={13} />} label="Company size" value={`${company.employeeCount} employees`} />
              )}
              {company.headquarters && (
                <CompanyMeta icon={<MapPin size={13} />} label="Headquarters" value={company.headquarters} />
              )}
              {company.founded && (
                <CompanyMeta icon={<Calendar size={13} />} label="Founded" value={company.founded} />
              )}
            </div>
          </div>

          {/* Meet the hiring team */}
          {hiringTeam.length > 0 && (
            <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Meet the hiring team
              </h3>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-5 flex-wrap">
                  {hiringTeam.map((person, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {person.avatarUrl ? (
                          <Image
                            src={person.avatarUrl}
                            alt={person.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Users size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{person.name}</p>
                        <p className="text-xs text-gray-400">{person.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 border border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-600 text-sm font-semibold px-4 py-2 rounded-full transition-colors">
                  <MessageSquare size={15} />
                  Message
                </button>
              </div>
            </div>
          )}

          {/* Similar Jobs (bottom, full width) */}
          {otherJobs.length > 0 && (
            <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Similar jobs
              </h3>
              <div className="divide-y divide-gray-50">
                {otherJobs.map((item) => (
                  <Link
                    key={item.id}
                    href={`/jobs/${item.slug}`}
                    className="flex items-center justify-between gap-3 py-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                        <Building2 size={14} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.company?.name || item.companyName}
                          {item.salaryRange && ` • ${item.salaryRange}`}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />
                          {item.location}
                        </p>
                      </div>
                    </div>
                    <button className="border border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full flex-shrink-0 transition-colors">
                      Save
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4">

          {/* People also viewed */}
          {otherJobs.length > 0 && (
            <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                People also viewed
              </h3>

              <div className="space-y-1">
                {otherJobs.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/jobs/${item.slug}`}
                    className="flex items-start gap-3 p-3 -mx-3 rounded-md hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Building2 size={12} className="text-gray-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {item.company?.name || item.companyName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.location}
                      </p>
                      {item.applicants != null && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.applicants} applicants
                        </p>
                      )}
                    </div>

                    <Bookmark size={14} className="text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                  </Link>
                ))}
              </div>

              {otherJobs.length > 3 && (
                <button className="flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 mt-2">
                  Show more jobs
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          )}

          {/* Job insights */}
          <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Job insights
            </h3>

            <div className="space-y-4">
              <InsightRow
                icon={<FileText size={15} className="text-gray-400" />}
                title={`${job.applicants ?? job.views ?? 0} applicants`}
                subtitle="Applied recently"
              />
              {job.experience && (
                <InsightRow
                  icon={<TrendingUp size={15} className="text-gray-400" />}
                  title="Experience level"
                  subtitle={job.experience}
                />
              )}
              <InsightRow
                icon={<MapPin size={15} className="text-gray-400" />}
                title="Location"
                subtitle={job.location}
              />
            </div>
          </div>

          {/* Explore more */}
          <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Explore more
            </h3>
            <div className="space-y-4">
              <ExploreRow icon={<Briefcase size={15} />} title="Browse all jobs" subtitle="Find the right opportunity" href="/jobs" />
              <ExploreRow icon={<IndianRupee size={15} />} title="Salary insights" subtitle="Check salary trends" href="/salary" />
              <ExploreRow icon={<Star size={15} />} title="Resume review" subtitle="Get expert feedback" href="/resume" />
              <ExploreRow icon={<Lightbulb size={15} />} title="Interview prep" subtitle="Practice and get tips" href="/interview-prep" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Helpers */

function Tag({ icon, label, variant = "default" }: any) {
  const variants: any = {
    default: "bg-blue-50 text-blue-700",
    muted: "bg-gray-100 text-gray-500",
    success: "bg-green-50 text-green-700",
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${variants[variant]}`}
    >
      {icon}
      {label}
    </span>
  )
}

function CompanyMeta({ icon, label, value }: any) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
        {icon}
        {label}
      </p>
      <p className="text-xs text-gray-800 font-semibold truncate">{value}</p>
    </div>
  )
}

function InsightRow({ icon, title, subtitle }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  )
}

function ExploreRow({ icon, title, subtitle, href }: any) {
  return (
    <Link href={href} className="flex items-start gap-3 group">
      <div className="mt-0.5 text-gray-400 group-hover:text-blue-600 transition-colors">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
          {title}
        </p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </Link>
  )
}
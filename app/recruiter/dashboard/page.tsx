"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Briefcase,
  Users,
  Clock,
  TrendingUp,
  Bell,
  MapPin,
  FileText,
  FolderOpen,
  Crown,
  CreditCard,
} from "lucide-react"
import { useRecruiterGuard } from "@/lib/useRecruiterGuard"
import Image from "next/image"
import CreateArticleButton from "@/components/recruiter/CreateArticleButton"
import PostJobButton from "@/components/recruiter/PostJobButton"
import RecruiterAnalyticsCharts, {
  type RecruiterAnalytics,
} from "@/components/recruiter/RecruiterAnalyticsCharts"
import type { JobPostingEligibility } from "@/lib/jobPosting"
import type { ContentLimitEligibility } from "@/lib/packageLimits"

/* ================= TYPES ================= */

type RecentJob = {
  id: number
  title: string
  applications?: number
}

type Recruiter = {
  username: string
  fullName?: string
  headline?: string
  location?: string
  avatarUrl?: string
  Company?: {
    name: string
    slug: string
    logoUrl?: string
    isVerified: boolean
  }
}

type Directory = {
  id: number
  name: string
  slug: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  isLiveEditable: boolean
}

type Article = {
  id: number
  title: string
  status: string
  createdAt: string
}

type DashboardData = {
  jobsCount: number
  applicationsCount: number
  shortlistedCount: number
  recentJobs: RecentJob[]
  directories?: Directory[]
  articles?: Article[]
  recentActivity?: RecentActivity[]
  subscription?: {
    plan: string
    planLabel: string
    displayPlan?: string
    displayPlanLabel?: string
    basePlanLabel?: string
    expiresAt: string | null
    recruitmentExpiresAt?: string | null
    jobPostingCredits: number
  }
  recentPurchases?: PackagePurchase[]
  jobPosting?: JobPostingEligibility
  articlePosting?: ContentLimitEligibility
  productListings?: ContentLimitEligibility
  analytics?: RecruiterAnalytics
}

type PackagePurchase = {
  id: number
  packageType: string
  packageName: string
  amount: number
  status: string
  createdAt: string
  expiresAt?: string | null
}

type RecentActivity = {
  id: string
  type: string
  message: string
  href?: string
  color: "blue" | "orange" | "green" | "yellow" | "red"
  createdAt: string
}

const ACTIVITY_DOT_COLORS: Record<RecentActivity["color"], string> = {
  blue: "bg-blue-400",
  orange: "bg-orange-400",
  green: "bg-green-400",
  yellow: "bg-yellow-400",
  red: "bg-red-400",
}

function articleLimitLabel(eligibility?: ContentLimitEligibility | null) {
  if (!eligibility) return "Manage content"
  if (eligibility.isUnlimited) return "Unlimited this year"
  if (eligibility.plan === "free" && !eligibility.canCreate) return "Upgrade to publish"
  return `${eligibility.remaining ?? 0} left this year`
}

function productLimitLabel(eligibility?: ContentLimitEligibility | null) {
  if (!eligibility) return "Manage listings"
  if (eligibility.isUnlimited) return "Unlimited listings"
  return `${eligibility.remaining ?? 0} of ${eligibility.effectiveLimit ?? 0} left`
}

function formatArticleQuickDesc(eligibility?: ContentLimitEligibility | null) {
  if (!eligibility) return "Manage content"
  if (eligibility.isUnlimited) return "Unlimited this year"
  if (eligibility.plan === "free" || eligibility.effectiveLimit === 0) {
    return "Upgrade to publish"
  }
  return `${eligibility.remaining ?? 0} left this year`
}

function formatProductQuickDesc(eligibility?: ContentLimitEligibility | null) {
  if (!eligibility) return "Manage directories"
  if (eligibility.isUnlimited) return "Unlimited directories"
  return `${eligibility.remaining ?? 0} directory slots left`
}

function formatLimitValue(
  eligibility: ContentLimitEligibility | null | undefined,
  remainingKey: "remaining" = "remaining"
) {
  if (!eligibility) return "—"
  if (eligibility.isUnlimited) return "∞"
  return eligibility[remainingKey] ?? 0
}

/* ================= PAGE ================= */

export default function RecruiterDashboard() {
  // ⚠️ HOOKS MUST ALWAYS RUN
  const allowed = useRecruiterGuard()

  const [dashboard, setDashboard] = useState<DashboardData>({
    jobsCount: 0,
    applicationsCount: 0,
    shortlistedCount: 0,
    recentJobs: [],
    recentActivity: [],
  })

  const [recruiter, setRecruiter] = useState<Recruiter | null>(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  if (!allowed) return

  async function loadAll() {
    try {
      const token = localStorage.getItem("token")

      /* DASHBOARD */
      const dashboardRes = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/dashboard`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
  }
)

      if (!dashboardRes.ok) {
        const errData = await dashboardRes.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to load dashboard")
      }

      const dashboardData = await dashboardRes.json()
      console.log("DASHBOARD RESPONSE:", dashboardData)
      console.log("ARTICLES:", dashboardData.articles)

      setDashboard({
        jobsCount: dashboardData.jobsCount ?? 0,
        applicationsCount: dashboardData.applicationsCount ?? 0,
        shortlistedCount: dashboardData.shortlistedCount ?? 0,
        recentJobs: dashboardData.recentJobs ?? [],
        directories: dashboardData.directories ?? [],
        articles: dashboardData.articles ?? [],
        recentActivity: dashboardData.recentActivity ?? [],
        subscription: dashboardData.subscription ?? undefined,
        recentPurchases: dashboardData.recentPurchases ?? [],
        jobPosting: dashboardData.jobPosting ?? undefined,
        articlePosting: dashboardData.articlePosting ?? undefined,
        productListings: dashboardData.productListings ?? undefined,
        analytics: dashboardData.analytics ?? undefined,
      })

      /* PROFILE */
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const recruiterData = await profileRes.json()
      setRecruiter(recruiterData)

      // 🔥 ADD THIS BLOCK RIGHT HERE
const stored = localStorage.getItem("user")

if (stored) {
  const existing = JSON.parse(stored)

  localStorage.setItem(
    "user",
    JSON.stringify({
      ...existing,
      avatarUrl: recruiterData.avatarUrl,
    })
  )

  window.dispatchEvent(new Event("userChanged"))
}


    } catch (err) {
      console.error("Dashboard load error:", err)
    } finally {
      setLoading(false)
    }
  }

  loadAll()

  // 🔥 AUTO REFRESH WHEN PAGE FOCUSES
  const handleFocus = () => loadAll()
  window.addEventListener("focus", handleFocus)

  return () => {
    window.removeEventListener("focus", handleFocus)
  }

}, [allowed])


  /* ================= RENDER GUARDS ================= */

  if (!allowed) return null
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-10">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
        {/* ================= MAIN ================= */}
        <main className="col-span-12 xl:col-span-9 space-y-8">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back{recruiter?.fullName ? `, ${recruiter.fullName}` : ""}!
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Here's what's happening with your recruitment today
              </p>
            </div>
            <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>

          {/* KPI CARDS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <KpiCard
              title="Current Plan"
              value={dashboard.subscription?.displayPlanLabel ?? dashboard.subscription?.planLabel ?? "Free"}
              icon={<Crown />}
              color="bg-gradient-to-br from-indigo-500 to-indigo-600"
              subtitle={
                dashboard.subscription?.recruitmentExpiresAt
                  ? `Recruitment expires ${new Date(dashboard.subscription.recruitmentExpiresAt).toLocaleDateString()} · Base: ${dashboard.subscription.basePlanLabel ?? "Free"}`
                  : dashboard.subscription?.expiresAt
                    ? `Expires ${new Date(dashboard.subscription.expiresAt).toLocaleDateString()}`
                    : dashboard.subscription?.plan === "free"
                      ? "Free tier"
                      : "Active"
              }
            />
            <KpiCard
              title="Job Slots Left"
              value={
                dashboard.jobPosting?.isUnlimited
                  ? "∞"
                  : dashboard.jobPosting?.remaining ?? 0
              }
              icon={<CreditCard />}
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              subtitle={
                dashboard.jobPosting?.isUnlimited
                  ? "Unlimited postings"
                  : `${dashboard.jobPosting?.activeJobs ?? 0} of ${dashboard.jobPosting?.effectiveLimit ?? 0} used`
              }
            />
            <KpiCard
              title="Articles Left"
              value={formatLimitValue(dashboard.articlePosting)}
              icon={<FileText />}
              color="bg-gradient-to-br from-indigo-400 to-indigo-500"
              subtitle={
                !dashboard.articlePosting
                  ? "Loading plan limits"
                  : dashboard.articlePosting.isUnlimited
                    ? "Unlimited this year"
                    : dashboard.articlePosting.plan === "free"
                      ? "Not on Free plan"
                      : `${dashboard.articlePosting.articlesThisYear ?? 0} of ${dashboard.articlePosting.effectiveLimit} used this year`
              }
            />
            <KpiCard
              title="Directory Slots Left"
              value={formatLimitValue(dashboard.productListings)}
              icon={<FolderOpen />}
              color="bg-gradient-to-br from-amber-400 to-amber-500"
              subtitle={
                !dashboard.productListings
                  ? "Loading plan limits"
                  : dashboard.productListings.isUnlimited
                    ? "Unlimited directories"
                    : `${dashboard.productListings.activeListings ?? 0} of ${dashboard.productListings.effectiveLimit} directories used`
              }
            />
            <KpiCard
              title="Total Applications"
              value={dashboard.applicationsCount}
              icon={<Users />}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <KpiCard
              title="Active Jobs"
              value={dashboard.jobsCount}
              icon={<Clock />}
              color="bg-gradient-to-br from-orange-400 to-orange-500"
            />
          </div>

          {dashboard.analytics && (
            <RecruiterAnalyticsCharts
              analytics={dashboard.analytics}
              applicationsCount={dashboard.applicationsCount}
              shortlistedCount={dashboard.shortlistedCount}
            />
          )}

          {/* QUICK ACTIONS */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Link
                href="/recruiter/jobs"
                className="group p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200"
              >
                <ActionCard
                  icon={<Briefcase className="text-blue-600 group-hover:scale-110 transition-transform" />}
                  title="Manage Jobs"
                  desc="View all jobs"
                />
              </Link>

              <PostJobButton
                eligibility={dashboard.jobPosting}
                variant="card"
                className="group p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-green-200"
              >
                <ActionCard
                  icon={<TrendingUp className="text-green-600 group-hover:scale-110 transition-transform" />}
                  title="Post a Job"
                  desc={
                    dashboard.jobPosting?.canPost
                      ? "Create new listing"
                      : "Upgrade to post more"
                  }
                />
              </PostJobButton>

              <Link
                href="/recruiter/articles"
                className="group p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-indigo-200"
              >
                <ActionCard
                  icon={<FileText className="text-indigo-600 group-hover:scale-110 transition-transform" />}
                  title="Articles"
                  desc={formatArticleQuickDesc(dashboard.articlePosting)}
                />
              </Link>

              <Link
                href="/recruiter/directories"
                className="group p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-amber-200"
              >
                <ActionCard
                  icon={<FolderOpen className="text-amber-600 group-hover:scale-110 transition-transform" />}
                  title="Directories"
                  desc={formatProductQuickDesc(dashboard.productListings)}
                />
              </Link>
            </div>
          </div>

          {/* RECENT JOBS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-900">Recent Job Posts</h2>
              <Link
                href="/recruiter/jobs"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all →
              </Link>
            </div>

            {dashboard.recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No recent jobs found</p>
                <PostJobButton
                  eligibility={dashboard.jobPosting}
                  label="Post your first job"
                  className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                />
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Job Title</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Applications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboard.recentJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 font-medium text-gray-900">{job.title}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {job.applications ?? 0} applicants
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ================= ARTICLES ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">My Articles</h2>
              <CreateArticleButton
                eligibility={dashboard.articlePosting}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                label="+ Create Article"
              />
            </div>
            {dashboard.articlePosting && (
              <p className="text-sm text-gray-500 mb-5">
                {dashboard.articlePosting.isUnlimited
                  ? "Unlimited technical articles this year"
                  : dashboard.articlePosting.plan === "free"
                    ? "Technical articles require Basic plan or higher"
                    : `${dashboard.articlePosting.remaining ?? 0} of ${dashboard.articlePosting.effectiveLimit ?? 0} articles remaining this year`}
              </p>
            )}

            {!dashboard.articles || dashboard.articles.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">
                  You haven't created any articles yet.
                </p>
                <Link
                  href="/recruiter/articles/create"
                  className="inline-block text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Write your first article
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboard.articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{article.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Created {new Date(article.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {article.status === "APPROVED" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Approved
                            </span>
                          ) : article.status === "PENDING" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {article.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            href={`/recruiter/articles/${article.id}/edit`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ================= DIRECTORIES ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">My Directories</h2>
              <Link
                href="/recruiter/directory/new"
                className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Add Directory
              </Link>
            </div>
            {dashboard.productListings && (
              <p className="text-sm text-gray-500 mb-5">
                {dashboard.productListings.isUnlimited
                  ? "Unlimited supplier directories"
                  : `${dashboard.productListings.remaining ?? 0} of ${dashboard.productListings.effectiveLimit ?? 0} directory slots remaining`}
              </p>
            )}

            {!dashboard.directories || dashboard.directories.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">
                  You haven't added any directories yet.
                </p>
                <Link
                  href="/recruiter/directory/new"
                  className="inline-block text-sm text-amber-600 hover:text-amber-700"
                >
                  Add your first directory
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Directory</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboard.directories.map((dir) => (
                      <tr key={dir.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{dir.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            /suppliers/{dir.slug}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {dir.status === "PENDING" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {dir.status === "APPROVED" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Approved
                            </span>
                          )}
                          {dir.status === "REJECTED" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {dir.isLiveEditable ? (
                            <Link
                              href={`/recruiter/directory/${dir.id}/edit`}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Edit
                            </Link>
                          ) : (
                            <span className="text-gray-400 text-xs">Not editable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* ================= SIDEBAR ================= */}
        <aside className="col-span-12 xl:col-span-3 space-y-6">
          {/* PROFILE CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
           <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto ring-4 ring-gray-100">
              <Image
                src={recruiter?.avatarUrl || "https://i.pravatar.cc/100"}
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

            <h3 className="font-semibold text-lg text-gray-900">
              {recruiter?.fullName || recruiter?.username}
            </h3>

            {recruiter?.headline && (
              <p className="text-sm text-gray-600 mt-1">
                {recruiter.headline}
              </p>
            )}

            {recruiter?.Company?.name && (
  <p className="text-sm font-medium text-blue-600 mt-1">
    {recruiter.Company.name}
  </p>
)}

            {recruiter?.location && (
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-2">
                <MapPin size={12} />
                {recruiter.location}
              </p>
            )}

            {recruiter?.Company?.slug && (
  <Link
    href={`/company/${recruiter.Company.slug}`}
    className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
  >
    View Company Profile →
  </Link>
)}

            <Link
  href="/recruiter/profile/edit"
  className="block mt-3 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
>
  Edit Profile
</Link>

            <Link
              href="/packages"
              className="block mt-3 text-sm border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {dashboard.subscription?.plan === "free" ? "Upgrade Plan" : "Manage Packages"}
            </Link>

          </div>

          {/* PACKAGE PURCHASES */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold mb-1 flex items-center gap-2 text-gray-900">
              <CreditCard size={18} className="text-blue-600" />
              Purchase History
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Active plan: {dashboard.subscription?.displayPlanLabel ?? dashboard.subscription?.planLabel ?? "Free"}
            </p>

            {!dashboard.recentPurchases || dashboard.recentPurchases.length === 0 ? (
              <div className="text-sm text-gray-500">
                <p>No purchases yet.</p>
                <Link href="/packages" className="mt-2 inline-block text-blue-600 hover:underline">
                  Browse packages →
                </Link>
              </div>
            ) : (
              <ul className="space-y-3 text-sm">
                {dashboard.recentPurchases.map((purchase) => (
                  <li
                    key={purchase.id}
                    className="rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <p className="font-medium text-gray-900">{purchase.packageName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      ₹{purchase.amount.toLocaleString("en-IN")} ·{" "}
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ACTIVITY */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <Bell size={18} className="text-blue-600" />
              Recent Activity
            </h3>

            {!dashboard.recentActivity || dashboard.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">
                No recent activity yet. Post a job or check back when candidates apply.
              </p>
            ) : (
              <ul className="text-sm space-y-3">
                {dashboard.recentActivity.map((activity) => (
                  <li key={activity.id}>
                    {activity.href ? (
                      <Link
                        href={activity.href}
                        className="flex items-start gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ACTIVITY_DOT_COLORS[activity.color]}`}
                        />
                        <span className="group-hover:underline">{activity.message}</span>
                      </Link>
                    ) : (
                      <span className="flex items-start gap-2 text-gray-600">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ACTIVITY_DOT_COLORS[activity.color]}`}
                        />
                        {activity.message}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function KpiCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  subtitle?: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-start hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}
      >
        {icon}
      </div>
    </div>
  )
}

function ActionCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
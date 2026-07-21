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
  Megaphone,
  Inbox,
  ArrowUpRight,
  BadgeCheck,
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
import TeamManagementTab from "@/components/recruiter/TeamManagementTab"

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
  homepageFeaturedAd?: ContentLimitEligibility
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

const STATUS_BADGE: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20",
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
  if (eligibility.isUnlimited) return "Unlimited"
  return eligibility[remainingKey] ?? 0
}

/* ================= HELPER FUNCTIONS ================= */

// Helper function to get initials from name
function getInitials(name: string): string {
  if (!name) return "U"

  const parts = name.trim().split(" ")
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  // Get first letter of first and last name
  const firstInitial = parts[0].charAt(0)
  const lastInitial = parts[parts.length - 1].charAt(0)

  return (firstInitial + lastInitial).toUpperCase()
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
          homepageFeaturedAd: dashboardData.homepageFeaturedAd ?? undefined,
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
      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border- border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  const planLabel = dashboard.subscription?.displayPlanLabel ?? dashboard.subscription?.planLabel ?? "Free"
  const isFreePlan = !dashboard.subscription || dashboard.subscription.plan === "free"

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 sm:px-6 py-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
        {/* ================= MAIN ================= */}
        <main className="col-span-12 xl:col-span-9 space-y-6">
          {/* HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Welcome back{recruiter?.fullName ? `, ${recruiter.fullName.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Here's what's happening with your recruitment today
              </p>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-white px-3.5 py-2 rounded-lg border border-gray-100 shadow-sm">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* PLAN HERO CARD */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-700 rounded-2xl p-6 text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-indigo-100 uppercase tracking-wide">Current Plan</p>
                <p className="text-xl font-bold mt-0.5">{planLabel}</p>
                <p className="text-xs text-indigo-100 mt-1">
                  {dashboard.subscription?.recruitmentExpiresAt
                    ? `Recruitment expires ${new Date(dashboard.subscription.recruitmentExpiresAt).toLocaleDateString()} · Base: ${dashboard.subscription.basePlanLabel ?? "Free"}`
                    : dashboard.subscription?.expiresAt
                      ? `Expires ${new Date(dashboard.subscription.expiresAt).toLocaleDateString()}`
                      : isFreePlan
                        ? "Free tier"
                        : "Active"}
                </p>
              </div>
            </div>
            {isFreePlan && (
              <Link
                href="/packages"
                className="inline-flex items-center gap-1.5 bg-white text-indigo-600 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Upgrade Plan <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Job Slots Left"
              value={dashboard.jobPosting?.isUnlimited ? "Unlimited" : dashboard.jobPosting?.remaining ?? 0}
              icon={<CreditCard className="w-4 h-4" />}
              accent="bg-emerald-500"
              subtitle={
                dashboard.jobPosting?.isUnlimited
                  ? "Unlimited postings"
                  : `${dashboard.jobPosting?.activeJobs ?? 0} of ${dashboard.jobPosting?.effectiveLimit ?? 0} used`
              }
            />
            <KpiCard
              title="Articles Left"
              value={formatLimitValue(dashboard.articlePosting)}
              icon={<FileText className="w-4 h-4" />}
              accent="bg-indigo-500"
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
              icon={<FolderOpen className="w-4 h-4" />}
              accent="bg-amber-500"
              subtitle={
                !dashboard.productListings
                  ? "Loading plan limits"
                  : dashboard.productListings.isUnlimited
                    ? "Unlimited directories"
                    : `${dashboard.productListings.activeListings ?? 0} of ${dashboard.productListings.effectiveLimit} used`
              }
            />
            <KpiCard
              title="Homepage Featured Ads"
              value={
                dashboard.homepageFeaturedAd?.reason === "PLAN_NOT_ELIGIBLE"
                  ? "🔒"
                  : dashboard.homepageFeaturedAd?.remaining ?? 0
              }
              icon={<Megaphone className="w-4 h-4" />}
              accent="bg-rose-500"
              subtitle={
                dashboard.homepageFeaturedAd?.reason === "PLAN_NOT_ELIGIBLE"
                  ? "Upgrade to Professional or Enterprise"
                  : `${dashboard.homepageFeaturedAd?.usedThisPeriod ?? 0} of ${dashboard.homepageFeaturedAd?.effectiveLimit ?? 0
                  } used ${dashboard.homepageFeaturedAd?.periodLabel ?? ""}`
              }
            />
            <KpiCard
              title="Total Applications"
              value={dashboard.applicationsCount}
              icon={<Users className="w-4 h-4" />}
              accent="bg-purple-500"
            />
            <KpiCard
              title="Active Jobs"
              value={dashboard.jobsCount}
              icon={<Clock className="w-4 h-4" />}
              accent="bg-orange-500"
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Link
                href="/recruiter/jobs"
                className="group p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200"
              >
                <ActionCard
                  icon={<Briefcase className="text-blue-600 group-hover:scale-110 transition-transform" size={18} />}
                  title="Manage Jobs"
                  desc="View all jobs"
                />
              </Link>

              <PostJobButton
                eligibility={dashboard.jobPosting}
                variant="card"
                className="group p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-green-200"
              >
                <ActionCard
                  icon={<TrendingUp className="text-green-600 group-hover:scale-110 transition-transform" size={18} />}
                  title="Post a Job"
                  desc={dashboard.jobPosting?.canPost ? "Create new listing" : "Upgrade to post more"}
                />
              </PostJobButton>

              <Link
                href="/recruiter/articles"
                className="group p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-indigo-200"
              >
                <ActionCard
                  icon={<FileText className="text-indigo-600 group-hover:scale-110 transition-transform" size={18} />}
                  title="Articles"
                  desc={formatArticleQuickDesc(dashboard.articlePosting)}
                />
              </Link>

              <Link
                href="/recruiter/directories"
                className="group p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-amber-200"
              >
                <ActionCard
                  icon={<FolderOpen className="text-amber-600 group-hover:scale-110 transition-transform" size={18} />}
                  title="Directories"
                  desc={formatProductQuickDesc(dashboard.productListings)}
                />
              </Link>

              <Link
                href="/recruiter/leads"
                className="group p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-purple-200"
              >
                <ActionCard
                  icon={<Inbox className="text-purple-600 group-hover:scale-110 transition-transform" size={18} />}
                  title="Leads"
                  desc="View RFQ requests"
                />
              </Link>
            </div>
          </div>

          {/* RECENT JOBS */}
          <Panel title="Recent Job Posts" actionHref="/recruiter/jobs" actionLabel="View all">
            {dashboard.recentJobs.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="w-10 h-10 text-gray-300" />}
                message="No recent jobs found"
              >
                <PostJobButton
                  eligibility={dashboard.jobPosting}
                  label="Post your first job"
                  className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                />
              </EmptyState>
            ) : (
              <Table
                head={["Job Title", "Applications"]}
                rows={dashboard.recentJobs.map((job) => [
                  <span className="font-medium text-gray-900">{job.title}</span>,
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {job.applications ?? 0} applicants
                  </span>,
                ])}
                alignLast="right"
              />
            )}
          </Panel>

          {/* ================= TEAM MANAGEMENT ================= */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <TeamManagementTab />
          </div>

          {/* ================= ARTICLES ================= */}
          <Panel
            title="My Articles"
            action={
              <CreateArticleButton
                eligibility={dashboard.articlePosting}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                label="+ Create Article"
              />
            }
            subtitle={
              dashboard.articlePosting
                ? dashboard.articlePosting.isUnlimited
                  ? "Unlimited technical articles this year"
                  : dashboard.articlePosting.plan === "free"
                    ? "Technical articles require Basic plan or higher"
                    : `${dashboard.articlePosting.remaining ?? 0} of ${dashboard.articlePosting.effectiveLimit ?? 0} articles remaining this year`
                : undefined
            }
          >
            {!dashboard.articles || dashboard.articles.length === 0 ? (
              <EmptyState icon={<FileText className="w-10 h-10 text-gray-300" />} message="You haven't created any articles yet.">
                <Link href="/recruiter/articles/create" className="inline-block text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Write your first article
                </Link>
              </EmptyState>
            ) : (
              <Table
                head={["Title", "Status", "Actions"]}
                alignLast="right"
                center={[1]}
                rows={dashboard.articles.map((article) => [
                  <div>
                    <div className="font-medium text-gray-900">{article.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Created {new Date(article.createdAt).toLocaleDateString()}
                    </div>
                  </div>,
                  <StatusBadge status={article.status} />,
                  <Link href={`/recruiter/articles/${article.id}/edit`} className="text-blue-600 hover:text-blue-700 font-medium">
                    Edit
                  </Link>,
                ])}
              />
            )}
          </Panel>

          {/* ================= DIRECTORIES ================= */}
          <Panel
            title="My Directories"
            action={
              <Link
                href="/recruiter/directory/new"
                className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Add Directory
              </Link>
            }
            subtitle={
              dashboard.productListings
                ? dashboard.productListings.isUnlimited
                  ? "Unlimited supplier directories"
                  : `${dashboard.productListings.remaining ?? 0} of ${dashboard.productListings.effectiveLimit ?? 0} directory slots remaining`
                : undefined
            }
          >
            {!dashboard.directories || dashboard.directories.length === 0 ? (
              <EmptyState icon={<FolderOpen className="w-10 h-10 text-gray-300" />} message="You haven't added any directories yet.">
                <Link href="/recruiter/directory/new" className="inline-block text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Add your first directory
                </Link>
              </EmptyState>
            ) : (
              <Table
                head={["Directory", "Status", "Actions"]}
                alignLast="right"
                center={[1]}
                rows={dashboard.directories.map((dir) => [
                  <div>
                    <div className="font-medium text-gray-900">{dir.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">/suppliers/{dir.slug}</div>
                  </div>,
                  <StatusBadge status={dir.status} />,
                  dir.isLiveEditable ? (
                    <Link href={`/recruiter/directory/${dir.id}/edit`} className="text-blue-600 hover:text-blue-700 font-medium">
                      Edit
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-xs">Not editable</span>
                  ),
                ])}
              />
            )}
          </Panel>
        </main>

        {/* ================= SIDEBAR ================= */}
        <aside className="col-span-12 xl:col-span-3 space-y-6">
          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto ring-4 ring-gray-50 bg-gray-100 flex items-center justify-center">
                {recruiter?.avatarUrl ? (
                  <Image
                    src={recruiter.avatarUrl}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-gray-600">
                    {getInitials(recruiter?.fullName || recruiter?.username || "U")}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            <h3 className="font-semibold text-lg text-gray-900">
              {recruiter?.fullName || recruiter?.username}
            </h3>

            {recruiter?.headline && (
              <p className="text-sm text-gray-500 mt-1">{recruiter.headline}</p>
            )}

            {recruiter?.Company?.name && (
              <p className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 mt-2">
                {recruiter.Company.name}
                {recruiter.Company.isVerified && <BadgeCheck className="w-3.5 h-3.5" />}
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
              className="block mt-3 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              Edit Profile
            </Link>

            <div className="flex items-center justify-center gap-1.5 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
              Current Plan
              <span className="font-semibold text-gray-800">{planLabel}</span>
            </div>
          </div>

          {/* PACKAGE PURCHASES */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold mb-1 flex items-center gap-2 text-gray-900">
              <CreditCard size={16} className="text-blue-600" />
              Purchase History
            </h3>
            <p className="text-xs text-gray-500 mb-4">Active plan: {planLabel}</p>

            {!dashboard.recentPurchases || dashboard.recentPurchases.length === 0 ? (
              <div className="text-sm text-gray-500">
                <p>No purchases yet.</p>
                <Link href="/packages" className="mt-2 inline-block text-blue-600 hover:underline font-medium">
                  Browse packages →
                </Link>
              </div>
            ) : (
              <ul className="space-y-2.5 text-sm">
                {dashboard.recentPurchases.map((purchase) => (
                  <li key={purchase.id} className="rounded-lg border border-gray-100 px-3 py-2.5 hover:border-gray-200 transition-colors">
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <Bell size={16} className="text-blue-600" />
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
                        <span className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ACTIVITY_DOT_COLORS[activity.color]}`} />
                        <span className="group-hover:underline">{activity.message}</span>
                      </Link>
                    ) : (
                      <span className="flex items-start gap-2 text-gray-600">
                        <span className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ACTIVITY_DOT_COLORS[activity.color]}`} />
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
  accent,
  subtitle,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  accent: string
  subtitle?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 ${accent}`}
      >
        {icon}
      </div>

      <p className="text-lg font-semibold text-gray-700 leading-snug">
        {title}
      </p>

      <p className="text-4xl font-bold text-gray-900 mt-2 leading-none">
        {value}
      </p>

      {subtitle && (
        <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-2">
          {subtitle}
        </p>
      )}
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
      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-gray-900 truncate">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{desc}</p>
      </div>
    </div>
  )
}

function Panel({
  title,
  subtitle,
  action,
  actionHref,
  actionLabel,
  children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  actionHref?: string
  actionLabel?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {action}
        {actionHref && actionLabel && (
          <Link href={actionHref} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            {actionLabel} →
          </Link>
        )}
      </div>
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  )
}

function EmptyState({
  icon,
  message,
  children,
}: {
  icon: React.ReactNode
  message: string
  children?: React.ReactNode
}) {
  return (
    <div className="text-center py-10">
      <div className="mx-auto mb-3 flex items-center justify-center">{icon}</div>
      <p className="text-sm text-gray-500 mb-2">{message}</p>
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_BADGE[status] ?? "bg-gray-50 text-gray-600 ring-1 ring-gray-600/10"
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

function Table({
  head,
  rows,
  alignLast,
  center = [],
}: {
  head: string[]
  rows: React.ReactNode[][]
  alignLast?: "right"
  center?: number[]
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50/70 border-b border-gray-100">
          <tr>
            {head.map((h, i) => (
              <th
                key={h}
                className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === head.length - 1 && alignLast === "right"
                  ? "text-right"
                  : center.includes(i)
                    ? "text-center"
                    : "text-left"
                  }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-gray-50/60 transition-colors">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-4 py-4 ${ci === row.length - 1 && alignLast === "right"
                    ? "text-right"
                    : center.includes(ci)
                      ? "text-center"
                      : "text-left"
                    }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
"use client"

import { useEffect, useMemo, useState } from "react"
import { FileText, Eye, Share2, Check, X } from "lucide-react"

/* ================= TYPES ================= */

type Company = {
  id: number
  name: string
  eligibility?: {
    canCreate?: boolean
    plan?: string
    planLabel?: string
    articlesThisYear?: number
    effectiveLimit?: number | "Unlimited"
    remaining?: number | null
    isUnlimited?: boolean
    periodLabel?: string
    message?: string
  } | null
}

type Article = {
  id: number
  title: string
  views: number
  shares: number
  Company?: Company
}

/* ================= PAGE ================= */

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [status, setStatus] = useState<"PENDING" | "APPROVED">("APPROVED")
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null

  /* ================= FETCH ================= */

  const fetchArticles = async () => {
    if (!token) return

    try {
      setLoading(true)

      const endpoint =
        status === "PENDING"
          ? "/api/admin/articles/pending"
          : "/api/admin/articles/adminapproved"

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await res.json()
      setArticles(Array.isArray(data) ? data : [])
      setSelectedCompanyId(null)
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [status])

  /* ================= APPROVE ================= */

  const handleApprove = async (id: number) => {
    if (!token) return

    try {
      setLoadingId(id)

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/articles/${id}/approve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      await fetchArticles()
    } catch (error) {
      console.error("Approval failed", error)
    } finally {
      setLoadingId(null)
    }
  }

  /* ================= REJECT ================= */

  const handleReject = async (id: number) => {
    if (!token) return

    try {
      setLoadingId(id)

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/articles/${id}/reject`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      await fetchArticles()
    } catch (error) {
      console.error("Reject failed", error)
    } finally {
      setLoadingId(null)
    }
  }

  /* ================= STATS ================= */

  const totalArticles = articles.length

  const totalViews = useMemo(
    () => articles.reduce((sum, a) => sum + (a.views ?? 0), 0),
    [articles]
  )

  const totalShares = useMemo(
    () => articles.reduce((sum, a) => sum + (a.shares ?? 0), 0),
    [articles]
  )

  /* ================= GROUP BY COMPANY ================= */

  const companies = useMemo(() => {
    const map = new Map<number, { company: Company; count: number }>()

    articles.forEach(article => {
      if (!article.Company) return

      if (!map.has(article.Company.id)) {
        map.set(article.Company.id, {
          company: article.Company,
          count: 1,
        })
      } else {
        map.get(article.Company.id)!.count++
      }
    })

    return Array.from(map.values())
  }, [articles])

  const filteredArticles = useMemo(() => {
    if (!selectedCompanyId) return []
    return articles.filter(a => a.Company?.id === selectedCompanyId)
  }, [articles, selectedCompanyId])

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#F4F6FA] p-8 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A2B57]">
          Article Moderation
        </h1>
        <p className="text-sm text-gray-500">
          Review and manage company articles
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Articles Posted" value={totalArticles} icon={<FileText />} color="bg-blue-600" />
        <StatCard label="Articles Viewed" value={totalViews} icon={<Eye />} color="bg-green-600" />
        <StatCard label="Articles Shared" value={totalShares} icon={<Share2 />} color="bg-purple-600" />
      </div>

      {/* TABS */}
      <div className="flex gap-3">
        {["PENDING", "APPROVED"].map(tab => (
          <button
            key={tab}
            onClick={() => setStatus(tab as any)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition
              ${
                status === tab
                  ? "bg-[#0A2B57] text-white shadow"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-12 gap-6">

        {/* COMPANIES */}
        <aside className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-[#0A2B57] mb-4">Companies</h2>
          <ul className="space-y-2">
            {companies.map(({ company, count }) => (
              <li
                key={company.id}
                onClick={() => setSelectedCompanyId(company.id)}
                className={`p-3 rounded-md cursor-pointer flex flex-col justify-between transition gap-1
                  ${
                    selectedCompanyId === company.id
                      ? "bg-blue-50 text-[#0A2B57] font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span>{company.name}</span>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">{count}</span>
                </div>
                {company.eligibility && (
                  <div className="text-[11px] text-gray-500 font-normal mt-0.5 flex flex-wrap gap-x-2">
                    <span className="font-semibold text-indigo-600 capitalize">
                      {company.eligibility.planLabel || company.eligibility.plan}
                    </span>
                    <span>•</span>
                    <span>
                      {company.eligibility.isUnlimited
                        ? "Unlimited"
                        : `${company.eligibility.articlesThisYear ?? 0}/${company.eligibility.effectiveLimit ?? 0} used`}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* ARTICLES */}
        <main className="col-span-9 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {loading && <p className="text-gray-500">Loading articles...</p>}

          {!selectedCompanyId && !loading && (
            <p className="text-gray-500">Select a company to view articles</p>
          )}

          {selectedCompanyId && !loading && (
            (() => {
              const selectedComp = companies.find(c => c.company.id === selectedCompanyId)?.company
              if (!selectedComp || !selectedComp.eligibility) return null
              const elig = selectedComp.eligibility
              return (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[#0A2B57] text-lg">
                      {selectedComp.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Subscription Plan: <span className="font-semibold text-indigo-700 capitalize">{elig.planLabel || elig.plan}</span>
                    </p>
                  </div>
                  <div className="bg-white/90 px-4 py-2 rounded-lg border border-blue-150 shadow-sm text-right">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Article Limit Usage (Yearly)</p>
                    <p className="text-lg font-bold text-indigo-900 mt-0.5">
                      {elig.isUnlimited 
                        ? "Unlimited" 
                        : `${elig.articlesThisYear ?? 0} of ${elig.effectiveLimit ?? 0} articles used`}
                    </p>
                  </div>
                </div>
              )
            })()
          )}

          <ul className="space-y-4">
            {filteredArticles.map(article => (
              <li
                key={article.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
              >
                <h3 className="font-semibold text-[#0A2B57]">{article.title}</h3>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>👁 {article.views} views</p>
                    <p>🔁 {article.shares} shares</p>
                  </div>

                  {status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(article.id)}
                        disabled={loadingId === article.id}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check size={14} />
                        {loadingId === article.id ? "..." : "Approve"}
                      </button>

                      <button
                        onClick={() => handleReject(article.id)}
                        disabled={loadingId === article.id}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  )
}

/* ================= STAT CARD ================= */

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div className={`w-12 h-12 ${color} text-white rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  )
}
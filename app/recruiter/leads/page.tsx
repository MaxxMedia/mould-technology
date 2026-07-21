"use client"

import { useEffect, useState, useCallback } from "react"
import { Inbox } from "lucide-react"
import { useRecruiterGuard } from "@/lib/useRecruiterGuard"
import Link from "next/link"

type Lead = {
  id: number
  fullName: string
  email: string
  phoneNumber: string | null
  website: string | null
  companyName: string | null
  message: string
  status: string
  createdAt: string
}

type LeadsEligibility = {
  canView: boolean
  plan: string
  planLabel?: string
  effectiveLimit: number | "Unlimited" | null
  remaining: number | null
  isUnlimited: boolean
  usedThisMonth: number
  message?: string
  upgradeRequired?: boolean
}

type LeadsResponse = {
  leads: Lead[]
  total: number
  page?: number
  pageSize?: number
  eligibility?: LeadsEligibility
}

export default function RecruiterLeadsPage() {
  const allowed = useRecruiterGuard()

  const [data, setData] = useState<LeadsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [downloading, setDownloading] = useState(false)

  const fetchLeads = useCallback(async (pageNum: number) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/leads?page=${pageNum}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        }
      )
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to load leads")
      }
      const json = await res.json()
      
      console.log("API Response:", json) // Debug log

      // Handle both response formats: { data: [...] } or { leads: [...] }
      const leads = json.data ?? json.leads ?? []
      const total = json.total ?? leads.length ?? 0
      
      setData({
        leads: leads,
        total: total,
        page: json.page ?? pageNum,
        pageSize: json.pageSize ?? 10,
        eligibility: json.eligibility,
      })
    } catch (err) {
      console.error("Leads load error:", err)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!allowed) return
    fetchLeads(page)
  }, [allowed, page, fetchLeads])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/leads/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error("Failed to export leads")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "rfq_leads.csv"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
    } finally {
      setDownloading(false)
    }
  }

  if (!allowed) return null

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    )
  }

  const totalPages =
    data?.total && data?.pageSize ? Math.ceil(data.total / data.pageSize) : 1

  // Check if upgrade is required - with proper null checks
  const upgradeRequired = data?.eligibility?.upgradeRequired ?? false

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">RFQ Leads</h1>
            {data?.eligibility && (
              <p className="text-sm text-gray-500 mt-1">
                {data.eligibility.isUnlimited
                  ? "Unlimited leads on your plan"
                  : `${data.eligibility.remaining ?? 0} of ${data.eligibility.effectiveLimit ?? 0} leads remaining this month`}
              </p>
            )}
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading || !data?.leads?.length}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {downloading ? "Preparing CSV..." : "Download CSV"}
          </button>
        </div>

        {error && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-red-500">
            {error}
          </div>
        )}

        {!error && upgradeRequired && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">
              RFQ Leads aren't included in your current plan.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Upgrade to Basic, Professional, or Enterprise to start receiving leads.
            </p>
            <Link
              href="/packages"
              className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Upgrade Plan
            </Link>
          </div>
        )}

        {!error && data && !upgradeRequired && (
          <>
            {(!data.leads || data.leads.length === 0) ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No leads yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Name", "Email", "Phone", "Company", "Message", "Status", "Received"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 font-medium text-gray-900">{lead.fullName}</td>
                        <td className="px-4 py-4 text-gray-600">{lead.email}</td>
                        <td className="px-4 py-4 text-gray-600">{lead.phoneNumber || "—"}</td>
                        <td className="px-4 py-4 text-gray-600">{lead.companyName || "—"}</td>
                        <td className="px-4 py-4 text-gray-600 max-w-xs truncate">
                          {lead.message}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-md border border-gray-300 text-sm bg-white disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-md border border-gray-300 text-sm bg-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
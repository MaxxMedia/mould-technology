"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { 
  Building2, 
  Eye, 
  Share2, 
  Filter, 
  CheckCircle, 
  UserCheck, 
  Mail, 
  RefreshCw, 
  XCircle,
  Clock,
  Users,
  LogIn
} from "lucide-react"
import AdminPagination, { ADMIN_PAGE_SIZE } from "@/components/admin/AdminPagination"

const PAGE_SIZE = ADMIN_PAGE_SIZE

/* ================= TYPES ================= */

type Directory = {
  id: number
  name: string
  slug: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  isLiveEditable: boolean
  views?: number
  connections?: number
  company?: { name: string }
  submittedBy?: {
    id: number
    email: string
    isOnboarded?: boolean
    lastLoginAt?: string | null
    emailSentForBulkImport?: boolean
  }
  approvedBy?: { email: string }
  createdAt: string
  isVerified?: boolean
  isActive?: boolean
}

/* ================= PAGE ================= */

export default function AdminDirectoriesPage() {
  const [directories, setDirectories] = useState<Directory[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null

  /* ================= FETCH ================= */

  const fetchData = async () => {
    if (!token) return;

    try {
      setLoading(true)
      
      const [suppliersRes, usersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-import/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ])

      const suppliersData = await suppliersRes.json()
      const usersData = await usersRes.json()

      // ✅ Create a map of user status by user ID from the users API
      const userStatusMap: Record<number, any> = {}
      if (Array.isArray(usersData)) {
        usersData.forEach((user: any) => {
          userStatusMap[user.id] = {
            lastLoginAt: user.lastLoginAt,
            emailSentForBulkImport: user.emailSentForBulkImport,
            isOnboarded: user.isOnboarded,
          }
        })
      }

      const rows = Array.isArray(suppliersData)
        ? suppliersData.map((d: any) => {
            // Get the user from the response
            const rawUser = d.User_SupplierDirectory_submittedByIdToUser || d.submittedBy || {}
            const status = rawUser.id ? userStatusMap[rawUser.id] : null
            
            // ✅ Merge user data with status from the users API
            const mergedUser = {
              ...rawUser,
              lastLoginAt: status?.lastLoginAt ?? rawUser.lastLoginAt ?? null,
              isOnboarded: status?.isOnboarded ?? rawUser.isOnboarded ?? false,
              emailSentForBulkImport: status?.emailSentForBulkImport ?? rawUser.emailSentForBulkImport ?? false,
            }
            
            console.log(`👤 User: ${mergedUser.email || 'No email'}`, {
              lastLoginAt: mergedUser.lastLoginAt,
              emailSentForBulkImport: mergedUser.emailSentForBulkImport,
              isOnboarded: mergedUser.isOnboarded
            })
          
          return {
            ...d,
            company: d.Company || d.company,
            submittedBy: mergedUser.id ? {
              id: mergedUser.id,
              email: mergedUser.email,
              username: mergedUser.username,
              fullName: mergedUser.fullName,
              isOnboarded: mergedUser.isOnboarded || false,
              lastLoginAt: mergedUser.lastLoginAt || null,
              emailSentForBulkImport: mergedUser.emailSentForBulkImport || false,
            } : undefined,
            approvedBy: d.User_SupplierDirectory_approvedByIdToUser || d.approvedBy,
            isVerified: d.isVerified || d.Company?.isVerified || false,
            isActive: d.status === "APPROVED",
          }
        })
      : [];

    setDirectories(rows);
    } catch (err) {
      console.error("❌ Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  /* ================= SEND EMAIL ================= */

  const sendEmail = async (userId: number, userEmail: string) => {
    setSendingId(userId)
    setMessage(null)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-import/${userId}/send-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      setMessage({
        type: 'success',
        text: `✅ Email sent to ${data.email}`,
      })

      setTimeout(() => {
        fetchData()
      }, 1500)

    } catch (error: any) {
      console.error("❌ Send email error:", error)
      setMessage({
        type: 'error',
        text: `❌ ${error.message}`,
      })
    } finally {
      setSendingId(null)
    }
  }

  /* ================= FILTERED DIRECTORIES ================= */

  const filteredDirectories = useMemo(() => {
    let result = [...directories]

    // Filter by Login Status
    if (filterStatus === "logged-in") {
      // ✅ Users who have logged in (lastLoginAt exists)
      result = result.filter(d => d.submittedBy?.lastLoginAt)
    } else if (filterStatus === "pending-login") {
      // ✅ Users who have received email but NOT logged in
      result = result.filter(d => 
        d.submittedBy && 
        !d.submittedBy.lastLoginAt && 
        d.submittedBy.emailSentForBulkImport
      )
    }

    return result
  }, [directories, filterStatus])

  /* ================= STATS ================= */

  const totalDirectories = filteredDirectories.length

  const totalViews = filteredDirectories.reduce(
    (sum, d) => sum + (d.views ?? 0),
    0
  )

  const totalConnections = filteredDirectories.reduce(
    (sum, d) => sum + (d.connections ?? 0),
    0
  )

  const totalPages = Math.max(1, Math.ceil(filteredDirectories.length / PAGE_SIZE))

  const paginatedDirectories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredDirectories.slice(start, start + PAGE_SIZE)
  }, [filteredDirectories, currentPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  /* ================= CHECK IF USER CAN RECEIVE EMAIL ================= */

  const canSendEmail = (user: any) => {
    if (!user) return false
    return !user?.lastLoginAt && !user?.emailSentForBulkImport
  }

  const getEmailStatus = (user: any) => {
    if (!user) {
      return {
        text: "No User",
        icon: <XCircle className="w-4 h-4" />,
        className: "text-gray-500",
        buttonText: "—",
        disabled: true
      }
    }

    // ✅ If lastLoginAt exists, user has logged in
    if (user?.lastLoginAt) {
      return {
        text: "Logged In",
        icon: <LogIn className="w-4 h-4" />,
        className: "text-green-600",
        buttonText: "🔒 Logged In",
        disabled: true
      }
    }
    
    // ✅ If email was sent but user hasn't logged in
    if (user?.emailSentForBulkImport) {
      return {
        text: "Email Sent",
        icon: <CheckCircle className="w-4 h-4" />,
        className: "text-blue-600",
        buttonText: "✅ Sent",
        disabled: true
      }
    }
    
    // ✅ User hasn't received email yet
    return {
      text: "Pending",
      icon: <XCircle className="w-4 h-4" />,
      className: "text-yellow-600",
      buttonText: "Send Email",
      disabled: false
    }
  }

  /* ================= STATS COUNTS ================= */

  // ✅ Count users who have logged in (lastLoginAt exists)
  const loggedInCount = directories.filter(d => d.submittedBy?.lastLoginAt).length
  
  // ✅ Count users who have received email but NOT logged in
  const pendingLoginCount = directories.filter(d => 
    d.submittedBy && 
    !d.submittedBy.lastLoginAt && 
    d.submittedBy.emailSentForBulkImport
  ).length

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fc]">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Supplier Listing
            </h1>
            <p className="text-sm text-gray-500">
              Review and manage supplier listing
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/directories/bulk-upload"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
              + Bulk Supplier Creation
            </Link>

            <Link
              href="/admin/directories/full-setup"
              className="bg-purple-600 text-white px-5 py-2 rounded-lg shadow hover:bg-purple-700 transition"
            >
              + Create Company Supplier Listing
            </Link>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* FILTERS - Simplified */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>

            {/* All */}
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                filterStatus === "all"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" />
              All ({directories.length})
            </button>

            {/* Pending Login */}
            <button
              onClick={() => setFilterStatus("pending-login")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                filterStatus === "pending-login"
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              Pending Login ({pendingLoginCount})
            </button>

            {/* Logged In */}
            <button
              onClick={() => setFilterStatus("logged-in")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                filterStatus === "logged-in"
                  ? "bg-green-600 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-1" />
              Logged In ({loggedInCount})
            </button>

            {/* Clear Filters */}
            {filterStatus !== "all" && (
              <button
                onClick={() => setFilterStatus("all")}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            label="Total Suppliers"
            value={totalDirectories}
            icon={<Building2 className="w-6 h-6 text-white" />}
            color="from-blue-500 to-blue-600"
          />

          <StatCard
            label="Total Views"
            value={totalViews}
            icon={<Eye className="w-6 h-6 text-white" />}
            color="from-green-500 to-green-600"
          />

          <StatCard
            label="Total Connections"
            value={totalConnections}
            icon={<Share2 className="w-6 h-6 text-white" />}
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
          {filteredDirectories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No suppliers found</p>
              {filterStatus !== "all" && (
                <button
                  onClick={() => setFilterStatus("all")}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Clear filter to see all suppliers
                </button>
              )}
            </div>
          )}

          {filteredDirectories.length > 0 && (
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="py-3">Name</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Active</th>
                  <th>Company</th>
                  <th>Submitted By</th>
                  <th>Email Status</th>
                  <th>Action</th>
                  <th></th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {paginatedDirectories.map(dir => {
                  const emailStatus = getEmailStatus(dir.submittedBy)
                  const canSend = canSendEmail(dir.submittedBy)
                  
                  return (
                    <tr key={dir.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium">
                        {dir.name}
                        <div className="text-xs text-gray-400">
                          /suppliers/{dir.slug}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            dir.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : dir.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {dir.status}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            dir.isVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {dir.isVerified ? "✅ Verified" : "❌ Unverified"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            dir.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {dir.isActive ? "🟢 Active" : "🔴 Inactive"}
                        </span>
                      </td>

                      <td>{dir.company?.name || "—"}</td>

                      <td>
                        {dir.submittedBy ? (
                          <>
                            <div className="font-medium">{dir.submittedBy.email}</div>
                            {dir.submittedBy.lastLoginAt && (
                              <div className="text-xs text-gray-400">
                                Last login: {new Date(dir.submittedBy.lastLoginAt).toLocaleDateString()}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td>
                        <span className={`flex items-center gap-1 ${emailStatus.className}`}>
                          {emailStatus.icon} {emailStatus.text}
                        </span>
                      </td>

                      <td>
                        {dir.submittedBy && canSend ? (
                          <button
                            onClick={() => sendEmail(dir.submittedBy!.id, dir.submittedBy!.email)}
                            disabled={sendingId === dir.submittedBy.id}
                            className={`flex items-center gap-1 px-3 py-1 rounded text-white transition ${
                              sendingId === dir.submittedBy.id
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            <Mail className="w-4 h-4" />
                            {sendingId === dir.submittedBy.id ? "Sending..." : "Send Email"}
                          </button>
                        ) : dir.submittedBy ? (
                          <button
                            disabled
                            className="px-3 py-1 bg-gray-200 text-gray-500 rounded cursor-not-allowed"
                          >
                            {dir.submittedBy?.lastLoginAt ? "🔒 Logged In" : "✅ Sent"}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">No user</span>
                        )}
                      </td>

                      <td className="text-right">
                        <Link
                          href={`/admin/directories/${dir.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredDirectories.length}
            pageSize={PAGE_SIZE}
            itemLabel="suppliers"
            onPageChange={setCurrentPage}
            className="mt-6 border-0 shadow-none px-0"
          />
        </div>
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
  value: number | string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div
        className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  )
}
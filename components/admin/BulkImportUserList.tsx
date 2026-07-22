// components/admin/BulkImportUserList.tsx

"use client"

import { useState, useEffect } from "react"
import { Mail, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"

interface BulkUser {
  id: number
  email: string
  username: string
  companyName: string
  createdAt: string
  emailSentForBulkImport: boolean
  isOnboarded: boolean
  lastLoginAt: string | null
}

export default function BulkImportUserList() {
  const [users, setUsers] = useState<BulkUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    fetchUsers()
  }, [token])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-import/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      console.log("📊 Fetched users (email sent, not logged in):", data)
      setUsers(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("❌ Failed to fetch users:", error)
      setError(error.message)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const sendEmail = async (userId: number) => {
    setSendingId(userId)
    setMessage(null)
    setError(null)

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
        text: `✅ Email resent to ${data.email}`,
      })

      // ✅ Refresh the list after sending
      setTimeout(() => {
        fetchUsers()
      }, 1000)

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

  const getStatusDisplay = (user: BulkUser) => {
    // These users should all have emailSentForBulkImport: true, isOnboarded: false
    return {
      text: "Email Sent",
      icon: <CheckCircle className="w-4 h-4" />,
      className: "text-green-600",
      tooltip: "Email credentials sent to user"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">📧 Users with Email Sent (Pending Login)</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {users.length} user{users.length !== 1 ? 's' : ''} pending login
          </span>
          <button
            onClick={fetchUsers}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          ❌ Error loading users: {error}
          <button 
            onClick={fetchUsers} 
            className="ml-2 text-blue-600 underline"
          >
            Retry
          </button>
        </div>
      )}

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {users.length === 0 && !error && (
        <div className="text-gray-500 py-4 text-center">
          <p>✅ No users pending login. All users with email sent have logged in.</p>
          <p className="text-sm mt-2">Users who haven't received email will appear here after sending.</p>
        </div>
      )}

      {users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="py-3">Email</th>
                <th>Company</th>
                <th>Created</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(user => {
                const status = getStatusDisplay(user)
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium">{user.email}</td>
                    <td>{user.companyName}</td>
                    <td className="text-xs text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td>
                      <span 
                        className={`flex items-center gap-1 ${status.className}`}
                        title={status.tooltip}
                      >
                        {status.icon} {status.text}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => sendEmail(user.id)}
                        disabled={sendingId === user.id}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-white transition ${
                          sendingId === user.id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-600 hover:bg-orange-700"
                        }`}
                      >
                        <RefreshCw className={`w-4 h-4 ${sendingId === user.id ? 'animate-spin' : ''}`} />
                        {sendingId === user.id ? "Resending..." : "Resend Email"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
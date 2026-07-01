"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Bell,
  BellOff,
  MapPin,
  Briefcase,
  Trash2,
  Plus,
  X,
} from "lucide-react"
import { useCandidateGuard } from "@/lib/useCandidateGuard"

type JobAlert = {
  id: number
  name: string | null
  keywords: string | null
  location: string | null
  employmentType: string | null
  isRemote: boolean | null
  isActive: boolean
  matchCount: number
  createdAt: string
}

const EMPLOYMENT_TYPES = [
  "",
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
]

export default function JobAlertsPage() {
  useCandidateGuard()

  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: "",
    keywords: "",
    location: "",
    employmentType: "",
    isRemote: false,
  })
  const [saving, setSaving] = useState(false)

  async function loadAlerts() {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/job-alerts/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (Array.isArray(data)) setAlerts(data)
    } catch (err) {
      console.error("Failed to load job alerts", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.keywords && !form.location && !form.employmentType) return

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/job-alerts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name || null,
            keywords: form.keywords || null,
            location: form.location || null,
            employmentType: form.employmentType || null,
            isRemote: form.isRemote || null,
          }),
        }
      )

      if (res.ok) {
        setForm({ name: "", keywords: "", location: "", employmentType: "", isRemote: false })
        setShowForm(false)
        await loadAlerts()
      }
    } catch (err) {
      console.error("Failed to create alert", err)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(alert: JobAlert) {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/job-alerts/${alert.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !alert.isActive }),
        }
      )
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alert.id ? { ...a, isActive: !a.isActive } : a
          )
        )
      }
    } catch (err) {
      console.error("Failed to toggle alert", err)
    }
  }

  async function handleDelete(id: number) {
    try {
      const token = localStorage.getItem("token")
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/job-alerts/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      console.error("Failed to delete alert", err)
    }
  }

  if (loading) {
    return <div className="p-10">Loading job alerts...</div>
  }

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link
          href="/candidate/feed"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4"
        >
          <ArrowLeft size={14} />
          Back to feed
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Job Alerts</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? "Cancel" : "Create alert"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-lg shadow-sm p-5 mb-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert name (optional)
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Remote React jobs"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <input
                type="text"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="e.g. React developer frontend"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Mumbai, Bangalore"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment type
                </label>
                <select
                  value={form.employmentType}
                  onChange={(e) =>
                    setForm({ ...form, employmentType: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t || "Any"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isRemote}
                onChange={(e) => setForm({ ...form, isRemote: e.target.checked })}
                className="rounded"
              />
              Remote jobs only
            </label>

            <button
              type="submit"
              disabled={saving || (!form.keywords && !form.location && !form.employmentType)}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded-full"
            >
              {saving ? "Creating..." : "Create alert"}
            </button>
          </form>
        )}

        {alerts.length === 0 && !showForm && (
          <div className="bg-white p-6 rounded shadow-sm text-gray-500">
            You don&apos;t have any job alerts yet. Create an alert to get
            notified when new jobs match your criteria.
          </div>
        )}

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg shadow-sm p-5 ${!alert.isActive ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {alert.name || "Job Alert"}
                  </h3>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                    {alert.keywords && (
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <Briefcase size={11} />
                        {alert.keywords}
                      </span>
                    )}
                    {alert.location && (
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <MapPin size={11} />
                        {alert.location}
                      </span>
                    )}
                    {alert.employmentType && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {alert.employmentType}
                      </span>
                    )}
                    {alert.isRemote && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        Remote
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    {alert.matchCount} matching job{alert.matchCount !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(alert)}
                    title={alert.isActive ? "Pause alert" : "Activate alert"}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    {alert.isActive ? <Bell size={18} /> : <BellOff size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    title="Delete alert"
                    className="p-2 rounded-full hover:bg-red-50 text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {alert.matchCount > 0 && alert.isActive && (
                <Link
                  href={`/candidate/job-alerts/${alert.id}`}
                  className="inline-block mt-3 text-sm text-blue-600 hover:underline font-medium"
                >
                  View matching jobs →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

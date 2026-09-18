"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Building2, Upload, X } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const SOCIAL_FIELDS = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" },
  { key: "twitter", label: "Twitter / X" },
  { key: "youtube", label: "YouTube" },
  { key: "instagram", label: "Instagram" },
  { key: "whatsapp", label: "WhatsApp" },
] as const

type FormState = {
  name: string
  slug: string
  description: string
  logoUrl: string
  website: string
  phoneNumber: string
  email: string
  googleMapUrl: string
  tradeNames: string
  socialLinks: Record<string, string>
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  description: "",
  logoUrl: "",
  website: "",
  phoneNumber: "",
  email: "",
  googleMapUrl: "",
  tradeNames: "",
  socialLinks: {},
}

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

function joinTradeNames(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean).join(", ")
  }
  if (typeof value === "string") return value
  return ""
}

export default function AdminEditDirectoryPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    async function load() {
      if (!token) return

      try {
        const res = await fetch(`${API_URL}/api/admin/directories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Failed to load directory")
        }

        const social = data.socialLinks && typeof data.socialLinks === "object" && !Array.isArray(data.socialLinks)
          ? data.socialLinks
          : {}

        setCompanyName(data.company?.name || "")
        setForm({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          logoUrl: data.logoUrl || "",
          website: data.website || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          googleMapUrl: data.googleMapUrl || "",
          tradeNames: joinTradeNames(data.tradeNames),
          socialLinks: {
            ...social,
            ...SOCIAL_FIELDS.reduce<Record<string, string>>((acc, field) => {
              acc[field.key] = social[field.key] || ""
              return acc
            }, {}),
          },
        })
      } catch (err: any) {
        setError(err.message || "Failed to load directory")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, token])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess("")
  }

  async function handleLogoUpload(file: File) {
    setUploading(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error || "Failed to upload logo")
      }
      updateField("logoUrl", data.imageUrl)
    } catch (err: any) {
      setError(err.message || "Failed to upload logo")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch(`${API_URL}/api/admin/directories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description,
          logoUrl: form.logoUrl.trim() || null,
          website: form.website.trim() || null,
          phoneNumber: form.phoneNumber.trim() || null,
          email: form.email.trim() || null,
          googleMapUrl: form.googleMapUrl.trim() || null,
          tradeNames: form.tradeNames,
          socialLinks: form.socialLinks,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Failed to update directory")
      }

      if (data.directory?.slug) {
        updateField("slug", data.directory.slug)
      }
      setSuccess("Supplier directory updated")
    } catch (err: any) {
      setError(err.message || "Failed to update directory")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fc]">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/admin/directories"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to supplier directories
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Edit Supplier Directory
            </h1>
            {companyName && (
              <p className="text-sm text-gray-500 mt-1">Company: {companyName}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700">{error}</div>
        )}
        {success && (
          <div className="p-4 rounded-lg bg-green-50 text-green-700">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Logo URL</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-28 h-28 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt="Directory logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400 px-2 text-center">No logo</span>
                )}
              </div>

              <div className="flex-1 w-full space-y-3">
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="https://example.com/logo.png"
                  value={form.logoUrl}
                  onChange={(e) => updateField("logoUrl", e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-blue-700">
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload logo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleLogoUpload(file)
                        e.target.value = ""
                      }}
                    />
                  </label>
                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={() => updateField("logoUrl", "")}
                      className="inline-flex items-center gap-1 border px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Upload an image or paste a logo URL. This is the logo shown on supplier listings.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => updateField("slug", generateSlug(form.name))}
                  className="shrink-0 border px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                >
                  From name
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Public URL: /suppliers/{form.slug || "..."}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={5}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="https://"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.phoneNumber}
                onChange={(e) => updateField("phoneNumber", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google Map URL</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.googleMapUrl}
                onChange={(e) => updateField("googleMapUrl", e.target.value)}
                placeholder="https://www.google.com/maps/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Trade names</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.tradeNames}
              onChange={(e) => updateField("tradeNames", e.target.value)}
              placeholder="Comma-separated names"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Social links</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SOCIAL_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.socialLinks[field.key] || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, [field.key]: e.target.value },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/directories")}
              className="border px-5 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

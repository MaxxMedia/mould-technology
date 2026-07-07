"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import UploadBox from "@/components/UploadBox"
import {
  fetchArticlePostingEligibility,
  type ContentLimitEligibility,
} from "@/lib/packageLimits"

export default function CreateRecruiterArticlePage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [badge, setBadge] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [eligibility, setEligibility] = useState<ContentLimitEligibility | null>(null)

  useEffect(() => {
    async function loadEligibility() {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        setEligibility(await fetchArticlePostingEligibility(token))
      } catch (err) {
        console.error(err)
      }
    }
    loadEligibility()
  }, [])

  /* ================= IMAGE UPLOAD ================= */

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!res.ok) throw new Error("Image upload failed")

      const data = await res.json()
      setImageUrl(data.imageUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recruiter/articles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            excerpt,
            content,
            imageUrl,
            badge: badge.trim() || null, // ✅ manual badge
          }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create article")
      }

      router.push("/recruiter/articles")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create Article</h1>

      {eligibility && !eligibility.canCreate && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>{eligibility.message}</p>
          <Link href="/packages" className="mt-2 inline-block font-medium text-[#004d73] hover:underline">
            View packages →
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}

        {/* TITLE */}
        <input
          type="text"
          placeholder="Article title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* EXCERPT */}
        <textarea
          placeholder="Short excerpt"
          className="w-full border p-2 rounded"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />

        {/* CONTENT */}
        <textarea
          placeholder="Article content"
          className="w-full border p-2 rounded h-48"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        {/* 🔥 MANUAL BADGE INPUT */}
        <input
          type="text"
          placeholder="Badge (optional) e.g. FEATURED, TRENDING"
          className="w-full border p-2 rounded"
          value={badge}
          onChange={(e) => setBadge(e.target.value.toUpperCase())}
        />

        {/* IMAGE UPLOAD */}
      <UploadBox
  label="Article Image"
  value={imageUrl}
  height="h-52"
  accept="image/*"
  onUpload={handleImageUpload}
/>

{uploading && (
  <p className="text-sm text-gray-500 mt-2">
    Uploading image...
  </p>
)}

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={loading || uploading || eligibility?.canCreate === false}
            className="w-full max-w-[220px] rounded bg-black px-6 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>
    </div>
  )
}

"use client"

import dynamic from "next/dynamic"
import { useEffect, useState, FormEvent, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import UploadBox from "@/components/UploadBox"

import "react-quill-new/dist/quill.snow.css"
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

export default function CreateIndustryTalkPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    title: "",
    slug: "",
    badge: "",
    imageUrl: "",
    excerpt: "",
    content: "",
    authorId: "",
    youtubeUrl: "",
  })

  const [authors, setAuthors] = useState<any[]>([])
  const [industryCategoryId, setIndustryCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [initializing, setInitializing] = useState(true)

  /* ================= LOAD AUTHORS + CATEGORY ================= */

  useEffect(() => {
    async function loadData() {
      try {
        const [aRes, cRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authors`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
        ])

        const a = await aRes.json()
        const c = await cRes.json()

        setAuthors(a.data || a)

        const categories = c.data || c
        const industry = categories.find(
          (cat: any) => cat.slug?.toLowerCase() === "industry-talks"
        )

        if (industry) {
          setIndustryCategoryId(industry.id)
        } else {
          setMessage("⚠ Industry Talks category not found in database")
        }
      } catch (err) {
        console.error("Initialization error:", err)
        setMessage("Failed to load initial data")
      } finally {
        setInitializing(false)
      }
    }

    loadData()
  }, [])

  /* ================= AUTO SLUG ================= */

  function handleTitleChange(e: ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")

    setForm(prev => ({ ...prev, title, slug }))
  }

  function handleChange(
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  /* ================= IMAGE UPLOAD ================= */

  async function handleImageUpload(file: File) {
    setUploading(true)
    setMessage("Uploading image...")

    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        { method: "POST", body: formData }
      )

      const data = await res.json()

      if (res.ok && data.imageUrl) {
        setForm(prev => ({ ...prev, imageUrl: data.imageUrl }))
        setMessage("Image uploaded successfully")
      } else {
        throw new Error()
      }
    } catch {
      setMessage("Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!industryCategoryId) {
      return setMessage("Industry Talks category not found")
    }

    setLoading(true)
    setMessage("")

    const token = localStorage.getItem("token")

    // Auto-generate excerpt if empty
    const generatedExcerpt =
      form.excerpt.trim() ||
      form.content.replace(/<[^>]+>/g, "").substring(0, 160) + "..."

    if (form.youtubeUrl && !form.youtubeUrl.includes("youtube")) {
      setLoading(false)
      return setMessage("Please enter a valid YouTube URL")
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          excerpt: generatedExcerpt,
          authorId: Number(form.authorId),
          categoryId: industryCategoryId,
        }),
      })

      const data = await res.json()
      setLoading(false)

      if (res.ok) {
        setMessage("Industry Talk created successfully!")

        setTimeout(() => {
          router.push("/admin/industry-talks")
        }, 1000)
      } else {
        setMessage(data?.error || "Something went wrong")
      }
    } catch (err) {
      console.error("Submit error:", err)
      setLoading(false)
      setMessage("Network error")
    }
  }

  /* ================= LOADING ================= */

  if (initializing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8 text-center">
          🎤 Create Industry Talk
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* TITLE */}
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleTitleChange}
            required
            placeholder="Title"
            className="w-full p-3 border rounded-lg"
          />

          {/* SLUG */}
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            placeholder="Slug"
            className="w-full p-3 border rounded-lg"
          />

          {/* IMAGE */}
          <UploadBox
            label="Featured Image"
            value={form.imageUrl}
            onUpload={handleImageUpload}
          />

          {/* YOUTUBE */}
          <input
            type="url"
            name="youtubeUrl"
            value={form.youtubeUrl}
            onChange={handleChange}
            placeholder="YouTube URL (Optional)"
            className="w-full p-3 border rounded-lg"
          />

          {/* AUTHOR */}
          <select
            name="authorId"
            value={form.authorId}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select author</option>
            {authors.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* SHORT SUMMARY */}
          <div>
            <label className="block font-semibold mb-2">
              Short Summary (Optional)
            </label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={3}
              placeholder="Write 2–3 line short summary..."
              className="w-full p-3 border rounded-lg resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.excerpt.length}/160 characters recommended
            </p>
          </div>

          {/* CONTENT */}
          <div>
            <label className="block font-semibold mb-2">
              Full Content
            </label>
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={(value) =>
                setForm(prev => ({ ...prev, content: value }))
              }
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Creating..." : "🚀 Create Industry Talk"}
          </button>

          {message && (
            <p className="text-center text-sm mt-2 text-red-600">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
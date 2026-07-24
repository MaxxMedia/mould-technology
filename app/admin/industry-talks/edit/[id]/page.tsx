"use client"

import dynamic from "next/dynamic"
import { useEffect, useState, FormEvent, ChangeEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import UploadBox from "@/components/UploadBox"

import "react-quill-new/dist/quill.snow.css"
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

export default function EditIndustryTalkPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id

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
  const [initializing, setInitializing] = useState(true)
  const [message, setMessage] = useState("")

  /* ================= LOAD INITIAL DATA ================= */

  useEffect(() => {
    async function loadData() {
      try {
        const [postRes, authorsRes, categoriesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authors`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
        ])

        const post = await postRes.json()
        const authorsData = await authorsRes.json()
        const categoriesData = await categoriesRes.json()

        setAuthors(authorsData.data || authorsData)

        const categories = categoriesData.data || categoriesData
        const industry = categories.find(
          (cat: any) => cat.slug?.toLowerCase() === "industry-talks"
        )

        if (industry) {
          setIndustryCategoryId(industry.id)
        }

        // PREFILL FORM
        setForm({
          title: post.title || "",
          slug: post.slug || "",
          badge: post.badge || "",
          imageUrl: post.imageUrl || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          authorId: post.authorId?.toString() || "",
          youtubeUrl: post.youtubeUrl || "",
        })
      } catch (err) {
        console.error(err)
        setMessage("Failed to load post data")
      } finally {
        setInitializing(false)
      }
    }

    if (id) loadData()
  }, [id])

  /* ================= HANDLERS ================= */

  function handleChange(
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleImageUpload(file: File) {
    setUploading(true)

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
      }
    } catch {
      setMessage("Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  /* ================= UPDATE SUBMIT ================= */

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!industryCategoryId) {
      return setMessage("Industry Talks category not found")
    }

    setLoading(true)
    setMessage("")

    const token = localStorage.getItem("token")

    const excerpt =
      form.excerpt.trim() ||
      form.content.replace(/<[^>]+>/g, "").substring(0, 160) + "..."

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            ...form,
            excerpt,
            authorId: Number(form.authorId),
            categoryId: industryCategoryId,
          }),
        }
      )

      const data = await res.json()
      setLoading(false)

      if (res.ok) {
        setMessage("Industry Talk updated successfully!")

        setTimeout(() => {
          router.push("/admin/industry-talks")
        }, 1000)
      } else {
        setMessage(data?.error || "Update failed")
      }
    } catch {
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
          ✏ Edit Industry Talk
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <UploadBox
            label="Featured Image"
            value={form.imageUrl}
            onUpload={handleImageUpload}
            // height="h-64"
          />

          <input
            type="url"
            name="youtubeUrl"
            value={form.youtubeUrl}
            onChange={handleChange}
            placeholder="YouTube URL"
            className="w-full p-3 border rounded-lg"
          />

          <select
            name="authorId"
            value={form.authorId}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          >
            <option value="">Select author</option>
            {authors.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={3}
            placeholder="Short Summary"
            className="w-full p-3 border rounded-lg resize-none"
          />

          <ReactQuill
            theme="snow"
            value={form.content}
            onChange={(value) =>
              setForm(prev => ({ ...prev, content: value }))
            }
          />

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Updating..." : "💾 Update Industry Talk"}
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
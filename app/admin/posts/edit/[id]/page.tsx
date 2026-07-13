"use client"
import Image from "next/image"
import { useEffect, useState, FormEvent, ChangeEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"

/* ================= EDITOR (React 19 SAFE) ================= */
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
})

export default function EditPost() {
  const router = useRouter()
  const { id } = useParams()

  const [form, setForm] = useState({
    title: "",
    slug: "",
    badge: "",
    imageUrl: "",
    excerpt: "",
    content: "",
    authorId: "",
    categoryId: "",

    facebookUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    email: "",
    whatsappNumber: "",
  })

  const [authors, setAuthors] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [uploading, setUploading] = useState(false)

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    async function load() {
      try {
        const [postRes, authorRes, categoryRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authors`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`),
        ])

        const postJson = await postRes.json()
        const post = postJson.data || postJson

        setForm({
          title: post.title || "",
          slug: post.slug || "",
          badge: post.badge || "",
          imageUrl: post.imageUrl || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          authorId: String(post.authorId || post.author?.id || ""),
          categoryId: String(post.categoryId || post.category?.id || ""),

          facebookUrl: post.facebookUrl || "",
          linkedinUrl: post.linkedinUrl || "",
          twitterUrl: post.twitterUrl || "",
          youtubeUrl: post.youtubeUrl || "",
          email: post.email || "",
          whatsappNumber: post.whatsappNumber || "",
        })

        const authorJson = await authorRes.json()
        const categoryJson = await categoryRes.json()

        setAuthors(Array.isArray(authorJson) ? authorJson : authorJson.data || [])
        setCategories(Array.isArray(categoryJson) ? categoryJson : categoryJson.data || [])
      } catch {
        setMessage("❌ Failed to load post")
      }
    }

    if (id) load()
  }, [id])

  /* ================= HANDLERS ================= */
  function handleTitleChange(e: ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
    setForm(prev => ({ ...prev, title, slug }))
  }

  function handleBadgeChange(e: ChangeEvent<HTMLInputElement>) {
  const value = e.target.value
  if (/^[A-Za-z]{0,10}$/.test(value)) {
    setForm(prev => ({ ...prev, badge: value }))
  }
}

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage("⏫ Uploading image...")

    try {
      const fd = new FormData()
      fd.append("image", file)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        { method: "POST", body: fd }
      )

      const data = await res.json()
      if (res.ok) {
        setForm(prev => ({ ...prev, imageUrl: data.imageUrl }))
        setMessage("✅ Image updated")
      } else throw new Error()
    } catch {
      setMessage("❌ Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            authorId: Number(form.authorId),
            categoryId: Number(form.categoryId),
          }),
        }
      )

      if (res.ok) {
        setMessage("✅ Post updated successfully!")
        setTimeout(() => router.push("/admin/posts"), 1200)
      } else {
        setMessage("❌ Update failed")
      }
    } catch {
      setMessage("❌ Network error")
    }
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">✏️ Edit Post</h1>
      {message && <p className="mb-4 text-sm">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded shadow">

        <input
          name="title"
          value={form.title}
          onChange={handleTitleChange}
          placeholder="Title"
          className="w-full p-3 border rounded"
        />

        <input
          name="slug"
          value={form.slug}
          onChange={handleChange}
          placeholder="Slug"
          className="w-full p-3 border rounded"
        />

        <input
        name="badge"
        value={form.badge}
        onChange={handleBadgeChange}
        placeholder="Badge"
        maxLength={10}
        className="w-full p-3 border rounded"
      />

        <input type="file" accept="image/*" onChange={handleFileChange} />
        {form.imageUrl && (
  <div className="relative w-full h-56">
    <Image
      src={form.imageUrl}
      alt="Post"
      fill
      className="rounded object-cover"
      sizes="(max-width: 768px) 100vw, 600px"
    />
  </div>
)}

        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        >
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          name="authorId"
          value={form.authorId}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        >
          <option value="">Select Author</option>
          {authors.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <textarea
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          rows={3}
          placeholder="Excerpt"
          className="w-full p-3 border rounded"
        />

        {/* ================= RICH CONTENT EDITOR ================= */}
        <div>
          <label className="block font-semibold mb-2">Post Content</label>
          <ReactQuill
            theme="snow"
            value={form.content}
            onChange={(value) =>
              setForm(prev => ({ ...prev, content: value }))
            }
            className="bg-white min-h-[300px]"
          />
        </div>

        <h3 className="font-semibold">🔗 Social & Contact</h3>

        <input name="facebookUrl" value={form.facebookUrl} onChange={handleChange} placeholder="Facebook URL" className="w-full p-3 border rounded" />
        <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} placeholder="LinkedIn URL" className="w-full p-3 border rounded" />
        <input name="twitterUrl" value={form.twitterUrl} onChange={handleChange} placeholder="Twitter/X URL" className="w-full p-3 border rounded" />
        <input name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} placeholder="YouTube URL" className="w-full p-3 border rounded" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-3 border rounded" />
        <input name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} placeholder="WhatsApp Number" className="w-full p-3 border rounded" />

        <button
          disabled={uploading}
          className="bg-indigo-600 text-white w-full py-3 rounded font-semibold"
        >
          💾 Update Post
        </button>
      </form>
    </div>
  )
}

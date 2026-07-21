"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import UploadBox from "@/components/UploadBox"
import { useRouter } from "next/navigation"

type Author = {
  id: number
  name: string
}

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

export default function CreateCoverStoryPage() {
  const router = useRouter()

  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    badge: "",
    imageBrief: "",
    keyCategories: "",
    coverImageUrl: "",
    slugImageUrls: [] as string[],
    authorId: "",
  })

  /* ================= FETCH AUTHORS (FIXED) ================= */

  useEffect(() => {
    const token = localStorage.getItem("token")

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/magazines/authors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text()
          console.error("Authors fetch failed:", res.status, body)
          setLoadError(`Authors fetch failed (${res.status}): ${body}`)
          return
        }
        const data = await res.json()
        console.log("Authors loaded:", data)
        setAuthors(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.error("Authors fetch error:", err)
        setLoadError(`Network error: ${err.message}`)
      })
  }, [])

  /* ================= IMAGE UPLOAD ================= */

  async function uploadImage(file: File, field: string) {
    const data = new FormData()
    data.append("image", file)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
      method: "POST",
      body: data,
    })

    const result = await res.json()

    setForm(prev => ({
      ...prev,
      [field]: result.imageUrl,
    }))
  }

  async function uploadExtraImage(file: File) {
    const data = new FormData()
    data.append("image", file)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
      method: "POST",
      body: data,
    })

    const result = await res.json()

    setForm(prev => ({
      ...prev,
      slugImageUrls: [...prev.slugImageUrls, result.imageUrl],
    }))
  }

  function removeImage(index: number) {
    setForm(prev => ({
      ...prev,
      slugImageUrls: prev.slugImageUrls.filter((_, i) => i !== index),
    }))
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    setSubmitError(null)

    // Frontend validation — catch missing required fields before hitting the API
    if (!form.title.trim()) {
      setSubmitError("Title is required.")
      return
    }
    if (!form.fullDescription.trim()) {
      setSubmitError("Full Description is required.")
      return
    }

    setLoading(true)
    const token = localStorage.getItem("token")

    // Convert authorId safely — avoid sending NaN to backend
    const authorIdNum = form.authorId ? Number(form.authorId) : null

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/magazines/cover-stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          authorId: authorIdNum,
        }),
      })

      if (!res.ok) {
        let message = `Request failed (${res.status})`
        try {
          const json = await res.json()
          message = json.error ?? message
        } catch {
          message = (await res.text()) || message
        }
        console.error("Submit failed:", res.status, message)
        setSubmitError(message)
        setLoading(false)
        return
      }

      router.push("/admin/magazines")
    } catch (err: any) {
      console.error("Submit error:", err)
      setSubmitError(`Network error: ${err.message}`)
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-8">
      <h1 className="text-3xl font-bold">Create Cover Story</h1>

      {/* LOAD ERROR */}
      {loadError && (
        <div className="bg-red-50 border border-red-300 text-red-800 text-sm p-3 rounded">
          ⚠️ {loadError}
        </div>
      )}

      {/* TITLE */}
      <input
        placeholder="Title"
        className="w-full border p-3 rounded"
        value={form.title}
        onChange={(e) => {
          const title = e.target.value
          setForm({
            ...form,
            title,
            slug: generateSlug(title),
          })
        }}
      />

      {/* SLUG */}
      <input
        placeholder="Slug"
        className="w-full border p-3 rounded"
        value={form.slug}
        onChange={(e) =>
          setForm({ ...form, slug: e.target.value })
        }
      />

      {/* SHORT DESCRIPTION */}
      <textarea
        placeholder="Short Description"
        className="w-full border p-3 rounded"
        value={form.shortDescription}
        onChange={(e) =>
          setForm({ ...form, shortDescription: e.target.value })
        }
      />

      {/* FULL DESCRIPTION */}
      <textarea
        placeholder="Full Description"
        rows={6}
        className="w-full border p-3 rounded"
        value={form.fullDescription}
        onChange={(e) =>
          setForm({ ...form, fullDescription: e.target.value })
        }
      />

      {/* BADGE */}
      <input
        placeholder="Badge (e.g. Exclusive, New)"
        className="w-full border p-3 rounded"
        value={form.badge}
        onChange={(e) =>
          setForm({ ...form, badge: e.target.value })
        }
      />

      {/* IMAGE BRIEF */}
      <input
        placeholder="Image Brief"
        className="w-full border p-3 rounded"
        value={form.imageBrief}
        onChange={(e) =>
          setForm({ ...form, imageBrief: e.target.value })
        }
      />

      {/* KEY CATEGORIES */}
      <input
        placeholder="Key Categories (comma separated)"
        className="w-full border p-3 rounded"
        value={form.keyCategories}
        onChange={(e) =>
          setForm({ ...form, keyCategories: e.target.value })
        }
      />

      {/* COVER IMAGE */}
      <UploadBox
        label="Cover Image"
        value={form.coverImageUrl}
        onUpload={(file) => uploadImage(file, "coverImageUrl")}
      />

      {/* EXTRA IMAGES */}
      <UploadBox
        label="Additional Images"
        multiple
        onUpload={uploadExtraImage}
      />

      {/* PREVIEW */}
      {form.slugImageUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {form.slugImageUrls.map((img, index) => (
            <div key={index} className="relative">
             <div className="relative w-full h-32">
  <Image
    src={img}
    alt={`Preview ${index + 1}`}
    fill
    className="object-cover rounded border"
    sizes="(max-width: 768px) 100vw, 200px"
  />
</div>
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AUTHOR DROPDOWN (NOW WORKS) */}
      <select
        className="w-full border p-3 rounded"
        value={form.authorId}
        onChange={(e) =>
          setForm({ ...form, authorId: e.target.value })
        }
      >
        <option value="">Select Author</option>
        {authors.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Cover Story"}
      </button>

      {/* SUBMIT ERROR */}
      {submitError && (
        <div className="bg-red-50 border border-red-300 text-red-800 text-sm p-3 rounded">
          ⚠️ {submitError}
        </div>
      )}
    </div>
  )
}

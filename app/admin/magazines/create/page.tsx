"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import UploadBox from "@/components/UploadBox"

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

export default function CreateMagazinePage() {
  const router = useRouter()

  const [authors, setAuthors] = useState<any[]>([])
  const [coverStories, setCoverStories] = useState<any[]>([])

  const [form, setForm] = useState<any>({
    title: "",
    slug: "",
    description: "",
    coverImageUrl: "",
    pdfUrl: "",
    flipbookPages: [],
    authorId: "",
    coverStoryId: "",
  })

  const [loading, setLoading] = useState(false)
  const [uploadingPages, setUploadingPages] = useState(false)

  /* ================= FETCH AUTHORS + COVER STORIES ================= */

  useEffect(() => {
  const token = localStorage.getItem("token")

  async function loadData() {
    const [authorsRes, coverRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/magazines/authors`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/magazines/cover-stories`),
    ])

    const authors = await authorsRes.json()
    const coverStories = await coverRes.json()

    console.log("Authors:", authors)
    console.log("Cover Stories:", coverStories)

    setAuthors(authors)
    setCoverStories(coverStories)
  }

  loadData()
}, [])

  /* ================= FILE UPLOAD ================= */

  async function uploadFile(file: File, field: string) {
  const data = new FormData();

  let endpoint = "/api/upload";

  if (file.type === "application/pdf") {
    endpoint = "/api/upload/document";
    data.append("document", file);   // <-- matches backend
  } else {
    data.append("image", file);      // <-- matches backend
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      method: "POST",
      body: data,
    }
  );

  if (!res.ok) {
    const error = await res.text();
    console.error(error);
    throw new Error(error);
  }

  const result = await res.json();

  setForm((prev: any) => ({
    ...prev,
    [field]:
      result.imageUrl ||
      result.documentUrl,
  }));
}

  /* ================= MULTIPLE PAGE UPLOAD ================= */

  async function uploadFlipbookPage(file: File) {
    const data = new FormData()
    data.append("image", file)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
      method: "POST",
      body: data,
    })

    const result = await res.json()

    setForm((prev: any) => ({
      ...prev,
      flipbookPages: [...(prev.flipbookPages || []), result.imageUrl],
    }))
  }

  function removePage(index: number) {
    setForm((prev: any) => ({
      ...prev,
      flipbookPages: prev.flipbookPages.filter(
        (_: string, i: number) => i !== index
      ),
    }))
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(status: "DRAFT" | "PUBLISHED") {
    setLoading(true)

    const token = localStorage.getItem("token")

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/magazines`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        authorId: Number(form.authorId),
        coverStoryId: Number(form.coverStoryId),
        status,
      }),
    })

    router.push("/admin/magazines")
  }

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-8">
      <h1 className="text-3xl font-bold">Create Magazine</h1>

      {/* TITLE */}
      <input
        placeholder="Title"
        className="w-full border p-3 rounded"
        value={form.title}
        onChange={e => {
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
        onChange={e =>
          setForm({ ...form, slug: e.target.value })
        }
      />

      {/* DESCRIPTION */}
      <textarea
        placeholder="Description"
        className="w-full border p-3 rounded"
        rows={4}
        value={form.description}
        onChange={e =>
          setForm({ ...form, description: e.target.value })
        }
      />

      {/* AUTHOR DROPDOWN */}
      <select
        className="w-full border p-3 rounded"
        value={form.authorId}
        onChange={e =>
          setForm({ ...form, authorId: e.target.value })
        }
      >
        <option value="">Select Author</option>
        {authors.map(a => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      {/* COVER STORY DROPDOWN */}
      <select
        className="w-full border p-3 rounded"
        value={form.coverStoryId}
        onChange={e =>
          setForm({ ...form, coverStoryId: e.target.value })
        }
      >
        <option value="">Select Cover Story</option>
        {coverStories.map(cs => (
          <option key={cs.id} value={cs.id}>
            {cs.title}
          </option>
        ))}
      </select>

      {/* COVER IMAGE */}
      <UploadBox
        label="Cover Image"
        value={form.coverImageUrl}
        height="h-52"
        accept="image/*"
        onUpload={(file) => uploadFile(file, "coverImageUrl")}
      />

      {/* PDF */}
      <UploadBox
        label="Magazine PDF"
        value={form.pdfUrl}
        height="h-40"
        accept="application/pdf"
        onUpload={(file) => uploadFile(file, "pdfUrl")}
      />

      {/* FLIPBOOK PAGES */}
      <UploadBox
        label="Flipbook Pages"
        multiple
        accept="image/*"
        height="h-32"
        onUpload={(file) => uploadFlipbookPage(file)}
      />

      {form.flipbookPages?.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {form.flipbookPages.map((img: string, index: number) => (
            <div key={index} className="relative">
              <img
                src={img}
                className="w-full h-32 object-cover rounded border"
              />
              <button
                onClick={() => removePage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={() => handleSubmit("DRAFT")}
          className="bg-gray-600 text-white px-6 py-2 rounded"
        >
          Save Draft
        </button>

        <button
          onClick={() => handleSubmit("PUBLISHED")}
          className="bg-black text-white px-6 py-2 rounded"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  )
}

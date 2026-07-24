"use client";
import dynamic from "next/dynamic"

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import UploadBox from "@/components/UploadBox"

import "react-quill-new/dist/quill.snow.css"
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })




export default function CreatePost() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    badge: "",
    imageUrl: "",
    excerpt: "",
    content: "",
    authorId: "",
    categoryId: "",

    // ✅ NEW OPTIONAL FIELDS (ADDED ONLY)
    facebookUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    email: "",
    whatsappNumber: "",
  });

  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* ================= FETCH AUTHORS & CATEGORIES ================= */
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authors`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`).then(r => r.json()),
    ])
      .then(([a, c]) => {
        setAuthors(a.data || a);
        setCategories(c.data || c);
      })
      .catch(() => {
        setAuthors([]);
        setCategories([]);
      });
  }, []);

  /* ================= AUTO SLUG ================= */
  function handleTitleChange(e: ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setForm(prev => ({ ...prev, title, slug }));
  }

  function handleChange(
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  /* ================= IMAGE UPLOAD ================= */
async function handleImageUpload(file: File) {
  setUploading(true)
  setMessage("⏫ Uploading image...")

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

    const data = await res.json()
    if (res.ok && data.imageUrl) {
      setForm(prev => ({ ...prev, imageUrl: data.imageUrl }))
      setMessage("✅ Image uploaded successfully!")
    } else {
      throw new Error()
    }
  } catch {
    setMessage("❌ Image upload failed")
  } finally {
    setUploading(false)
  }
}


  /* ================= SUBMIT ================= */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const token = localStorage.getItem("token");

    const excerpt =
      form.excerpt.trim() ||
      form.content.replace(/<[^>]+>/g, "").substring(0, 150) + "...";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...form, // ✅ nothing removed, socials included
          excerpt,
          authorId: Number(form.authorId),
          categoryId: Number(form.categoryId),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMessage("✅ Post created successfully!");
        setForm({
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
        });
      } else {
        setMessage(`❌ ${data?.error || "Something went wrong"}`);
      }
    } catch {
      setLoading(false);
      setMessage("❌ Network error");
    }
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8 text-center">
          📝 Create New Post
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

          {/* BADGE */}
          <input
            type="text"
            name="badge"
            value={form.badge}
            onChange={handleChange}
            placeholder="Badge (FEATURED, WEBINAR, EVENT)"
            className="w-full p-3 border rounded-lg"
          />

         {/* IMAGE */}
<UploadBox
  label="Featured Image"
  value={form.imageUrl}
  onUpload={handleImageUpload}
  // height="h-64"
/>


          {/* CATEGORY */}
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

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
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {/* EXCERPT */}
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={3}
            placeholder="Short summary"
            className="w-full p-3 border rounded-lg"
          />

         {/* CONTENT */}
<div>
  <label className="block font-semibold mb-2">
    Post Content
  </label>

  <ReactQuill
    theme="snow"
    value={form.content}
    onChange={(value) =>
      setForm(prev => ({ ...prev, content: value }))
    }
    className="bg-white"
  />
</div>


          {/* SOCIAL / CONTACT */}
          <h3 className="font-bold text-lg">🔗 Social & Contact (Optional)</h3>

          <input name="facebookUrl" value={form.facebookUrl} onChange={handleChange} placeholder="Facebook URL" className="w-full p-3 border rounded-lg" />
          <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} placeholder="LinkedIn URL" className="w-full p-3 border rounded-lg" />
          <input name="twitterUrl" value={form.twitterUrl} onChange={handleChange} placeholder="Twitter/X URL" className="w-full p-3 border rounded-lg" />
          <input name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} placeholder="YouTube URL" className="w-full p-3 border rounded-lg" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Contact Email" className="w-full p-3 border rounded-lg" />
          <input name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} placeholder="WhatsApp Number" className="w-full p-3 border rounded-lg" />

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Creating..." : "🚀 Create Post"}
          </button>

          {message && (
            <p className="text-center text-sm mt-2">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

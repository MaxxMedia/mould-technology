// app/admin/posts/create/page.tsx
"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import ContentPackageSelect from "@/components/packages/ContentPackageSelect";
import UploadBox from "@/components/UploadBox";
import PostBuilder from "@/app/admin/components/PostBuilder";
import { ContentBlock } from "@/app/admin/components/types";

export default function CreatePost() {
  const router = useRouter();
  
  const [form, setForm] = useState<{
    title: string;
    slug: string;
    badge: string;
    imageUrl: string;
    excerpt: string;
    content: string;
    contentBlocks: ContentBlock[];
    authorId: string;
    categoryId: string;
    facebookUrl: string;
    linkedinUrl: string;
    twitterUrl: string;
    youtubeUrl: string;
    email: string;
    whatsappNumber: string;
  }>({
    title: "",
    slug: "",
    badge: "",
    imageUrl: "",
    excerpt: "",
    content: "",
    contentBlocks: [],
    authorId: "",
    categoryId: "",
    facebookUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    email: "",
    whatsappNumber: "",
  });

  const [packagePurchaseId, setPackagePurchaseId] = useState<number | null>(null);
  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* ================= FETCH AUTHORS & CATEGORIES ================= */
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authors`).then((r) =>
        r.json()
      ),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`).then((r) =>
        r.json()
      ),
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
    setForm((prev) => ({ ...prev, title, slug }));
  }

  function handleChange(
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /* ================= IMAGE UPLOAD ================= */
  async function handleImageUpload(file: File) {
    setUploading(true);
    setMessage("⏫ Uploading image...");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
        setMessage("✅ Image uploaded successfully!");
      } else {
        throw new Error();
      }
    } catch {
      setMessage("❌ Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const token = localStorage.getItem("token");

    // Generate excerpt from content blocks if no excerpt provided
    let excerpt = form.excerpt.trim();
    if (!excerpt && form.contentBlocks.length > 0) {
      // Try to get text from first paragraph block
      const firstParagraph = form.contentBlocks.find(
        (block) => block.type === "paragraph"
      ) as any;
      if (firstParagraph?.content) {
        excerpt = firstParagraph.content
          .replace(/<[^>]+>/g, "")
          .substring(0, 150) + "...";
      }
    } else if (!excerpt) {
      excerpt = form.content.replace(/<[^>]+>/g, "").substring(0, 150) + "...";
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
          packagePurchaseId,
          excerpt,
          contentBlocks: form.contentBlocks,
          authorId: Number(form.authorId),
          categoryId: Number(form.categoryId),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMessage("✅ Post created successfully!");
        // Reset form
        setForm({
          title: "",
          slug: "",
          badge: "",
          imageUrl: "",
          excerpt: "",
          content: "",
          contentBlocks: [],
          authorId: "",
          categoryId: "",
          facebookUrl: "",
          linkedinUrl: "",
          twitterUrl: "",
          youtubeUrl: "",
          email: "",
          whatsappNumber: "",
        });
        // Redirect to posts list after 2 seconds
        setTimeout(() => {
          router.push("/admin/posts");
        }, 2000);
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
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">
            📝 Create New Post
          </h1>
          <button
            onClick={() => router.push("/admin/posts")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Posts
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        <ContentPackageSelect type="SPONSORED" value={packagePurchaseId} onChange={setPackagePurchaseId} />
          {/* TITLE */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleTitleChange}
              required
              placeholder="Enter post title"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* SLUG */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              placeholder="post-url-slug"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly version of the title (auto-generated)
            </p>
          </div>

          {/* BADGE */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Badge
            </label>
            <input
              type="text"
              name="badge"
              value={form.badge}
              onChange={handleChange}
              placeholder="FEATURED, WEBINAR, EVENT"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* IMAGE */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <UploadBox
              label="Upload featured image"
              value={form.imageUrl}
              onUpload={handleImageUpload}
              accept="image/*"
              height="h-64"
              uploadType="image"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* AUTHOR */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Author <span className="text-red-500">*</span>
            </label>
            <select
              name="authorId"
              value={form.authorId}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select author</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* EXCERPT */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={3}
              placeholder="Short summary (optional - auto-generated from content)"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* CONTENT */}
          <div>
            <label className="block font-semibold text-gray-700 mb-4">
              Content <span className="text-red-500">*</span>
            </label>
            <PostBuilder
              value={form.contentBlocks}
              onChange={(blocks) =>
                setForm((prev) => ({
                  ...prev,
                  contentBlocks: blocks,
                }))
              }
            />
          </div>

          {/* SOCIAL / CONTACT */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">
              🔗 Social & Contact (Optional)
            </h3>
            <div className="space-y-3">
              <input
                name="facebookUrl"
                value={form.facebookUrl}
                onChange={handleChange}
                placeholder="Facebook URL"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                name="linkedinUrl"
                value={form.linkedinUrl}
                onChange={handleChange}
                placeholder="LinkedIn URL"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                name="twitterUrl"
                value={form.twitterUrl}
                onChange={handleChange}
                placeholder="Twitter/X URL"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                name="youtubeUrl"
                value={form.youtubeUrl}
                onChange={handleChange}
                placeholder="YouTube URL"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Contact Email"
                type="email"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                name="whatsappNumber"
                value={form.whatsappNumber}
                onChange={handleChange}
                placeholder="WhatsApp Number (e.g., +1234567890)"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              "🚀 Create Post"
            )}
          </button>

          {/* MESSAGE */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes("✅") 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              <p className="text-center text-sm">{message}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
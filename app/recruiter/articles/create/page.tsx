"use client";

import ContentSubmissionPolicy from "@/components/ContentSubmissionPolicy";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UploadBox from "@/components/UploadBox";
import {
  fetchArticlePostingEligibility,
  type ContentLimitEligibility,
} from "@/lib/packageLimits";

export default function CreateRecruiterArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [badge, setBadge] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eligibility, setEligibility] =
    useState<ContentLimitEligibility | null>(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  useEffect(() => {
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

    async function loadEligibility() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await fetchArticlePostingEligibility(token);
        setEligibility(data);
      } catch (err) {
        console.error("Eligibility Error:", err);

      }
    }

    loadEligibility();
  }, []);

  /* ================= IMAGE UPLOAD ================= */

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/upload`;

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      console.log("Upload URL:", url);
      console.log("Upload Status:", res.status);
      console.log(
        "Upload Content-Type:",
        res.headers.get("content-type")
      );

      const text = await res.text();

      console.log("Upload Response:", text);

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`);
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Upload endpoint returned HTML instead of JSON.");
      }

      setImageUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/recruiter/articles`;

      const res = await fetch(url, {
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
          badge: badge.trim() || null,
        }),
      });

      console.log("Article URL:", url);
      console.log("Article Status:", res.status);
      console.log(
        "Article Content-Type:",
        res.headers.get("content-type")
      );

      const text = await res.text();

      console.log("Article Response:", text);

      if (!res.ok) {
        try {
          const json = JSON.parse(text);
          throw new Error(json.error || "Failed to create article");
        } catch {
          throw new Error(
            `Expected JSON but received HTML.\n\n${text.substring(0, 200)}`
          );
        }
      }

      router.push("/recruiter/articles");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">
        Create Article
      </h1>

      {eligibility && !eligibility.canCreate && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>{eligibility.message}</p>

          <Link
            href="/packages"
            className="mt-2 inline-block font-medium text-[#004d73] hover:underline"
          >
            View packages →
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded bg-red-50 border border-red-200 p-3 text-red-600 whitespace-pre-wrap">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Article title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Short excerpt"
          className="w-full border p-2 rounded"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />

        <textarea
          placeholder="Article content"
          className="w-full border p-2 rounded h-48"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Badge (optional) e.g. FEATURED, TRENDING"
          className="w-full border p-2 rounded"
          value={badge}
          onChange={(e) =>
            setBadge(e.target.value.toUpperCase())
          }
        />

        <UploadBox
          label="Article Image"
          value={imageUrl}
          height="h-52"
          accept="image/*"
          onUpload={handleImageUpload}
        />

        {uploading && (
          <p className="text-sm text-gray-500">
            Uploading image...
          </p>
        )}

        <ContentSubmissionPolicy
          checked={acceptedPolicy}
          onChange={setAcceptedPolicy}
        />

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={
              loading ||
              uploading ||
              !acceptedPolicy ||
              eligibility?.canCreate === false
            }
            className="w-full max-w-[220px] rounded bg-black px-6 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>
    </div>
  );
}
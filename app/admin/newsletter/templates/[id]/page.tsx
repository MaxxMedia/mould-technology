"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditTemplatePage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    content: "",
  });

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  async function loadTemplate() {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/templates/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        throw new Error(data.error || "Template not found");
      }

      const data = await res.json();
      setForm({
        name: data.name || "",
        subject: data.subject || "",
        content: data.content || "",
      });
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
      router.push("/admin/newsletter/templates");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function updateTemplate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/templates/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      alert("Template updated successfully");
      router.push("/admin/newsletter/templates");
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate() {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/templates/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      alert("Template deleted successfully");
      router.push("/admin/newsletter/templates");
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading template...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Edit Template</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={updateTemplate} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Template Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg h-11 px-4"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Email Subject</label>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full border rounded-lg h-11 px-4"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Email Content (HTML)</label>
          <textarea
            rows={14}
            name="content"
            value={form.content}
            onChange={handleChange}
            className="w-full border rounded-lg p-4 font-mono text-sm"
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            You can use HTML tags for formatting.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Template"}
          </button>

          <button
            type="button"
            onClick={deleteTemplate}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="border px-6 py-3 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";
import { useState } from "react";
import Image from "next/image";
import { User, Upload } from "lucide-react";

export default function CreateAuthor() {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    avatarUrl: "",
  });
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const result = await res.json();
      setForm(prev => ({ ...prev, avatarUrl: result.imageUrl }));
    } catch (err: any) {
      setMessage(`❌ Image upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("✅ Author created successfully!");
        setForm({ name: "", bio: "", avatarUrl: "" });
      } else {
        const error = await res.json();
        setMessage(`❌ Failed: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      setMessage("❌ Network error, please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Author</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Author Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="bio"
          placeholder="Author Bio"
          value={form.bio}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={3}
        />
        {/* AVATAR UPLOAD */}
        <div className="flex flex-col items-center gap-2">
          <label className="cursor-pointer group relative">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e => {
                if (e.target.files?.[0]) handleAvatarUpload(e.target.files[0]);
              }}
            />
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50 group-hover:border-blue-500 transition relative">
              {form.avatarUrl ? (
                <Image
                  src={form.avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : uploading ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <User size={32} className="text-gray-400" />
              )}
              {!uploading && (
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded-full">
                  <Upload size={18} className="text-white" />
                </div>
              )}
            </div>
          </label>
          <p className="text-xs text-gray-500">
            {form.avatarUrl ? "Click to replace photo" : "Click to upload avatar"}
          </p>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Author
        </button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}

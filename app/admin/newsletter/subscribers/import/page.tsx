"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportSubscribersPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    setError(null);

    try {
      setUploading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribers/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      alert(`${data.imported || data.count || 0} subscribers imported successfully.`);
      router.push("/admin/newsletter/subscribers");
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Import Subscribers</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="border rounded-xl p-6 bg-white space-y-6">
        <div>
          <p className="font-semibold">CSV Format</p>
          <div className="mt-3 rounded-lg bg-gray-100 p-4 text-sm font-mono">
            name,email,phone,frequency
            <br />
            John Doe,john@gmail.com,9876543210,MONTHLY
            <br />
            Jane,jane@gmail.com,,WEEKLY
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Note: Fields should match: name, email, phone, frequency
          </p>
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="rounded-lg border p-4 bg-gray-50">
            <p className="font-medium">Selected File</p>
            <p className="text-gray-500 text-sm">{file.name}</p>
            <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={upload}
            disabled={uploading || !file}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Importing..." : "Import Subscribers"}
          </button>
          <button
            onClick={() => router.back()}
            className="border px-6 py-3 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
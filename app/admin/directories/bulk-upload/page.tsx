// app/admin/directories/bulk-upload/page.tsx

"use client"

import { useState } from "react"
import BulkImportUserList from "@/components/admin/BulkImportUserList"

type BulkUploadRow = {
  row?: number
  companyName?: string
  email: string
  error?: string
  reason?: string
}

type BulkUploadResult = {
  total: number
  successCount: number
  failedCount: number
  skippedCount?: number
  failed: BulkUploadRow[]
  skipped?: BulkUploadRow[]
}

export default function BulkDirectoryUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BulkUploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an Excel file.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      setLoading(true)
      setResult(null)
      setError(null)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-full-setup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setResult(data)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      setError(null)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bulk-full-setup/template`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error("Failed to download template")
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "bulk_supplier_template.xlsx"
      document.body.appendChild(a)
      a.click()
      a.remove()

    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="p-10 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        Bulk Supplier Directory Upload
      </h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-6">
        <button
          onClick={handleDownloadTemplate}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          📥 Download Excel Template
        </button>

        <p className="text-sm text-gray-600">
          Rows with an existing supplier company name or user email are skipped.
          Company names are compared without regard to case or surrounding spaces.
        </p>

        <input
          type="file"
          accept=".xlsx"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
          className="border p-2 rounded w-full"
        />

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-purple-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Uploading..." : "📤 Upload Excel"}
        </button>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
            <p><strong>Total:</strong> {result.total}</p>
            <p className="text-green-600">
              <strong>✅ Success:</strong> {result.successCount}
            </p>
            <p className="text-red-600">
              <strong>❌ Failed:</strong> {result.failedCount}
            </p>

            <p className="text-amber-700">
              <strong>Skipped:</strong> {result.skippedCount ?? 0}
            </p>

            {!!result.skipped?.length && (
              <div className="mt-3">
                <p className="font-semibold mb-2">Skipped Rows:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {result.skipped.map((item, index) => (
                    <li key={index}>
                      Row {item.row}: {item.companyName} ({item.email}) - {item.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.failed?.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold mb-2">Failed Rows:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {result.failed.map((item, index) => (
                    <li key={index}>
                      {item.email} — {item.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ User List with Send Email buttons */}
      <div className="mt-8">
        <BulkImportUserList />
      </div>
    </div>
  )
}


// components/UploadBox.tsx
"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"

interface UploadBoxProps {
  label: string
  value?: string
  onUpload: (file: File) => Promise<void>
  accept?: string
  className?: string
  height?: string // Added height prop support
}

export default function UploadBox({
  label,
  value,
  onUpload,
  accept = "image/*,application/pdf",
  className = "",
  height = "aspect-video" // Default height
}: UploadBoxProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string>(value || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type against accept prop
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('/*')) {
          const category = type.split('/')[0]
          return file.type.startsWith(category + '/')
        }
        return file.type === type
      })

      if (!isValidType) {
        alert(`Please upload a valid file type: ${accept}`)
        return
      }
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    setIsUploading(true)

    try {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }

      await onUpload(file)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload file")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    setPreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {preview ? (
        <div className="relative group">
          {preview.startsWith("data:image") || preview.match(/\.(jpeg|jpg|png|webp)$/i) ? (
            <div className={`relative w-full ${height} rounded-lg border border-gray-200 overflow-hidden bg-gray-50`}>
              <Image
                src={preview}
                alt="Upload preview"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-700 truncate flex-1">
                {preview.split("/").pop() || "Uploaded file"}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center w-full ${height} border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100`}
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center px-4">
            {label}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="text-sm text-gray-600">Uploading...</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
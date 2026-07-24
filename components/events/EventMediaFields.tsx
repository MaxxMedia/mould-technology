"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, X, Loader2 } from "lucide-react"

type ImageItem = {
    id: string
    previewUrl: string
    uploadedUrl: string | null
    uploading: boolean
    error: string | null
}

type VideoItem = {
    id: string
    url: string
    error: string | null
}

function genId() {
    return Math.random().toString(36).slice(2, 10)
}

function getYoutubeId(url: string): string | null {
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    )
    return match ? match[1] : null
}

async function uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("image", file) // ✅ matches backend's uploadImage.single("image")

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ was missing
        },
        body: formData,
    })

    if (!res.ok) {
        const text = await res.text()
        console.error("Gallery image upload failed:", text)
        throw new Error("Upload failed")
    }

    const data = await res.json()
    return data.imageUrl as string // ✅ backend returns { imageUrl }, not { url }
}

export default function EventMediaFields({
    initialImages = [],
    initialVideos = [],
    onImagesChange,
    onVideosChange,
}: {
    initialImages?: string[]
    initialVideos?: string[]
    onImagesChange?: (urls: string[]) => void
    onVideosChange?: (urls: string[]) => void
}) {
    const [images, setImages] = useState<ImageItem[]>(() =>
        initialImages.map(url => ({
            id: genId(),
            previewUrl: url,
            uploadedUrl: url,
            uploading: false,
            error: null,
        }))
    )
    const [videos, setVideos] = useState<VideoItem[]>(() =>
        initialVideos.length > 0
            ? initialVideos.map(url => ({ id: genId(), url, error: null }))
            : [{ id: genId(), url: "", error: null }]
    )

    // ✅ FIX: notify the parent (Formik's setFieldValue) from an effect that
    // runs AFTER render commits, never from inside a setState updater or
    // directly during render. This is what was causing:
    // "Cannot update a component (Formik) while rendering a different
    // component (EventMediaFields)."
    useEffect(() => {
        onImagesChange?.(
            images.filter(i => i.uploadedUrl).map(i => i.uploadedUrl as string)
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [images])

    useEffect(() => {
        onVideosChange?.(
            videos.filter(v => v.url.trim() && !v.error).map(v => v.url.trim())
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videos])

    // ---------- IMAGE GALLERY ----------
    const handleFilesSelected = async (files: FileList | null) => {
        if (!files || files.length === 0) return

        const newItems: ImageItem[] = Array.from(files).map(file => ({
            id: genId(),
            previewUrl: URL.createObjectURL(file),
            uploadedUrl: null,
            uploading: true,
            error: null,
        }))

        setImages(prev => [...prev, ...newItems])

        await Promise.all(
            Array.from(files).map(async (file, idx) => {
                const item = newItems[idx]
                try {
                    const url = await uploadFile(file)
                    setImages(prev =>
                        prev.map(i =>
                            i.id === item.id ? { ...i, uploadedUrl: url, uploading: false } : i
                        )
                    )
                } catch {
                    setImages(prev =>
                        prev.map(i =>
                            i.id === item.id
                                ? { ...i, uploading: false, error: "Upload failed. Try again." }
                                : i
                        )
                    )
                }
            })
        )
    }

    const removeImage = (id: string) => {
        setImages(prev => prev.filter(i => i.id !== id))
    }

    // ---------- VIDEO GALLERY ----------
    const updateVideoUrl = (id: string, url: string) => {
        setVideos(prev =>
            prev.map(v => {
                if (v.id !== id) return v
                const valid = url.trim() === "" || getYoutubeId(url) !== null
                return { ...v, url, error: valid ? null : "Enter a valid YouTube URL" }
            })
        )
    }

    const addVideoField = () => {
        setVideos(prev => [...prev, { id: genId(), url: "", error: null }])
    }

    const removeVideoField = (id: string) => {
        setVideos(prev => (prev.length === 1 ? prev : prev.filter(v => v.id !== id)))
    }

    return (
        <div className="space-y-8">
            {/* ================= IMAGE GALLERY ================= */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">Images Gallery</h3>
                    <label className="flex items-center gap-1 text-xs font-medium text-red-600 border border-red-500 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-red-50">
                        <Plus size={14} />
                        Add Images
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => {
                                handleFilesSelected(e.target.files)
                                e.target.value = ""
                            }}
                        />
                    </label>
                </div>

                {images.length === 0 ? (
                    <p className="text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg py-6 text-center">
                        No images added yet. Click "Add Images" to upload from your device.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {images.map(img => (
                            <div
                                key={img.id}
                                className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                            >
                                <Image src={img.previewUrl} alt="" fill className="object-cover" unoptimized />

                                {img.uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader2 size={18} className="text-white animate-spin" />
                                    </div>
                                )}

                                {img.error && (
                                    <div className="absolute inset-x-0 bottom-0 bg-red-600/90 text-white text-[10px] px-1.5 py-1 text-center">
                                        {img.error}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => removeImage(img.id)}
                                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white w-6 h-6 rounded-full flex items-center justify-center"
                                    aria-label="Remove image"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ================= VIDEO GALLERY ================= */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">Video Gallery (YouTube)</h3>
                </div>

                <div className="space-y-3">
                    {videos.map(video => {
                        const ytId = getYoutubeId(video.url)
                        return (
                            <div key={video.id} className="flex items-start gap-3">
                                {ytId ? (
                                    <div className="relative w-24 h-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                        <Image
                                            src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                                            alt=""
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-14 flex-shrink-0 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 text-center px-1">
                                        No preview
                                    </div>
                                )}

                                <div className="flex-1">
                                    <input
                                        type="url"
                                        placeholder="Paste YouTube video URL"
                                        value={video.url}
                                        onChange={e => updateVideoUrl(video.id, e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {video.error && (
                                        <p className="text-xs text-red-600 mt-1">{video.error}</p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeVideoField(video.id)}
                                    disabled={videos.length === 1}
                                    className="mt-2 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                    aria-label="Remove video field"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )
                    })}
                </div>

                <button
                    type="button"
                    onClick={addVideoField}
                    className="mt-3 flex items-center gap-1 text-xs font-medium text-red-600 border border-red-500 rounded-lg px-3 py-1.5 hover:bg-red-50"
                >
                    <Plus size={14} />
                    Add Another Video
                </button>
            </div>
        </div>
    )
}
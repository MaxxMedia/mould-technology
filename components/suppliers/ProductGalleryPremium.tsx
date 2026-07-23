"use client"

import { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from "lucide-react"

type GalleryItem = {
  image: string
  name?: string
  description?: string
}

type Props = {
  images: GalleryItem[] | string[]
}

function getGalleryImage(item: any): string {
  if (typeof item === 'string') return item
  return item?.image || ''
}

function getGalleryName(item: any): string {
  if (typeof item === 'string') return ''
  return item?.name || ''
}

function getGalleryDescription(item: any): string {
  if (typeof item === 'string') return ''
  return item?.description || ''
}

export default function ProductGalleryPremium({ images }: Props) {
  const gallery = images
    .filter(Boolean)
    .map(item => {
      if (typeof item === 'string') {
        return { image: item, name: '', description: '' }
      }
      return {
        image: item?.image || '',
        name: item?.name || '',
        description: item?.description || ''
      }
    })
    .filter(item => item.image && item.image.trim().length > 0)

  const [selected, setSelected] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!fullscreen) return
      if (e.key === "Escape") setFullscreen(false)
      if (e.key === "ArrowLeft") {
        setSelected((prev) => prev === 0 ? gallery.length - 1 : prev - 1)
      }
      if (e.key === "ArrowRight") {
        setSelected((prev) => prev === gallery.length - 1 ? 0 : prev + 1)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [fullscreen, gallery.length])

  useEffect(() => {
    setSelected(0)
  }, [gallery.length])

  if (gallery.length === 0) {
    return (
      <div className="h-80 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
        No Product Images Available
      </div>
    )
  }

  const prev = () => {
    setSelected((prev) => prev === 0 ? gallery.length - 1 : prev - 1)
  }

  const next = () => {
    setSelected((prev) => prev === gallery.length - 1 ? 0 : prev + 1)
  }

  const currentItem = gallery[selected]

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#0b3954]">Product Gallery</h2>
            <p className="text-gray-500 mt-1">Image {selected + 1} of {gallery.length}</p>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-[110px_1fr] gap-6">
          {/* Thumbnails */}
          <div className="order-2 lg:order-1">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] pr-2">
              {gallery.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(index)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${selected === index
                      ? "border-red-600 shadow-lg scale-105"
                      : "border-gray-200 hover:border-gray-400"
                    }`}
                >
                  <img
                    src={item.image}
                    alt={item.name || `Product ${index + 1}`}
                    className="w-24 h-24 object-cover hover:scale-110 transition duration-300"
                  />
                  {item.name && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate text-center">
                      {item.name}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Image */}
          <div className="order-1 lg:order-2">
            <div className="relative group">
              <div className="overflow-hidden rounded-3xl bg-gray-100 border">
                <img
                  src={currentItem.image}
                  onClick={() => setFullscreen(true)}
                  className="w-full h-[600px] object-contain cursor-pointer transition duration-500 group-hover:scale-105"
                  alt={currentItem.name || `Product ${selected + 1}`}
                />
              </div>

              {/* Overlay */}
              <div
                onClick={() => setFullscreen(true)}
                className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/25 transition duration-300 flex items-center justify-center cursor-pointer"
              >
                <div className="opacity-0 group-hover:opacity-100 transition duration-300 bg-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-medium">
                  <ZoomIn size={18} />
                  View Full Image
                </div>
              </div>

              {/* Navigation */}
              {gallery.length > 1 && (
                <button
                  onClick={prev}
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-100 transition"
                >
                  <ChevronLeft className="mx-auto" />
                </button>
              )}
              {gallery.length > 1 && (
                <button
                  onClick={next}
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-100 transition"
                >
                  <ChevronRight className="mx-auto" />
                </button>
              )}
            </div>

            {/* Product Details */}
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {currentItem.name ? (
                <h3 className="text-lg font-semibold text-gray-800">{currentItem.name}</h3>
              ) : (
                <p className="text-sm text-gray-400 italic">No name provided</p>
              )}
              {currentItem.description ? (
                <p className="text-sm text-gray-600 mt-1">{currentItem.description}</p>
              ) : (
                <p className="text-sm text-gray-400 italic mt-1">No description provided</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Viewer */}
      {fullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="mx-auto" />
          </button>

          {gallery.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <ChevronLeft className="mx-auto" size={34} />
            </button>
          )}

          <div className="flex flex-col items-center max-w-[92vw] max-h-[90vh]">
            <img
              src={currentItem.image}
              alt={currentItem.name || `Product ${selected + 1}`}
              className="max-w-[92vw] max-h-[70vh] object-contain"
            />
            <div className="mt-6 text-center max-w-2xl">
              {currentItem.name ? (
                <h3 className="text-white font-semibold text-2xl">{currentItem.name}</h3>
              ) : (
                <p className="text-gray-400 italic">No name provided</p>
              )}
              {currentItem.description ? (
                <p className="text-gray-300 text-sm mt-2">{currentItem.description}</p>
              ) : (
                <p className="text-gray-500 italic text-sm mt-2">No description provided</p>
              )}
            </div>
          </div>

          {gallery.length > 1 && (
            <button
              onClick={next}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <ChevronRight className="mx-auto" size={34} />
            </button>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-5 py-2 rounded-full text-sm font-medium">
            {selected + 1} / {gallery.length}
          </div>
        </div>
      )}
    </>
  )
}
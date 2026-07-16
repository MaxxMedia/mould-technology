"use client"

import { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from "lucide-react"

type Props = {
  images: string[]
}

export default function ProductGalleryPremium({ images }: Props) {
  const gallery = images.filter(Boolean)

  const [selected, setSelected] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!fullscreen) return

      if (e.key === "Escape") setFullscreen(false)

      if (e.key === "ArrowLeft") {
        setSelected((prev) =>
          prev === 0 ? gallery.length - 1 : prev - 1
        )
      }

      if (e.key === "ArrowRight") {
        setSelected((prev) =>
          prev === gallery.length - 1 ? 0 : prev + 1
        )
      }
    }

    window.addEventListener("keydown", handleKey)

    return () => window.removeEventListener("keydown", handleKey)
  }, [fullscreen, gallery.length])

  if (gallery.length === 0) {
    return (
      <div className="h-80 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
        No Product Images Available
      </div>
    )
  }

  const prev = () => {
    setSelected((prev) =>
      prev === 0 ? gallery.length - 1 : prev - 1
    )
  }

  const next = () => {
    setSelected((prev) =>
      prev === gallery.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h2 className="text-2xl font-bold text-[#0b3954]">
              Product Gallery
            </h2>

            <p className="text-gray-500 mt-1">
              Image {selected + 1} of {gallery.length}
            </p>

          </div>

        </div>

        {/* Gallery */}

        <div className="grid grid-cols-1 lg:grid-cols-[110px_1fr] gap-6">

          {/* LEFT THUMBNAILS */}

          <div className="order-2 lg:order-1">

            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] pr-2">

              {gallery.map((img, index) => (

                <button
                  key={index}
                  onClick={() => setSelected(index)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0

                  ${
                    selected === index
                      ? "border-red-600 shadow-lg scale-105"
                      : "border-gray-200 hover:border-gray-400"
                  }

                  `}
                >

                  <img
                    src={img}
                    className="w-24 h-24 object-cover hover:scale-110 transition duration-300"
                  />

                </button>

              ))}

            </div>

          </div>

          {/* MAIN IMAGE */}

          <div className="order-1 lg:order-2">

            <div className="relative group">

              <div className="overflow-hidden rounded-3xl bg-gray-100 border">

                <img
                  src={gallery[selected]}
                  onClick={() => setFullscreen(true)}
                  className="w-full h-[600px] object-contain cursor-pointer transition duration-500 group-hover:scale-105"
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

              {/* Previous */}

              {gallery.length > 1 && (

                <button
                  onClick={prev}
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-100 transition"
                >

                  <ChevronLeft className="mx-auto" />

                </button>

              )}

              {/* Next */}

              {gallery.length > 1 && (

                <button
                  onClick={next}
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-100 transition"
                >

                  <ChevronRight className="mx-auto" />

                </button>

              )}

            </div>

          </div>

        </div>

      </div>
            {/* FULLSCREEN VIEWER */}

      {fullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center">

          {/* Close */}

          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="mx-auto" />
          </button>

          {/* Previous */}

          {gallery.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <ChevronLeft className="mx-auto" size={34} />
            </button>
          )}

          {/* Image */}

          <img
            src={gallery[selected]}
            alt={`Product ${selected + 1}`}
            className="max-w-[92vw] max-h-[90vh] object-contain"
          />

          {/* Next */}

          {gallery.length > 1 && (
            <button
              onClick={next}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <ChevronRight className="mx-auto" size={34} />
            </button>
          )}

          {/* Counter */}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-5 py-2 rounded-full text-sm font-medium">
            {selected + 1} / {gallery.length}
          </div>

        </div>
      )}
    </>
  )
}
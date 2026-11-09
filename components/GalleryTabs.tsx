// components/GalleryTabs.tsx
"use client"

import { useState } from "react"
import VideoGallery from "./VideoGallery"
import SupplierTeamTab from "./SupplierTeamTab"
import { FileText, Download, Eye, X, ChevronUp, ChevronDown, PlayCircle } from "lucide-react"
import ProductGalleryPremium from "../components/suppliers/ProductGalleryPremium"
import SplitGallerySection, { SectionItem } from "../components/suppliers/SplitGallerySection"

type GalleryItem = {
  image: string
  name?: string
  description?: string
}

type GalleryTabsProps = {
  videoGallery?: string[]
  productGallery?: GalleryItem[] | string[]
  companyGallery?: GalleryItem[] | string[]
  factoryGallery?: GalleryItem[] | string[]
  productCatalogues?: string[]
  isPaid?: boolean
  companySlug?: string
  companyIntro?: { heading: string; description?: string; ctaLabel?: string; ctaHref?: string }
  industryIntro?: { heading: string; description?: string; ctaLabel?: string; ctaHref?: string }

  companyBrochure?: string[]
  manufacturingCapabilities?: string | null
  manufacturingCapabilityImages?: string[]
  manufacturingCapabilityVideos?: string[]
  machineryList?: string | null
  machineryImages?: string[]
  qualityStandards?: string | null // kept for prop compatibility; intentionally never rendered
}

const GALLERY_UNAVAILABLE_MESSAGE =
  "Gallery content is not available at this time."

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-72 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-center px-6">
      {message}
    </div>
  )
}

function hasGalleryItems(gallery: any[] | undefined): boolean {
  if (!gallery || !Array.isArray(gallery)) return false
  return gallery.some(item => {
    if (typeof item === 'string') return item.trim().length > 0
    return item && item.image && item.image.trim().length > 0
  })
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

function toSectionItems(gallery: any[] | undefined): SectionItem[] {
  if (!gallery || !Array.isArray(gallery)) return []
  return gallery
    .filter(item => {
      if (typeof item === 'string') return item.trim().length > 0
      return item && item.image && item.image.trim().length > 0
    })
    .map(item => ({
      image: getGalleryImage(item),
      name: getGalleryName(item),
      description: getGalleryDescription(item),
    }))
}

function toEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`

  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return url
}

/**
 * Extracts a real thumbnail image for a video URL. Currently supports
 * YouTube (via img.youtube.com). Returns an empty string for
 * unsupported hosts (Vimeo, direct files, etc.) so the caller can
 * fall back to a placeholder.
 */
function getVideoThumbnail(url: string): string {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/)
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`
  return ""
}

/**
 * Downloads a file by fetching it as a blob and triggering a save
 * dialog, instead of just navigating to the URL (which would open it
 * in-browser for PDFs). Falls back to opening in a new tab if the
 * fetch fails (e.g. CORS-restricted host).
 */
async function downloadFile(url: string, filename?: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)

    const defaultName = filename || decodeURIComponent(url.split('/').pop() || 'document')
    link.download = defaultName

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => URL.revokeObjectURL(link.href), 100)
  } catch (error) {
    console.error('Download error:', error)
    window.open(url, '_blank')
  }
}

/**
 * Pulls individual items out of a machinery-list HTML blob (from a rich
 * text editor). Prefers <li> items; falls back to splitting on line
 * breaks/paragraphs if the content isn't a list. Returns plain strings.
 */
function parseListItems(html: string): string[] {
  if (typeof window === "undefined" || !html) return []
  try {
    const doc = new DOMParser().parseFromString(html, "text/html")
    const liEls = Array.from(doc.querySelectorAll("li"))
    if (liEls.length > 0) {
      return liEls
        .map((li) => (li.textContent || "").trim())
        .filter(Boolean)
    }

    const blockEls = Array.from(doc.querySelectorAll("p, div"))
    if (blockEls.length > 1) {
      return blockEls
        .map((el) => (el.textContent || "").trim())
        .filter(Boolean)
    }

    const text = (doc.body.textContent || "").trim()
    return text
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

/**
 * Renders machinery list content as a numbered 3-per-row grid instead
 * of a raw HTML dump. Falls back to the original rich-text render if
 * the content can't be split into distinct items.
 */
function MachineryListGrid({ html }: { html: string }) {
  const items = parseListItems(html)

  if (items.length === 0) {
    return (
      <div
        className="prose prose-sm max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-semibold shrink-0">
            {i + 1}
          </span>
          <span className="text-sm text-gray-700 leading-snug">{item}</span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Small popup lightbox for image cards OUTSIDE the product/company/   */
/* factory gallery components — used for Manufacturing & Machinery.    */
/* Click a card -> small centered popup with details -> ✕ to close.    */
/* ------------------------------------------------------------------ */
function ImageGridWithLightbox({
  images,
  columns = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
}: {
  images: any[]
  columns?: string
}) {
  const [selected, setSelected] = useState<any | null>(null)

  const filtered = (images || []).filter(item => {
    if (typeof item === 'string') return item.trim().length > 0
    return item && item.image && item.image.trim().length > 0
  })

  if (filtered.length === 0) return null

  return (
    <>
      <div className={`grid ${columns} gap-4`}>
        {filtered.map((item, i) => {
          const image = getGalleryImage(item)
          const name = getGalleryName(item)
          const description = getGalleryDescription(item)

          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(item)}
              className="text-left bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={image}
                  alt={name || `Gallery image ${i + 1}`}
                  className="w-full h-full object-cover hover:opacity-90 transition"
                />
              </div>
              {(name || description) && (
                <div className="p-3">
                  {name && <h4 className="font-medium text-gray-800 text-sm">{name}</h4>}
                  {description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{description}</p>}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-lg overflow-hidden max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black">
              <img
                src={getGalleryImage(selected)}
                alt={getGalleryName(selected) || "Gallery image"}
                className="w-full max-h-[50vh] object-contain"
              />
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute top-2 right-2 rounded-full bg-black/50 hover:bg-black/70 text-white p-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {(getGalleryName(selected) || getGalleryDescription(selected)) && (
              <div className="p-4">
                {getGalleryName(selected) && (
                  <h4 className="font-semibold text-gray-800">{getGalleryName(selected)}</h4>
                )}
                {getGalleryDescription(selected) && (
                  <p className="text-sm text-gray-600 mt-1">{getGalleryDescription(selected)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Document viewer: Company Brochure / Certifications. Nothing         */
/* auto-opens/downloads. "View" -> small popup with ✕ close.           */
/* "Download" only fires when clicked. Non-PDF files are routed        */
/* through Google's viewer since browsers can't render Word/Excel/     */
/* PowerPoint directly in an iframe.                                   */
/* ------------------------------------------------------------------ */
export function DocumentViewer({
  documents,
  title = "Product Catalogues",
  allowDownload = true,
}: {
  documents: string[]
  title?: string
  allowDownload?: boolean
}) {
  const [previewDoc, setPreviewDoc] = useState<string | null>(null)

  const getExtension = (url: string) => url.split('.').pop()?.toLowerCase().split('?')[0] || ''

  const getFileType = (url: string) => {
    const extension = getExtension(url)
    const typeMap: Record<string, string> = {
      'pdf': 'PDF',
      'doc': 'Word',
      'docx': 'Word',
      'xls': 'Excel',
      'xlsx': 'Excel',
      'ppt': 'PowerPoint',
      'pptx': 'PowerPoint',
    }
    return typeMap[extension] || 'Document'
  }

  const getFileIcon = (url: string) => {
    const extension = getExtension(url)
    const iconMap: Record<string, string> = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'ppt': '📑',
      'pptx': '📑',
    }
    return iconMap[extension] || '📁'
  }

  const getDisplayName = (url: string) => {
    const raw = url.split('/').pop() || 'Document'
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  const getPreviewSrc = (url: string) => {
    const extension = getExtension(url)
    if (extension === 'pdf') {
      return `${url}#toolbar=0`
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
  }

  const filteredDocs = (documents || []).filter(Boolean)

  if (filteredDocs.length === 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-4">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>

      <div className="flex flex-wrap gap-3">
        {filteredDocs.map((doc, index) => (
          <div
            key={index}
            className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <span className="text-lg shrink-0">{getFileIcon(doc)}</span>

            <div className="flex flex-col min-w-0">
              <span className="truncate max-w-[160px] text-sm font-medium text-gray-800">
                {getDisplayName(doc)}
              </span>
              <span className="text-xs text-gray-400">
                {getFileType(doc)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              <button
                onClick={() => setPreviewDoc(doc)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                title="View"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>

              {allowDownload && (
                <button
                  onClick={() => downloadFile(doc, getDisplayName(doc))}
                  className="p-1.5 text-gray-500 hover:text-green-600 transition rounded-lg hover:bg-green-50"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-lg overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="text-sm font-medium text-gray-700 truncate">
                  {getDisplayName(previewDoc)}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {allowDownload && (
                  <button
                    onClick={() => downloadFile(previewDoc, getDisplayName(previewDoc))}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                )}
                <button
                  onClick={() => setPreviewDoc(null)}
                  aria-label="Close"
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-white flex-1 overflow-hidden">
              <iframe
                src={getPreviewSrc(previewDoc)}
                className="w-full h-[65vh] rounded border border-gray-200"
                title="Document Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Product showcase: thumbnail rail + large image + info panel         */
/* ------------------------------------------------------------------ */
function ProductShowcase({ items }: { items: SectionItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [thumbStart, setThumbStart] = useState(0)
  const THUMBS_VISIBLE = 4

  if (items.length === 0) return null

  const selected = items[selectedIndex]
  const visibleThumbs = items.slice(thumbStart, thumbStart + THUMBS_VISIBLE)

  const scrollThumbsUp = () => setThumbStart((s) => Math.max(0, s - 1))
  const scrollThumbsDown = () =>
    setThumbStart((s) => Math.min(Math.max(0, items.length - THUMBS_VISIBLE), s + 1))

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-6">
        {/* Thumbnail rail */}
        <div className="flex md:flex-col items-center gap-2 order-2 md:order-1">
          {items.length > THUMBS_VISIBLE && (
            <button
              onClick={scrollThumbsUp}
              disabled={thumbStart === 0}
              className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
              aria-label="Scroll thumbnails up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          {visibleThumbs.map((item, i) => {
            const realIndex = thumbStart + i
            return (
              <button
                key={realIndex}
                onClick={() => setSelectedIndex(realIndex)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 ${selectedIndex === realIndex
                  ? "border-red-600"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <img src={item.image} alt={item.name || `Product ${realIndex + 1}`} className="w-full h-full object-cover" />
              </button>
            )
          })}
          {items.length > THUMBS_VISIBLE && (
            <button
              onClick={scrollThumbsDown}
              disabled={thumbStart + THUMBS_VISIBLE >= items.length}
              className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
              aria-label="Scroll thumbnails down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Main image */}
        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square order-1 md:order-2">
          <img
            src={selected.image}
            alt={selected.name || "Selected product"}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info panel */}
        <div className="flex flex-col justify-center order-3">
          {selected.name && (
            <h3 className="text-lg font-bold text-gray-800">{selected.name}</h3>
          )}
          {selected.description && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{selected.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Video showcase: EXACT same layout as ProductShowcase — thumbnail    */
/* rail + large video player + info panel. Selecting a different       */
/* thumbnail swaps the video AND swaps the title/description, paired   */
/* from productItems by index. If there are fewer products than       */
/* videos, it cycles back to the start instead of going blank.         */
/* ------------------------------------------------------------------ */
function VideoShowcase({ videos, productItems }: { videos: string[]; productItems: SectionItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [thumbStart, setThumbStart] = useState(0)
  const THUMBS_VISIBLE = 4

  const filtered = (videos || []).filter(Boolean)
  if (filtered.length === 0) return null

  const selectedVideo = filtered[selectedIndex]
  const selectedProduct =
    productItems.length > 0 ? productItems[selectedIndex % productItems.length] : undefined

  const visibleThumbs = filtered.slice(thumbStart, thumbStart + THUMBS_VISIBLE)

  const scrollThumbsUp = () => setThumbStart((s) => Math.max(0, s - 1))
  const scrollThumbsDown = () =>
    setThumbStart((s) => Math.min(Math.max(0, filtered.length - THUMBS_VISIBLE), s + 1))

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-6">
        {/* Thumbnail rail */}
        <div className="flex md:flex-col items-center gap-2 order-2 md:order-1">
          {filtered.length > THUMBS_VISIBLE && (
            <button
              onClick={scrollThumbsUp}
              disabled={thumbStart === 0}
              className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
              aria-label="Scroll thumbnails up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          {visibleThumbs.map((url, i) => {
            const realIndex = thumbStart + i
            const thumbnail = getVideoThumbnail(url)
            return (
              <button
                key={realIndex}
                onClick={() => setSelectedIndex(realIndex)}
                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 bg-gray-900 ${selectedIndex === realIndex
                  ? "border-red-600"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={`Video ${realIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-white/70" />
                  </div>
                )}
              </button>
            )
          })}
          {filtered.length > THUMBS_VISIBLE && (
            <button
              onClick={scrollThumbsDown}
              disabled={thumbStart + THUMBS_VISIBLE >= filtered.length}
              className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
              aria-label="Scroll thumbnails down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Main video player */}
        <div className="rounded-lg overflow-hidden border border-gray-200 bg-black aspect-square order-1 md:order-2">
          <iframe
            key={selectedVideo}
            src={toEmbedUrl(selectedVideo)}
            className="w-full h-full"
            allowFullScreen
            title={selectedProduct?.name || "Selected video"}
          />
        </div>

        {/* Info panel — swaps per selected video, cycling product data */}
        <div className="flex flex-col justify-center order-3">
          {selectedProduct?.name && (
            <h3 className="text-lg font-bold text-gray-800">{selectedProduct.name}</h3>
          )}
          {selectedProduct?.description && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{selectedProduct.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Catalogue cards (grid layout, with preview popup, download button,  */
/* and view-all toggle)                                                */
/* ------------------------------------------------------------------ */
function CatalogueCards({ documents, title = "Product Catalogues" }: { documents: string[]; title?: string }) {
  const [previewDoc, setPreviewDoc] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const VISIBLE = 3

  const filtered = (documents || []).filter(Boolean)
  if (filtered.length === 0) return null

  const visibleDocs = showAll ? filtered : filtered.slice(0, VISIBLE)

  const getExtension = (url: string) => url.split('.').pop()?.toLowerCase().split('?')[0] || ''
  const getDisplayName = (url: string) => {
    const raw = url.split('/').pop() || 'Document'
    try {
      return decodeURIComponent(raw).replace(/\.[^/.]+$/, '')
    } catch {
      return raw
    }
  }
  const getFileType = (url: string) => {
    const ext = getExtension(url)
    const map: Record<string, string> = { pdf: 'PDF', doc: 'Word', docx: 'Word', xls: 'Excel', xlsx: 'Excel', ppt: 'PowerPoint', pptx: 'PowerPoint' }
    return map[ext] || 'Document'
  }
  const getPreviewSrc = (url: string) => {
    const ext = getExtension(url)
    if (ext === 'pdf') return `${url}#toolbar=0`
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visibleDocs.map((doc, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 flex flex-col items-center text-center gap-2">
            <span className="text-2xl">📄</span>
            <div className="min-w-0 w-full">
              <p className="text-xs font-medium text-gray-800 truncate">{getDisplayName(doc)}</p>
              <p className="text-[11px] text-gray-400">{getFileType(doc)}</p>
            </div>
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => setPreviewDoc(doc)}
                className="flex-1 flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition justify-center"
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
              <button
                onClick={() => downloadFile(doc, getDisplayName(doc))}
                className="flex-1 flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition justify-center"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > VISIBLE && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="mt-4 w-full text-center text-xs font-semibold text-red-600 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition"
        >
          {showAll ? "Show less" : `View all catalogues (${filtered.length})`}
        </button>
      )}

      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-lg overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700 truncate">{getDisplayName(previewDoc)}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => downloadFile(previewDoc, getDisplayName(previewDoc))}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  aria-label="Close"
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 bg-white flex-1 overflow-hidden">
              <iframe src={getPreviewSrc(previewDoc)} className="w-full h-[65vh] rounded border border-gray-200" title="Document preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export default function GalleryTabs({
  videoGallery,
  productGallery,
  companyGallery,
  factoryGallery,
  productCatalogues,
  isPaid = false,
  companySlug,
  companyIntro,
  industryIntro,
  companyBrochure,
  manufacturingCapabilities,
  manufacturingCapabilityImages,
  manufacturingCapabilityVideos,
  machineryList,
  machineryImages,
}: GalleryTabsProps) {
  const [activeTab, setActiveTab] = useState("product")
  const [activeProductSubTab, setActiveProductSubTab] = useState<"products" | "capabilities">("products")

  const baseTabs = [
    { id: "product", label: "Product and Services" },
    { id: "company", label: "Company Gallery" },
    { id: "factory", label: "Facilities" },
  ]

  const tabs = isPaid
    ? [...baseTabs, { id: "team", label: "Our Team" }]
    : baseTabs

  const hasManufacturingContent =
    Boolean(manufacturingCapabilities) ||
    (manufacturingCapabilityImages || []).filter(Boolean).length > 0 ||
    (manufacturingCapabilityVideos || []).filter(Boolean).length > 0

  const hasMachineryContent =
    Boolean(machineryList) ||
    (machineryImages || []).filter(Boolean).length > 0

  const hasCapabilitiesContent = hasManufacturingContent || hasMachineryContent

  const hasProductVideos = (videoGallery || []).filter(Boolean).length > 0
  const productItems = toSectionItems(productGallery)

  return (
    <div>
      {/* Main tabs */}
      <div className="mb-8">
        <div className="inline-flex flex-wrap gap-1 p-1 bg-gray-100 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-black hover:bg-gray-200"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product and Services */}
      {activeTab === "product" && (
        <>
          {!isPaid ? (
            <EmptyState message={GALLERY_UNAVAILABLE_MESSAGE} />
          ) : (
            <>
              {/* Inner sub-tabs */}
              <div className="mb-6">
                <div className="inline-flex gap-1 p-1 bg-gray-50 border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setActiveProductSubTab("products")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all
                      ${activeProductSubTab === "products"
                        ? "bg-white text-red-600 shadow-sm border border-gray-200"
                        : "text-gray-500 hover:text-gray-700"
                      }
                    `}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => setActiveProductSubTab("capabilities")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all
                      ${activeProductSubTab === "capabilities"
                        ? "bg-white text-red-600 shadow-sm border border-gray-200"
                        : "text-gray-500 hover:text-gray-700"
                      }
                    `}
                  >
                    Manufacturing &amp; Machinery
                  </button>
                </div>
              </div>

              {activeProductSubTab === "products" && (
                <div className="space-y-6">
                  {/* 1. Product images */}
                  {productGallery && hasGalleryItems(productGallery) ? (
                    <ProductShowcase items={productItems} />
                  ) : (
                    <EmptyState message="No product images available" />
                  )}

                  {/* 2. Videos — same showcase layout, content cycles per video */}
                  {hasProductVideos && (
                    <VideoShowcase videos={videoGallery!} productItems={productItems} />
                  )}

                  {/* 3. Product catalogues — downloadable */}
                  {productCatalogues && productCatalogues.filter(Boolean).length > 0 && (
                    <CatalogueCards documents={productCatalogues} title="Product Catalogues" />
                  )}
                </div>
              )}

              {activeProductSubTab === "capabilities" && (
                <>
                  {hasCapabilitiesContent ? (
                    <div className="space-y-6">
                      {hasManufacturingContent && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                          <h4 className="text-sm font-semibold text-gray-600 uppercase">Manufacturing Capabilities</h4>
                          {manufacturingCapabilities && (
                            <div
                              className="prose prose-sm max-w-none text-gray-700"
                              dangerouslySetInnerHTML={{ __html: manufacturingCapabilities }}
                            />
                          )}
                          {manufacturingCapabilityImages && manufacturingCapabilityImages.filter(Boolean).length > 0 && (
                            <ImageGridWithLightbox images={manufacturingCapabilityImages} />
                          )}
                          {manufacturingCapabilityVideos && manufacturingCapabilityVideos.filter(Boolean).length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {manufacturingCapabilityVideos.filter(Boolean).map((url, i) => (
                                <div key={i} className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                                  <iframe
                                    src={toEmbedUrl(url)}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title={`Manufacturing video ${i + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {hasMachineryContent && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                          <h4 className="text-sm font-semibold text-gray-600 uppercase">Machinery List</h4>
                          {machineryList && (
                            <MachineryListGrid html={machineryList} />
                          )}
                          {machineryImages && machineryImages.filter(Boolean).length > 0 && (
                            <ImageGridWithLightbox images={machineryImages} columns="grid-cols-2 sm:grid-cols-4" />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState message="No manufacturing capabilities or machinery info added" />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Company Gallery */}
      {activeTab === "company" &&
        (!isPaid ? (
          <EmptyState message={GALLERY_UNAVAILABLE_MESSAGE} />
        ) : companyGallery && hasGalleryItems(companyGallery) ? (
          <div className="space-y-6">
            <SplitGallerySection
              heading={companyIntro?.heading ?? "Get to Know Our Company"}
              description={companyIntro?.description}
              ctaHref={companyIntro?.ctaHref ?? (companySlug ? `/company/${companySlug}` : undefined)}
              items={toSectionItems(companyGallery)}
            />
            {companyBrochure && companyBrochure.filter(Boolean).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <DocumentViewer documents={companyBrochure} title="Company Brochure" />
              </div>
            )}
          </div>
        ) : companyBrochure && companyBrochure.filter(Boolean).length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <DocumentViewer documents={companyBrochure} title="Company Brochure" />
          </div>
        ) : (
          <EmptyState message="No company images available" />
        ))}

      {/* Facilities */}
      {activeTab === "factory" &&
        (!isPaid ? (
          <EmptyState message={GALLERY_UNAVAILABLE_MESSAGE} />
        ) : factoryGallery && hasGalleryItems(factoryGallery) ? (
          <SplitGallerySection
            heading={industryIntro?.heading ?? "Our Facilities"}
            description={industryIntro?.description}
            ctaHref={industryIntro?.ctaHref ?? (companySlug ? `/company/${companySlug}` : undefined)}
            items={toSectionItems(factoryGallery)}
          />
        ) : (
          <EmptyState message="No facility images available" />
        ))}

      {/* Our Team */}
      {activeTab === "team" && isPaid && (
        <SupplierTeamTab companySlug={companySlug} />
      )}
    </div>
  )
}
// components/GalleryTabs.tsx
"use client"

import { useState } from "react"
import VideoGallery from "./VideoGallery"
import SupplierTeamTab from "./SupplierTeamTab"
import { FileText, Download, Eye } from "lucide-react"

type GalleryTabsProps = {
  videoGallery?: string[]
  productGallery?: string[]
  companyGallery?: string[]
  factoryGallery?: string[]
  productCatalogues?: string[]
  isPaid?: boolean
  companySlug?: string // Company slug for fetching team members
}

const NO_PLAN_MESSAGE =
  "This supplier hasn't purchased a plan to upload gallery content."

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-72 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-center px-6">
      {message}
    </div>
  )
}

function ImageGrid({ images }: { images: string[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {images.filter(Boolean).map((src, i) => (
        <a
          key={i}
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-square rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition"
        >
          <img
            src={src}
            alt={`Gallery image ${i + 1}`}
            className="w-full h-full object-cover"
          />
        </a>
      ))}
    </div>
  )
}

function DocumentViewer({ documents }: { documents: string[] }) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(
    documents.length > 0 ? documents[0] : null
  )

  const handleDownload = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)

      const defaultName = filename || url.split('/').pop() || 'document.pdf'
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

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase() || ''
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
    const extension = url.split('.').pop()?.toLowerCase() || ''
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

  if (!documents || documents.length === 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-4">
      <h4 className="text-sm font-semibold text-gray-700">Product Catalogues</h4>

      <div className="flex flex-wrap gap-3">
        {documents.filter(Boolean).map((doc, index) => (
          <div key={index} className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDoc(selectedDoc === doc ? null : doc)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition text-sm font-medium
                ${selectedDoc === doc
                  ? 'border-red-600 bg-red-50 text-red-600'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              <span>{getFileIcon(doc)}</span>
              <span className="truncate max-w-[150px]">
                {doc.split('/').pop() || `Catalogue ${index + 1}`}
              </span>
              <span className="text-xs text-gray-400 ml-1">
                ({getFileType(doc)})
              </span>
            </button>

            <button
              onClick={() => handleDownload(doc)}
              className="p-2 text-gray-500 hover:text-green-600 transition rounded-lg hover:bg-green-50"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {selectedDoc && (
        <div className="rounded-lg border border-gray-200 overflow-hidden mt-4">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 truncate">
                {selectedDoc.split('/').pop() || 'Document'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(selectedDoc, '_blank')}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                <Eye className="w-3 h-3" />
                View
              </button>
              <button
                onClick={() => handleDownload(selectedDoc)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 bg-white">
            <iframe
              src={`${selectedDoc}#toolbar=0`}
              className="w-full h-[500px] rounded border border-gray-200"
              title="Document Viewer"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function GalleryTabs({
  videoGallery,
  productGallery,
  companyGallery,
  factoryGallery,
  productCatalogues,
  isPaid = false,
  companySlug,
}: GalleryTabsProps) {
  const [activeTab, setActiveTab] = useState("video")

  const baseTabs = [
    { id: "video", label: "Video Gallery" },
    { id: "product", label: "Product Gallery" },
    { id: "company", label: "Company Gallery" },
    { id: "factory", label: "Factory Gallery" },
  ]

  // Add "Our Team" tab only for paid plans
  const tabs = isPaid
    ? [...baseTabs, { id: "team", label: "Our Team" }]
    : baseTabs

  return (
    <div>
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition whitespace-nowrap px-1
                ${activeTab === tab.id
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "video" &&
        (videoGallery && videoGallery.filter(Boolean).length > 0 ? (
          <VideoGallery videos={videoGallery} />
        ) : (
          <EmptyState message="No videos available" />
        ))}

      {activeTab === "product" && (
        <>
          {!isPaid ? (
            <EmptyState message={NO_PLAN_MESSAGE} />
          ) : (
            <>
              {productGallery && productGallery.filter(Boolean).length > 0 ? (
                <ImageGrid images={productGallery} />
              ) : (
                <EmptyState message="No product images available" />
              )}

              {productCatalogues && productCatalogues.filter(Boolean).length > 0 && (
                <DocumentViewer documents={productCatalogues} />
              )}
            </>
          )}
        </>
      )}

      {activeTab === "company" &&
        (!isPaid ? (
          <EmptyState message={NO_PLAN_MESSAGE} />
        ) : companyGallery && companyGallery.filter(Boolean).length > 0 ? (
          <ImageGrid images={companyGallery} />
        ) : (
          <EmptyState message="No company images available" />
        ))}

      {activeTab === "factory" &&
        (!isPaid ? (
          <EmptyState message={NO_PLAN_MESSAGE} />
        ) : factoryGallery && factoryGallery.filter(Boolean).length > 0 ? (
          <ImageGrid images={factoryGallery} />
        ) : (
          <EmptyState message="No factory images available" />
        ))}

      {/* Our Team Tab */}
      {activeTab === "team" && isPaid && (
        <SupplierTeamTab companySlug={companySlug} />
      )}
    </div>
  )
}
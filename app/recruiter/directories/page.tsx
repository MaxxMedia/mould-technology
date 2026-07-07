"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import Link from "next/link"
import type { ContentLimitEligibility } from "@/lib/packageLimits"
import { countFilledProducts } from "@/lib/productListings"

const PackageLimitModal = dynamic(
  () => import("@/components/recruiter/PackageLimitModal"),
  { ssr: false }
)

type Directory = {
  id: number
  name: string
  slug: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  isLiveEditable: boolean
  productSupplies?: unknown
}

export default function RecruiterDirectoriesPage() {
  const [directories, setDirectories] = useState<Directory[]>([])
  const [listingEligibility, setListingEligibility] =
    useState<ContentLimitEligibility | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          if (!cancelled) setError("Please log in again.")
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) {
          if (!cancelled) setError("API URL is not configured.")
          return
        }

        const directoriesRes = await fetch(
          `${apiUrl}/api/suppliers/recruiter/directories`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        )

        if (!directoriesRes.ok) {
          const data = await directoriesRes.json().catch(() => ({}))
          throw new Error(data.error || "Failed to load directories")
        }

        const data = await directoriesRes.json()
        if (!cancelled) {
          setDirectories(Array.isArray(data) ? data : [])
        }

        try {
          const eligibilityRes = await fetch(
            `${apiUrl}/api/suppliers/recruiter/product-listings/eligibility`,
            {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            }
          )
          if (eligibilityRes.ok && !cancelled) {
            setListingEligibility(await eligibilityRes.json())
          }
        } catch (eligibilityError) {
          console.error("Eligibility load error:", eligibilityError)
        }
      } catch (err: unknown) {
        console.error("LOAD ERROR:", err)
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load directories"
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-10">
        <p className="text-gray-600">Loading directories...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">My Directories</h1>

        <Link
          href="/recruiter/directory/new"
          onClick={(e) => {
            if (listingEligibility && !listingEligibility.canAdd) {
              e.preventDefault()
              setShowLimitModal(true)
            }
          }}
          className="bg-black text-white px-5 py-2 rounded text-sm"
        >
          + Add Directory
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {directories.length} supplier {directories.length === 1 ? "directory" : "directories"}
        {listingEligibility && !listingEligibility.isUnlimited && (
          <>
            {" · "}
            {listingEligibility.activeListings ?? directories.length} of{" "}
            {listingEligibility.effectiveLimit ?? 0} directory slots used
            {" · "}
            {listingEligibility.remaining ?? 0} remaining on your{" "}
            {listingEligibility.planLabel ?? "plan"}
          </>
        )}
        {listingEligibility?.isUnlimited && " · Unlimited supplier directories on your plan"}
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow divide-y">
        {directories.length === 0 && !error && (
          <div className="p-8 text-center text-gray-500">
            <p>You haven&apos;t created any directories yet.</p>
            <Link
              href="/recruiter/directory/new"
              className="mt-3 inline-block text-blue-600 hover:underline"
            >
              Create your supplier directory →
            </Link>
          </div>
        )}

        {directories.map((dir) => {
          const productCount = countFilledProducts(dir.productSupplies)
          const isPublic = dir.status === "APPROVED"
          return (
            <div
              key={dir.id}
              className="p-4 flex items-center justify-between gap-4"
            >
              {isPublic ? (
                <Link
                  href={`/suppliers/${dir.slug}`}
                  className="flex-1 min-w-0 group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {dir.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    /suppliers/{dir.slug}
                    {" · "}
                    {productCount} product{productCount === 1 ? "" : "s"} listed
                  </p>
                </Link>
              ) : (
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{dir.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Status:{" "}
                    <span
                      className={
                        dir.status === "PENDING"
                          ? "text-yellow-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {dir.status}
                    </span>
                    {" · "}
                    {productCount} product{productCount === 1 ? "" : "s"} listed
                    {" · "}
                    Public page available after approval
                  </p>
                </div>
              )}

              <div className="shrink-0 flex items-center gap-2">
                {isPublic && (
                  <Link
                    href={`/suppliers/${dir.slug}`}
                    className="px-4 py-2 rounded text-sm border hover:bg-gray-50"
                  >
                    View
                  </Link>
                )}
                {dir.isLiveEditable ? (
                  <Link
                    href={`/recruiter/directory/${dir.id}/edit`}
                    className="px-4 py-2 rounded text-sm bg-black text-white"
                  >
                    Edit
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 rounded text-sm border opacity-50 cursor-not-allowed"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <PackageLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Directory slot limit reached"
        eligibility={listingEligibility}
        usedLabel="Directories"
        usedValue={listingEligibility?.activeListings}
        limitValue={listingEligibility?.effectiveLimit}
      />
    </div>
  )
}

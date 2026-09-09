import JsonLd from "@/components/seo/JsonLd"
import {
  absoluteUrl,
  collectionJsonLd,
  getBackendUrl,
  listingMetadata,
} from "@/lib/seo"
import SuppliersClient from "./SuppliersClient"

export const dynamic = "force-dynamic"

export const metadata = listingMetadata({
  title: "Find a Tooling & Manufacturing Supplier",
  description:
    "Search the Tooling Trends supplier directory for CNC machining, dies and moulds, cutting tools, metrology, CAD/CAM, and factory automation companies.",
  path: "/suppliers",
  keywords: [
    "tooling suppliers",
    "manufacturing directory",
    "CNC machining companies",
    "dies and moulds suppliers",
    "cutting tools",
    "metrology suppliers",
    "factory automation",
    "CAD CAM vendors",
  ],
})

async function getSuppliers() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/suppliers?page=1&limit=15&sort=alphabetical`, {
      cache: "no-store",
    })
    if (!res.ok) return { suppliers: [], total: 0 }
    const data = await res.json()
    if (Array.isArray(data)) {
      return { suppliers: data, total: data.length }
    }
    return {
      suppliers: data.data ?? [],
      total: data.total ?? 0,
    }
  } catch {
    return { suppliers: [], total: 0 }
  }
}

export default async function SuppliersPage() {
  const { suppliers, total } = await getSuppliers()

  return (
    <>
      <JsonLd
        data={collectionJsonLd({
          name: "Find a Tooling & Manufacturing Supplier",
          description:
            "Directory of CNC, tooling, mould making, and manufacturing technology suppliers.",
          path: "/suppliers",
          itemUrls: suppliers
            .slice(0, 20)
            .filter((item: { slug?: string }) => item.slug)
            .map((item: { slug: string }) => absoluteUrl(`/suppliers/${item.slug}`)),
        })}
      />
      <SuppliersClient initialSuppliers={suppliers} initialTotal={total} />
    </>
  )
}

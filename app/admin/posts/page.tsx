"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  FolderOpen,
  User,
  Eye,
  Filter,
} from "lucide-react"
import AdminPagination, { ADMIN_PAGE_SIZE } from "@/components/admin/AdminPagination"

/* ================= TYPES ================= */

type Post = {
  id: number
  title: string
  slug: string
  imageUrl?: string
  category?: { name: string; slug: string }
  author?: { name: string }
  publishedAt?: string
  views: number
}

type Category = {
  id: number
  name: string
  slug: string
}

const PAGE_SIZE = ADMIN_PAGE_SIZE

/* ================= PAGE ================= */

export default function PostsList() {
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [categorySlug, setCategorySlug] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  /* ================= DEBOUNCE ================= */

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    setPage(1)
  }, [categorySlug])

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  /* ================= FETCH CATEGORIES ================= */

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  /* ================= FETCH POSTS ================= */

  useEffect(() => {
    async function load() {
      setLoading(true)

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        q: debouncedSearch,
        admin: "true",
      })
      if (categorySlug) params.set("category", categorySlug)
      if (statusFilter) params.set("status", statusFilter)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/admin/all?${params.toString()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      const json = await res.json()

      setPosts(json.data || [])
      setTotal(json.meta?.total || 0)
      setLoading(false)
    }

    load()
  }, [page, debouncedSearch, categorySlug, statusFilter])

  /* ================= TOGGLE PUBLISH / DRAFT STATUS ================= */

  async function togglePublishStatus(id: number, currentlyPublished: boolean) {
    const token = localStorage.getItem("token")
    const newIsPublished = !currentlyPublished
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ isPublished: newIsPublished }),
        }
      )
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  publishedAt: newIsPublished
                    ? new Date().toISOString()
                    : undefined,
                }
              : p
          )
        )
      } else {
        alert("Failed to update post status")
      }
    } catch {
      alert("Error updating post status")
    }
  }

  /* ================= DELETE ================= */

  async function handleDelete(id: number) {
    const token = localStorage.getItem("token")
    if (!token) return alert("Unauthorized")

    if (!confirm("Delete this post?")) return

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    setPosts((p) => p.filter((x) => x.id !== id))
  }

  /* ================= TABLE ================= */

  const columnHelper = createColumnHelper<Post>()

  const columns = [
    columnHelper.display({
      id: "image",
      header: "Image",
      cell: (info) => {
        const url = info.row.original.imageUrl
        return url ? (
          <Image
            src={url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`}
            width={64}
            height={64}
            alt=""
            className="rounded object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
            <FileText className="text-gray-400" />
          </div>
        )
      },
    }),

    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <div>
          <p className="font-semibold line-clamp-2">
            {info.getValue()}
          </p>
          <p className="text-xs text-gray-500">
            /{info.row.original.slug}
          </p>
        </div>
      ),
    }),

    columnHelper.display({
      id: "category",
      header: "Category",
      cell: (info) =>
        info.row.original.category?.name ?? (
          <span className="text-gray-400">—</span>
        ),
    }),

    /* 👁️ VIEWS COLUMN */
    columnHelper.accessor("views", {
      header: "Views",
      cell: (info) => (
        <div className="flex items-center gap-1 text-gray-700 font-medium">
          <Eye size={14} className="text-gray-400" />
          {info.getValue()}
        </div>
      ),
    }),

    /* STATUS COLUMN WITH TOGGLE */
    columnHelper.display({
      id: "published",
      header: "Status",
      cell: (info) => {
        const isPublished = Boolean(info.row.original.publishedAt)
        return (
          <button
            onClick={() => togglePublishStatus(info.row.original.id, isPublished)}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition flex items-center gap-1.5 cursor-pointer ${
              isPublished
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            }`}
            title="Click to toggle status (Published / Draft)"
          >
            <span className={`w-2 h-2 rounded-full ${isPublished ? "bg-green-500" : "bg-amber-500"}`} />
            {isPublished ? "Published" : "Draft"}
          </button>
        )
      },
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              router.push(`/admin/posts/edit/${info.row.original.id}`)
            }
            className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
            title="Edit Post"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(info.row.original.id)}
            className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
            title="Delete Post"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Content Management</h1>
          <button
            onClick={() => router.push("/admin/posts/create")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
          >
            <Plus size={18} /> New Post
          </button>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid md:grid-cols-3 gap-4">
          <ActionCard
            icon={<Plus />}
            title="Create Post"
            desc="Write a new article"
            onClick={() => router.push("/admin/posts/create")}
          />
          <ActionCard
            icon={<FolderOpen />}
            title="Categories"
            desc="Manage categories"
            onClick={() => router.push("/admin/categories")}
          />
          <ActionCard
            icon={<User />}
            title="Authors"
            desc="Manage authors"
            onClick={() => router.push("/admin/authors")}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-3">
              {/* SEARCH */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts..."
                  className="pl-9 pr-4 py-2 border rounded w-full text-sm"
                />
              </div>

              {/* STATUS FILTER */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 border rounded text-sm bg-white appearance-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* CATEGORY FILTER */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="pl-9 pr-8 py-2 border rounded text-sm bg-white appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CLEAR FILTER */}
              {(categorySlug || debouncedSearch || statusFilter) && (
                <button
                  onClick={() => { setCategorySlug(""); setSearch(""); setStatusFilter("") }}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 border rounded"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            itemLabel="posts"
            onPageChange={setPage}
            className="border-0 border-t rounded-none shadow-none"
          />
        </div>
      </div>
    </div>
  )
}

/* ================= ACTION CARD ================= */

function ActionCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="p-5 bg-white rounded-xl shadow hover:shadow-md transition text-left flex gap-4"
    >
      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </button>
  )
}

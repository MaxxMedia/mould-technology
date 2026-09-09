"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Factory, Filter, Plus, Search, Trash2 } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 20;

type Industry = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  createdAt: string;
  parent: { id: number; name: string } | null;
  childrenCount: number;
  companiesCount: number;
};

export default function AllIndustriesPage() {
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [parentFilter, setParentFilter] = useState<"all" | "root">("all");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, parentFilter]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (parentFilter === "root") params.set("parentId", "root");

    setLoading(true);
    fetch(`${API_URL}/api/admin/industries?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error(
            res.status === 404
              ? "Industry API is not available. Restart the backend server."
              : `Unexpected response (${res.status})`
          );
        }
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch industries");
        }
        return json;
      })
      .then((json) => {
        setIndustries(Array.isArray(json.data) ? json.data : []);
        setTotal(json.meta?.total ?? 0);
        setTotalPages(json.meta?.pages ?? 1);
      })
      .catch((err) => {
        console.error("Failed to fetch industries", err);
        setIndustries([]);
      })
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, parentFilter, reloadToken]);

  async function handleDelete(item: Industry) {
    if (!confirm(`Delete industry "${item.name}"?`)) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/admin/industries/${item.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error || "Failed to delete industry");
      return;
    }

    if (industries.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      setReloadToken((n) => n + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Factory className="text-indigo-600" size={24} />
            All Industry
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} {total === 1 ? "industry" : "industries"} in the catalogue
          </p>
        </div>
        <Link
          href="/admin/industries/create"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus size={16} />
          Create Industry
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b flex flex-wrap gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or slug"
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative w-full sm:w-52">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value as "all" | "root")}
              className="pl-9 pr-8 py-2 border rounded-lg text-sm w-full bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All levels</option>
              <option value="root">Top-level only</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : industries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No industries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Children
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Companies
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {industries.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{item.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.parent ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch(item.parent!.name);
                            setParentFilter("all");
                          }}
                          className="text-indigo-600 hover:underline"
                        >
                          {item.parent.name}
                        </button>
                      ) : (
                        <span className="text-gray-400">Top-level</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.childrenCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.companiesCount}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/industries/${item.id}/edit`)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Edit industry"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Delete industry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={PAGE_SIZE}
          itemLabel="industries"
          onPageChange={setPage}
          className="border-0 border-t rounded-none shadow-none"
        />
      </div>
    </div>
  );
}

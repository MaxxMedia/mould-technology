"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Plus } from "lucide-react";

interface SubAdmin {
  id: number | string;
  name: string;
  email: string;
  role: string;
  phone: string;
  permissions: string;
  status: string;
}

export default function SubAdminPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSubAdmins() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/sub-admins`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok) {
          setAdmins(Array.isArray(data) ? data : data.subAdmins ?? []);
        } else {
          setError(data.message || "Failed to load sub admins");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    fetchSubAdmins();
  }, []);

  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
      {/* Breadcrumb bar */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-400 to-blue-500" />
        <span className="absolute px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold tracking-wide">
          SUB ADMIN
        </span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SUB ADMIN</h1>
          <p className="text-gray-500 mt-1">Manage sub administrator accounts</p>
        </div>
        <button
          onClick={() => router.push("/admin/Users/sub-admin/create")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Add New Sub Admin
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Sub Admin Details</h2>
          <p className="text-sm text-gray-400 mt-1">Accounts with scoped, role-based access</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">No</th>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Permissions</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && admins.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    No sub admins found.
                  </td>
                </tr>
              )}

              {!loading && !error && admins.length > 0 &&
                admins.map((admin, index) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-blue-600 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{admin.name}</td>
                    <td className="px-6 py-4 text-blue-600">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{admin.phone}</td>
                    <td className="px-6 py-4 text-blue-600">{admin.permissions}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/admin/Users/sub-admin/${admin.id}`)}
                          aria-label="View"
                          className="text-emerald-500 hover:text-emerald-600"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/Users/sub-admin/${admin.id}/edit`)}
                          aria-label="Edit"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Plus, Power, Trash2 } from "lucide-react";

interface RoleInfo {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
}

interface SubAdmin {
    id: number;
    email: string;
    username: string;
    fullName: string | null;
    role: string; // always "sub_admin" here
    isActive: boolean;
    isOnboarded: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    roleId: number | null;
    role_info: RoleInfo | null;
    permissionOverrides: { key: string; granted: boolean }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export default function SubAdminPage() {
    const router = useRouter();
    const [admins, setAdmins] = useState<SubAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);

    async function fetchSubAdmins() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_URL}/api/admin/sub-admins`, {
                headers: authHeaders(),
            });
            const data = await res.json();

            if (res.ok) {
                setAdmins(Array.isArray(data) ? data : []);
            } else {
                setError(data.error || "Failed to load sub admins");
            }
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSubAdmins();
    }, []);

    async function handleToggleStatus(admin: SubAdmin) {
        setBusyId(admin.id);
        try {
            const res = await fetch(`${API_URL}/api/admin/sub-admins/${admin.id}/status`, {
                method: "PATCH",
                headers: authHeaders(),
                body: JSON.stringify({ isActive: !admin.isActive }),
            });
            const data = await res.json();
            if (res.ok) {
                setAdmins((prev) => prev.map((a) => (a.id === admin.id ? data.subAdmin : a)));
            } else {
                alert(data.error || "Failed to update status");
            }
        } catch {
            alert("Network error");
        } finally {
            setBusyId(null);
        }
    }

    async function handleDelete(admin: SubAdmin) {
        if (!confirm(`Delete sub admin "${admin.email}"? This cannot be undone.`)) return;
        setBusyId(admin.id);
        try {
            const res = await fetch(`${API_URL}/api/admin/sub-admins/${admin.id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
            } else {
                alert(data.error || "Failed to delete sub admin");
            }
        } catch {
            alert("Network error");
        } finally {
            setBusyId(null);
        }
    }

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
                                <th className="px-6 py-3 font-medium">Overrides</th>
                                <th className="px-6 py-3 font-medium">Last login</th>
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

                            {!loading &&
                                !error &&
                                admins.length > 0 &&
                                admins.map((admin, index) => (
                                    <tr key={admin.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-blue-600 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {admin.fullName || admin.username}
                                        </td>
                                        <td className="px-6 py-4 text-blue-600">{admin.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">
                                                {admin.role_info?.name || "No role assigned"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {admin.permissionOverrides.length}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {admin.lastLoginAt
                                                ? new Date(admin.lastLoginAt).toLocaleDateString()
                                                : "Never"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${admin.isActive
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : "bg-gray-100 text-gray-500"
                                                    }`}
                                            >
                                                {admin.isActive ? "Active" : "Inactive"}
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
                                                <button
                                                    onClick={() => handleToggleStatus(admin)}
                                                    disabled={busyId === admin.id}
                                                    aria-label={admin.isActive ? "Deactivate" : "Activate"}
                                                    className="text-amber-500 hover:text-amber-600 disabled:opacity-40"
                                                >
                                                    <Power size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(admin)}
                                                    disabled={busyId === admin.id}
                                                    aria-label="Delete"
                                                    className="text-red-500 hover:text-red-600 disabled:opacity-40"
                                                >
                                                    <Trash2 size={15} />
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
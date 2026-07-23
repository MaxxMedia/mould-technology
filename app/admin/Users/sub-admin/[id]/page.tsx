"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, ShieldCheck } from "lucide-react";

interface Permission {
    key: string;
    label: string;
    module: string;
}

interface SubAdminDetail {
    id: number;
    email: string;
    username: string;
    fullName: string | null;
    role: string;
    isActive: boolean;
    isOnboarded: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    roleId: number | null;
    role_info: { id: number; name: string; slug: string; isActive: boolean } | null;
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

export default function ViewSubAdminPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [admin, setAdmin] = useState<SubAdminDetail | null>(null);
    const [roleDefaultPermissions, setRoleDefaultPermissions] = useState<Permission[]>([]);
    const [allPermissionCount, setAllPermissionCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const [subAdminRes, permsRes] = await Promise.all([
                    fetch(`${API_URL}/api/admin/sub-admins/${id}`, { headers: authHeaders() }),
                    fetch(`${API_URL}/api/admin/permissions`, { headers: authHeaders() }),
                ]);
                const data: SubAdminDetail = await subAdminRes.json();
                const permsData = await permsRes.json();

                if (!subAdminRes.ok) {
                    setError((data as any).error || "Failed to load sub admin");
                    return;
                }
                setAdmin(data);
                if (permsRes.ok) setAllPermissionCount(permsData.total || 0);

                if (data.roleId) {
                    const roleRes = await fetch(`${API_URL}/api/admin/roles/${data.roleId}/permissions`, {
                        headers: authHeaders(),
                    });
                    const roleData = await roleRes.json();
                    if (roleRes.ok) setRoleDefaultPermissions(roleData.permissions || []);
                }
            } catch {
                setError("Network error");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    // Combine role defaults + explicit overrides into the actual
    // effective permission set for this account (deny overrides remove
    // a role default, grant overrides add to it).
    const effectivePermissions = useMemo(() => {
        if (!admin) return [] as { key: string; source: "role" | "override" }[];

        const deniedKeys = new Set(
            admin.permissionOverrides.filter((o) => !o.granted).map((o) => o.key)
        );
        const grantedOverrideKeys = new Set(
            admin.permissionOverrides.filter((o) => o.granted).map((o) => o.key)
        );

        const fromRole = roleDefaultPermissions
            .filter((p) => !deniedKeys.has(p.key))
            .map((p) => ({ key: p.key, source: "role" as const }));

        const fromOverride = Array.from(grantedOverrideKeys)
            .filter((key) => !roleDefaultPermissions.some((p) => p.key === key))
            .map((key) => ({ key, source: "override" as const }));

        return [...fromRole, ...fromOverride];
    }, [admin, roleDefaultPermissions]);

    return (
        <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-900">Sub Admin Details</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push("/admin/Users/sub-admin")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        <ArrowLeft size={15} />
                        Back to List
                    </button>
                    {admin && (
                        <button
                            onClick={() => router.push(`/admin/Users/sub-admin/${admin.id}/edit`)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                        >
                            <Pencil size={14} />
                            Edit
                        </button>
                    )}
                </div>
            </div>

            {loading && <p className="text-gray-400 text-center py-10">Loading...</p>}
            {!loading && error && <p className="text-red-500 text-center py-10">{error}</p>}

            {!loading && admin && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                        <div>
                            <p className="text-gray-400">Full name</p>
                            <p className="font-semibold text-gray-900">{admin.fullName || "—"}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Username</p>
                            <p className="font-semibold text-gray-900">{admin.username}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Email</p>
                            <p className="font-semibold text-gray-900">{admin.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Status</p>
                            <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${admin.isActive
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                            >
                                {admin.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-400">Role</p>
                            <p className="font-semibold text-gray-900">
                                {admin.role_info?.name || "No role assigned"}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400">Last login</p>
                            <p className="font-semibold text-gray-900">
                                {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "Never"}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400">Created</p>
                            <p className="font-semibold text-gray-900">
                                {new Date(admin.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Effective permission summary */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-100">
                        <ShieldCheck size={18} className="text-blue-600 shrink-0" />
                        <p className="text-sm text-blue-900">
                            <span className="font-bold">
                                {effectivePermissions.length} of {allPermissionCount}
                            </span>{" "}
                            permissions are currently active for this account
                            {admin.role_info ? ` (via role "${admin.role_info.name}" + overrides)` : " (via overrides only)"}.
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 font-semibold mb-2">
                            Active permissions ({effectivePermissions.length})
                        </p>
                        {effectivePermissions.length === 0 ? (
                            <p className="text-sm text-gray-400">
                                This sub admin currently has no active permissions.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {effectivePermissions.map((p) => (
                                    <span
                                        key={p.key}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.source === "role"
                                                ? "bg-gray-100 text-gray-600"
                                                : "bg-emerald-50 text-emerald-700"
                                            }`}
                                        title={p.source === "role" ? "Granted by role" : "Granted by override"}
                                    >
                                        {p.key}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {admin.permissionOverrides.some((o) => !o.granted) && (
                        <div>
                            <p className="text-sm text-gray-600 font-semibold mb-2">Explicitly denied</p>
                            <div className="flex flex-wrap gap-2">
                                {admin.permissionOverrides
                                    .filter((o) => !o.granted)
                                    .map((o) => (
                                        <span
                                            key={o.key}
                                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 line-through"
                                        >
                                            {o.key}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
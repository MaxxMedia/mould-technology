"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface Role {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
}

interface Permission {
    key: string;
    label: string;
    module: string;
}

type PermissionsByModule = Record<string, Permission[]>;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export default function AddNewSubAdminPage() {
    const router = useRouter();

    const [form, setForm] = useState({ fullName: "", email: "", password: "" });
    const [roles, setRoles] = useState<Role[]>([]);
    const [roleId, setRoleId] = useState<string>(""); // "" = no role assigned

    // Extra one-off permission overrides on top of whatever the chosen
    // role grants by default (maps 1:1 to the backend's UserPermission
    // override layer — see subAdminController.js / permissions.js).
    // These are always GRANTS on create (there's nothing to deny yet
    // since the account doesn't exist), so a plain Set is correct here
    // — unlike the edit page, which needs the tri-state OverrideMap.
    const [permissionModules, setPermissionModules] = useState<PermissionsByModule>({});
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const [loadingMeta, setLoadingMeta] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadMeta() {
            setLoadingMeta(true);
            try {
                const [rolesRes, permsRes] = await Promise.all([
                    fetch(`${API_URL}/api/admin/roles`, { headers: authHeaders() }),
                    fetch(`${API_URL}/api/admin/permissions`, { headers: authHeaders() }),
                ]);
                const rolesData = await rolesRes.json();
                const permsData = await permsRes.json();

                if (rolesRes.ok) setRoles(rolesData.filter((r: Role) => r.isActive));
                if (permsRes.ok) setPermissionModules(permsData.modules || {});
            } catch {
                setError("Failed to load roles/permissions");
            } finally {
                setLoadingMeta(false);
            }
        }
        loadMeta();
    }, []);

    function toggleExpand(mod: string) {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(mod) ? next.delete(mod) : next.add(mod);
            return next;
        });
    }

    function togglePermission(key: string) {
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }

    function toggleModuleAll(mod: string) {
        const modPerms = permissionModules[mod] || [];
        const allSelected = modPerms.every((p) => selectedKeys.has(p.key));
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            modPerms.forEach((p) => (allSelected ? next.delete(p.key) : next.add(p.key)));
            return next;
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!form.email || !form.password) {
            setError("Email and password are required.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/sub-admins`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    fullName: form.fullName || undefined,
                    roleId: roleId ? Number(roleId) : null,
                    permissions: Array.from(selectedKeys),
                }),
            });
            const data = await res.json();

            if (res.ok) {
                router.push("/admin/Users/sub-admin");
            } else {
                setError(data.error || "Failed to add sub admin");
            }
        } catch {
            setError("Network error");
        } finally {
            setSubmitting(false);
        }
    }

    const moduleNames = Object.keys(permissionModules).sort();

    return (
        <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Add New Sub Admin</h1>
                <button
                    onClick={() => router.push("/admin/Users/sub-admin")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                    <ArrowLeft size={15} />
                    Back to List
                </button>
            </div>

            <div className="relative flex items-center justify-center mb-8">
                <div className="h-[2px] w-full bg-gradient-to-r from-emerald-400 to-blue-500" />
                <span className="absolute px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold tracking-wide">
                    ADD NEW SUB ADMIN
                </span>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-2">Sub admin details</h2>

                <div className="max-w-3xl">
                    <div className="grid grid-cols-[160px_1fr] items-center gap-4 border-b border-gray-100 py-4">
                        <label className="text-sm text-gray-600">Full name</label>
                        <input
                            value={form.fullName}
                            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                            placeholder="Name"
                            className="p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-center gap-4 border-b border-gray-100 py-4">
                        <label className="text-sm text-gray-600">Email *</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            placeholder="Enter email"
                            className="p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-center gap-4 border-b border-gray-100 py-4">
                        <label className="text-sm text-gray-600">Password *</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            placeholder="Enter password"
                            className="p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-center gap-4 border-b border-gray-100 py-4">
                        <label className="text-sm text-gray-600">Role</label>
                        <select
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                            disabled={loadingMeta}
                            className="p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">No role — permission overrides only</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-600">Extra permissions</p>
                        <span className="text-xs text-gray-400">
                            These are added on top of whatever the chosen role already grants
                        </span>
                    </div>
                    {loadingMeta && <p className="text-xs text-gray-400">Loading permission catalogue...</p>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
                        {moduleNames.map((mod) => {
                            const isOpen = expanded.has(mod);
                            const modPerms = permissionModules[mod];
                            const allSelected = modPerms.every((p) => selectedKeys.has(p.key));
                            const someSelected = modPerms.some((p) => selectedKeys.has(p.key));
                            return (
                                <div key={mod} className="border-b border-gray-50">
                                    <div className="flex items-center gap-2 py-2.5">
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(mod)}
                                            aria-label={isOpen ? `Collapse ${mod}` : `Expand ${mod}`}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <ChevronRight
                                                size={14}
                                                className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
                                            />
                                        </button>
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = someSelected && !allSelected;
                                            }}
                                            onChange={() => toggleModuleAll(mod)}
                                            className="accent-blue-600"
                                        />
                                        <label
                                            onClick={() => toggleExpand(mod)}
                                            className="text-sm text-gray-700 capitalize cursor-pointer select-none"
                                        >
                                            {mod.replace(/_/g, " ")}
                                        </label>
                                    </div>

                                    {isOpen && (
                                        <div className="pl-9 pb-3 flex flex-col gap-1.5">
                                            {modPerms.map((perm) => (
                                                <label
                                                    key={perm.key}
                                                    className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedKeys.has(perm.key)}
                                                        onChange={() => togglePermission(perm.key)}
                                                        className="accent-blue-600"
                                                    />
                                                    {perm.label}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

                <div className="flex gap-3 mt-6">
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`px-6 py-2.5 rounded-lg text-white text-sm font-semibold ${submitting ? "bg-emerald-300" : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                    >
                        {submitting ? "Adding..." : "Add User"}
                    </button>
                
                    <button
                        type="button"
                        onClick={() => router.push("/admin/Users/sub-admin")}
                        className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

}
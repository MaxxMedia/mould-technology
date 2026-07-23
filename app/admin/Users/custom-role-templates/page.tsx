"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Pencil, Trash2, X, ChevronRight, Power } from "lucide-react";

/* ============================================================
   Types — mirror the backend exactly (roleController.js /
   permissions.js). No "role-templates" concept exists on the
   backend — this is the Role model, so we talk to /api/admin/roles.
============================================================ */

interface Role {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    isSystem: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    userCount: number;
    permissionCount: number;
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

const emptyForm = {
    name: "",
    slug: "",
    description: "",
    sortOrder: "100",
};

export default function CustomRoleTemplatesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);

    // All permissions available in the system, grouped by module —
    // pulled live from the backend so this list never drifts out of
    // sync with src/lib/permissions.js.
    const [permissionModules, setPermissionModules] = useState<PermissionsByModule>({});
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);

    // Modal state — shared between "create" and "edit"
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    /* ---------------- Fetch roles ---------------- */
    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_URL}/api/admin/roles`, {
                headers: authHeaders(),
            });
            const data = await res.json();

            if (res.ok) {
                setRoles(data);
            } else {
                setError(data.error || "Failed to load roles");
            }
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }, []);

    /* ---------------- Fetch permissions catalogue (once) ---------------- */
    const fetchPermissions = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/permissions`, {
                headers: authHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setPermissionModules(data.modules || {});
                setPermissionsLoaded(true);
            }
        } catch {
            // Non-fatal — modal will just show no permission options if this fails.
        }
    }, []);

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, [fetchRoles, fetchPermissions]);

    /* ---------------- Delete ---------------- */
    async function handleDelete(role: Role) {
        if (role.isSystem) return; // backend rejects this anyway, guard in UI too
        if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;

        setBusyId(role.id);
        try {
            const res = await fetch(`${API_URL}/api/admin/roles/${role.id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setRoles((prev) => prev.filter((r) => r.id !== role.id));
            } else {
                alert(data.error || "Failed to delete role");
            }
        } catch {
            alert("Network error");
        } finally {
            setBusyId(null);
        }
    }

    /* ---------------- Toggle active/inactive ---------------- */
    async function handleToggleStatus(role: Role) {
        if (role.isSystem && role.isActive) return; // backend blocks deactivating system roles
        setBusyId(role.id);
        try {
            const res = await fetch(`${API_URL}/api/admin/roles/${role.id}/status`, {
                method: "PATCH",
                headers: authHeaders(),
                body: JSON.stringify({ isActive: !role.isActive }),
            });
            const data = await res.json();
            if (res.ok) {
                setRoles((prev) => prev.map((r) => (r.id === role.id ? data.role : r)));
            } else {
                alert(data.error || "Failed to update role status");
            }
        } catch {
            alert("Network error");
        } finally {
            setBusyId(null);
        }
    }

    /* ---------------- Open modal: create ---------------- */
    function openNewRoleModal() {
        setEditingRole(null);
        setForm(emptyForm);
        setSelectedKeys(new Set());
        setExpanded(new Set());
        setFormError("");
        setShowModal(true);
    }

    /* ---------------- Open modal: edit ---------------- */
    async function openEditRoleModal(role: Role) {
        setEditingRole(role);
        setForm({
            name: role.name,
            slug: role.slug,
            description: role.description || "",
            sortOrder: String(role.sortOrder),
        });
        setFormError("");
        setShowModal(true);

        // Pull the role's current default permissions so the checkboxes
        // reflect what's already granted.
        try {
            const res = await fetch(`${API_URL}/api/admin/roles/${role.id}/permissions`, {
                headers: authHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                const keys = new Set<string>(data.permissions.map((p: Permission) => p.key));
                setSelectedKeys(keys);
                // Auto-expand modules that already have selections
                const modulesToExpand = new Set<string>(
                    data.permissions.map((p: Permission) => p.module)
                );
                setExpanded(modulesToExpand);
            }
        } catch {
            setSelectedKeys(new Set());
        }
    }

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

    /* ---------------- Save (create or edit) ---------------- */
    async function handleSave() {
        setFormError("");
        if (!form.name.trim()) {
            setFormError("Display name is required.");
            return;
        }

        setSaving(true);
        try {
            if (editingRole) {
                // 1. Update metadata (name/description/sortOrder — slug is immutable)
                const metaRes = await fetch(`${API_URL}/api/admin/roles/${editingRole.id}`, {
                    method: "PUT",
                    headers: authHeaders(),
                    body: JSON.stringify({
                        name: form.name,
                        description: form.description,
                        sortOrder: Number(form.sortOrder) || 0,
                    }),
                });
                const metaData = await metaRes.json();
                if (!metaRes.ok) {
                    setFormError(metaData.error || "Failed to update role");
                    setSaving(false);
                    return;
                }

                // 2. Replace the role's default permission set
                const permRes = await fetch(
                    `${API_URL}/api/admin/roles/${editingRole.id}/permissions`,
                    {
                        method: "PUT",
                        headers: authHeaders(),
                        body: JSON.stringify({ permissions: Array.from(selectedKeys) }),
                    }
                );
                const permData = await permRes.json();
                if (!permRes.ok) {
                    setFormError(permData.error || "Failed to update role permissions");
                    setSaving(false);
                    return;
                }
            } else {
                // Create — name, optional slug, description, sortOrder, permissions
                const res = await fetch(`${API_URL}/api/admin/roles`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify({
                        name: form.name,
                        slug: form.slug || undefined,
                        description: form.description,
                        sortOrder: Number(form.sortOrder) || 0,
                        permissions: Array.from(selectedKeys),
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setFormError(data.error || "Failed to create role");
                    setSaving(false);
                    return;
                }
            }

            setShowModal(false);
            fetchRoles();
        } catch {
            setFormError("Network error");
        } finally {
            setSaving(false);
        }
    }

    const moduleNames = Object.keys(permissionModules).sort();

    return (
        <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Custom role templates</h1>
                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                        Define roles (e.g. Content Manager, Finance). Sub-admins pick a role and you can
                        still tweak their permissions individually.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={fetchRoles}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button
                        onClick={openNewRoleModal}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-sm font-semibold"
                    >
                        <Plus size={14} />
                        New role
                    </button>
                </div>
            </div>

            {/* Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">All roles</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Built-in roles are marked System and cannot be deleted or deactivated.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-100">
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Slug</th>
                                <th className="px-6 py-3 font-medium">Default permissions</th>
                                <th className="px-6 py-3 font-medium">Users</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                        Loading...
                                    </td>
                                </tr>
                            )}

                            {!loading && error && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && roles.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                        No role templates yet. Click "New role" to create one.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                !error &&
                                roles.map((r) => (
                                    <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-900">{r.name}</span>
                                            {r.isSystem && (
                                                <span className="ml-2 px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 text-[11px] font-medium align-middle">
                                                    System
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-amber-700 text-xs font-semibold tracking-wide">
                                                {r.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {r.permissionCount} item{r.permissionCount === 1 ? "" : "s"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{r.userCount}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-white text-xs font-semibold ${r.isActive ? "bg-emerald-600" : "bg-gray-400"
                                                    }`}
                                            >
                                                {r.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => openEditRoleModal(r)}
                                                    aria-label={`Edit ${r.name}`}
                                                    className="text-gray-500 hover:text-gray-800"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(r)}
                                                    disabled={busyId === r.id || (r.isSystem && r.isActive)}
                                                    aria-label={r.isActive ? `Deactivate ${r.name}` : `Activate ${r.name}`}
                                                    title={
                                                        r.isSystem && r.isActive
                                                            ? "System roles cannot be deactivated"
                                                            : r.isActive
                                                                ? "Deactivate"
                                                                : "Activate"
                                                    }
                                                    className="text-blue-500 hover:text-blue-600 disabled:opacity-30"
                                                >
                                                    <Power size={15} />
                                                </button>
                                                {!r.isSystem && (
                                                    <button
                                                        onClick={() => handleDelete(r)}
                                                        disabled={busyId === r.id || r.userCount > 0}
                                                        title={
                                                            r.userCount > 0
                                                                ? "Reassign users off this role before deleting"
                                                                : "Delete"
                                                        }
                                                        aria-label={`Delete ${r.name}`}
                                                        className="text-red-500 hover:text-red-600 disabled:opacity-30"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit role modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between px-6 pt-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingRole ? `Edit role — ${editingRole.name}` : "New role"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1 max-w-md">
                                    {editingRole
                                        ? "Slug cannot be changed after creation."
                                        : "Slug is generated from the name if left blank."}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-700 mb-1.5 block">Display name *</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700 mb-1.5 block">Slug</label>
                                    <input
                                        value={form.slug}
                                        onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toUpperCase() }))}
                                        placeholder="e.g. content_manager"
                                        disabled={!!editingRole}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-700 mb-1.5 block">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-700 mb-1.5 block">Sort order</label>
                                <input
                                    type="number"
                                    value={form.sortOrder}
                                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                                    className="w-32 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                />
                            </div>

                            <div>
                                <p className="text-sm text-gray-700 mb-3">
                                    Default permissions (applied when choosing this role for a sub-admin)
                                </p>
                                {!permissionsLoaded && (
                                    <p className="text-xs text-gray-400">Loading permission catalogue...</p>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                    {moduleNames.map((mod) => {
                                        const isOpen = expanded.has(mod);
                                        const modPerms = permissionModules[mod];
                                        const allSelected = modPerms.every((p) => selectedKeys.has(p.key));
                                        const someSelected = modPerms.some((p) => selectedKeys.has(p.key));
                                        return (
                                            <div key={mod} className="border-b border-gray-50">
                                                <div className="w-full flex items-center gap-2 py-2.5 text-left">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpand(mod)}
                                                        className="text-gray-400 shrink-0"
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
                                                        className="accent-gray-900"
                                                    />
                                                    <span
                                                        className="text-sm text-gray-700 capitalize cursor-pointer"
                                                        onClick={() => toggleExpand(mod)}
                                                    >
                                                        {mod.replace(/_/g, " ")}
                                                    </span>
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
                                                                    className="accent-gray-900"
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

                            {formError && <p className="text-red-600 text-sm">{formError}</p>}
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`px-5 py-2.5 rounded-lg text-white text-sm font-semibold ${saving ? "bg-gray-500" : "bg-gray-900 hover:bg-black"
                                    }`}
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
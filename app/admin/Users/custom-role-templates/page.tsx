"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Pencil, Trash2, X, ChevronRight } from "lucide-react";

interface RoleTemplate {
  id: number | string;
  name: string;
  slug: string;
  isSystem: boolean;
  defaultPermissionsCount: number;
  status: "Active" | "Inactive";
}

const actionTypes = ["View", "Create", "Edit", "Delete"];

const permissionColumns: string[][] = [
  ["Dashboard Overview", "Events Management", "Organizer Management", "Exhibitor Management", "Speaker Management", "Venue Management"],
  ["Visitor Management", "Inquiries & registrations", "Financial & Transactions", "Content Management", "Marketing & Communication", "Reports & Analytics"],
  ["Integrations", "User Roles & Permissions", "Settings & Configuration", "Help & Support", "My Performance"],
];

const emptyForm = {
  displayName: "",
  slug: "",
  description: "",
  sortOrder: "100",
  active: true,
};

export default function CustomRoleTemplatesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // New role modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/role-templates`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setRoles(data.roles ?? data);
      } else {
        setError(data.message || "Failed to load role templates");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  async function handleDelete(id: string | number) {
    if (!confirm("Delete this role template? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/role-templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRoles((prev) => prev.filter((r) => r.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to delete role template");
      }
    } catch {
      alert("Network error");
    } finally {
      setDeletingId(null);
    }
  }

  function openNewRoleModal() {
    setForm(emptyForm);
    setPermissions({});
    setExpanded(new Set());
    setFormError("");
    setShowModal(true);
  }

  function toggleExpand(module: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(module) ? next.delete(module) : next.add(module);
      return next;
    });
  }

  function toggleAction(module: string, action: string) {
    setPermissions((prev) => {
      const current = prev[module] ?? [];
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [module]: next };
    });
  }

  async function handleSave() {
    setFormError("");
    if (!form.displayName.trim()) {
      setFormError("Display name is required.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const selectedPermissions = Object.fromEntries(
        Object.entries(permissions).filter(([, actions]) => actions.length > 0)
      );
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/role-templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.displayName,
          slug: form.slug || undefined,
          description: form.description,
          sortOrder: Number(form.sortOrder) || 0,
          active: form.active,
          permissions: selectedPermissions,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setShowModal(false);
        fetchRoles();
      } else {
        setFormError(data.message || "Failed to create role");
      }
    } catch {
      setFormError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Custom role templates</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Define roles (e.g. Content Manager, Finance). Sub-admins pick a role and you can
            still tweak their permissions.
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
            Built-in roles are marked System and cannot be deleted.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium">Default permissions</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
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
                      {r.defaultPermissionsCount} items
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-gray-900 text-white text-xs font-semibold">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/admin/Users/custom-role-templates/${r.id}/edit`)}
                          aria-label={`Edit ${r.name}`}
                          className="text-gray-500 hover:text-gray-800"
                        >
                          <Pencil size={15} />
                        </button>
                        {!r.isSystem && (
                          <button
                            onClick={() => handleDelete(r.id)}
                            disabled={deletingId === r.id}
                            aria-label={`Delete ${r.name}`}
                            className="text-red-500 hover:text-red-600 disabled:opacity-50"
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

      {/* New role modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">New role</h2>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  Slug is used in the database (uppercase letters, numbers, underscores). Leave
                  blank to generate from name.
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
                    value={form.displayName}
                    onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1.5 block">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toUpperCase() }))}
                    placeholder="e.g. CONTENT_MANAGER"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
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

              <div className="flex items-end gap-6">
                <div>
                  <label className="text-sm text-gray-700 mb-1.5 block">Sort order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    className="w-32 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 pb-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    className="accent-gray-900"
                  />
                  Active
                </label>
              </div>

              <div>
                <p className="text-sm text-gray-700 mb-3">
                  Default permissions (applied when choosing this role for a sub-admin)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
                  {permissionColumns.map((col, i) => (
                    <div key={i}>
                      {col.map((mod) => {
                        const isOpen = expanded.has(mod);
                        return (
                          <div key={mod} className="border-b border-gray-50">
                            <button
                              type="button"
                              onClick={() => toggleExpand(mod)}
                              className="w-full flex items-start gap-2 py-2.5 text-left"
                            >
                              <ChevronRight
                                size={14}
                                className={`mt-0.5 text-gray-400 shrink-0 transition-transform ${
                                  isOpen ? "rotate-90" : ""
                                }`}
                              />
                              <span className="text-sm text-gray-700">{mod}</span>
                            </button>

                            {isOpen && (
                              <div className="pl-6 pb-3 flex flex-wrap gap-x-4 gap-y-1.5">
                                {actionTypes.map((action) => (
                                  <label
                                    key={action}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={permissions[mod]?.includes(action) ?? false}
                                      onChange={() => toggleAction(mod, action)}
                                      className="accent-gray-900"
                                    />
                                    {action}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
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
                className={`px-5 py-2.5 rounded-lg text-white text-sm font-semibold ${
                  saving ? "bg-gray-500" : "bg-gray-900 hover:bg-black"
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
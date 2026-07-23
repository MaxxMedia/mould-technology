"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";

const actionTypes = ["View", "Create", "Edit", "Delete"];

const permissionColumns: string[][] = [
  ["Dashboard Overview", "Events Management", "Organizer Management", "Exhibitor Management", "Speaker Management", "Venue Management"],
  ["Visitor Management", "Inquiries & registrations", "Financial & Transactions", "Content Management", "Marketing & Communication", "Reports & Analytics"],
  ["Integrations", "User Roles & Permissions", "Settings & Configuration", "Help & Support", "My Performance"],
];

const allModules = permissionColumns.flat();

function emptyAccess(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  allModules.forEach((m) => (map[m] = []));
  return map;
}

export default function AddNewSubAdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [permissions, setPermissions] = useState<Record<string, string[]>>(emptyAccess());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleExpand(module: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(module) ? next.delete(module) : next.add(module);
      return next;
    });
  }

  function toggleModule(module: string) {
    setPermissions((prev) => {
      const current = prev[module] ?? [];
      const isFullySelected = current.length === actionTypes.length;
      return { ...prev, [module]: isFullySelected ? [] : [...actionTypes] };
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

  function isModuleChecked(module: string) {
    return (permissions[module]?.length ?? 0) === actionTypes.length;
  }

  function isModuleIndeterminate(module: string) {
    const len = permissions[module]?.length ?? 0;
    return len > 0 && len < actionTypes.length;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    const hasAnyPermission = Object.values(permissions).some((actions) => actions.length > 0);
    if (!hasAnyPermission) {
      setError("Please select at least one permission for this sub admin.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/sub-admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, role: "Sub Admin", permissions }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/admin/Users/sub-admin");
      } else {
        setError(data.message || "Failed to add sub admin");
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

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
            <label className="text-sm text-gray-600">Sub admin name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
            <label className="text-sm text-gray-600">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Enter phone number"
              className="p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-4 border-b border-gray-100 py-4">
            <label className="text-sm text-gray-600">Role</label>
            <span className="w-fit px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
              Sub Admin
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">Permissions</p>
            <span className="text-xs text-gray-400">Select the modules and actions this sub admin can access</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
            {permissionColumns.map((col, i) => (
              <div key={i}>
                {col.map((mod) => {
                  const isOpen = expanded.has(mod);
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
                          checked={isModuleChecked(mod)}
                          ref={(el) => {
                            if (el) el.indeterminate = isModuleIndeterminate(mod);
                          }}
                          onChange={() => toggleModule(mod)}
                          className="accent-blue-600"
                        />
                        <label
                          onClick={() => toggleExpand(mod)}
                          className="text-sm text-gray-700 cursor-pointer select-none"
                        >
                          {mod}
                        </label>
                      </div>

                      {isOpen && (
                        <div className="pl-9 pb-3 flex flex-wrap gap-x-4 gap-y-1.5">
                          {actionTypes.map((action) => (
                            <label
                              key={action}
                              className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={permissions[mod]?.includes(action) ?? false}
                                onChange={() => toggleAction(mod, action)}
                                className="accent-blue-600"
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

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2.5 rounded-lg text-white text-sm font-semibold ${
              submitting ? "bg-emerald-300" : "bg-emerald-600 hover:bg-emerald-700"
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
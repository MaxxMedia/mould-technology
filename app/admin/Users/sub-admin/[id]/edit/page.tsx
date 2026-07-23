"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, ShieldCheck, ShieldMinus, ShieldPlus } from "lucide-react";

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

interface SubAdminDetail {
    id: number;
    email: string;
    fullName: string | null;
    roleId: number | null;
    isActive: boolean;
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

// Tri-state per permission key:
//   undefined -> no explicit override (inherits whatever the role says)
//   true      -> explicit GRANT override
//   false     -> explicit DENY override (blocks a role default)
type OverrideMap = Record<string, boolean | undefined>;

export default function EditSubAdminPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [form, setForm] = useState({ fullName: "", email: "", password: "" });
    const [roleId, setRoleId] = useState<string>("");
    const [roles, setRoles] = useState<Role[]>([]);

    const [permissionModules, setPermissionModules] = useState<PermissionsByModule>({});
    // What the CURRENTLY SELECTED role grants by default. Refetched
    // whenever `roleId` changes so switching roles in the dropdown
    // updates the effective-permission preview live, before saving.
    const [roleDefaultKeys, setRoleDefaultKeys] = useState<Set<string>>(new Set());
    const [loadingRoleDefaults, setLoadingRoleDefaults] = useState(false);

    const [overrides, setOverrides] = useState<OverrideMap>({});
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const allPermissions = useMemo(
        () => Object.values(permissionModules).flat(),
        [permissionModules]
    );

    /* ---------------- Initial load: sub-admin + roles + permission catalogue ---------------- */
    useEffect(() => {
        if (!id) return;

        async function load() {
            setLoading(true);
            setError("");
            try {
                const [subAdminRes, rolesRes, permsRes] = await Promise.all([
                    fetch(`${API_URL}/api/admin/sub-admins/${id}`, { headers: authHeaders() }),
                    fetch(`${API_URL}/api/admin/roles`, { headers: authHeaders() }),
                    fetch(`${API_URL}/api/admin/permissions`, { headers: authHeaders() }),
                ]);

                const subAdmin: SubAdminDetail = await subAdminRes.json();
                const rolesData = await rolesRes.json();
                const permsData = await permsRes.json();

                if (!subAdminRes.ok) {
                    setError((subAdmin as any).error || "Failed to load sub admin");
                    return;
                }

                setForm({ fullName: subAdmin.fullName || "", email: subAdmin.email, password: "" });
                setRoleId(subAdmin.roleId ? String(subAdmin.roleId) : "");

                if (rolesRes.ok) setRoles(rolesData.filter((r: Role) => r.isActive));
                if (permsRes.ok) setPermissionModules(permsData.modules || {});

                const initialOverrides: OverrideMap = {};
                subAdmin.permissionOverrides.forEach((o) => {
                    initialOverrides[o.key] = o.granted;
                });
                setOverrides(initialOverrides);
            } catch {
                setError("Network error");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    /* ---------------- Refetch the selected role's default permissions whenever it changes ---------------- */
    useEffect(() => {
        if (!roleId) {
            setRoleDefaultKeys(new Set());
            return;
        }
        let cancelled = false;
        setLoadingRoleDefaults(true);
        fetch(`${API_URL}/api/admin/roles/${roleId}/permissions`, { headers: authHeaders() })
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                if (data?.permissions) {
                    setRoleDefaultKeys(new Set(data.permissions.map((p: Permission) => p.key)));
                }
            })
            .finally(() => !cancelled && setLoadingRoleDefaults(false));
        return () => {
            cancelled = true;
        };
    }, [roleId]);

    // Auto-expand any module that has at least one effectively-active
    // permission, so the user sees what's already on without clicking around.
    useEffect(() => {
        const active = new Set<string>();
        Object.entries(permissionModules).forEach(([mod, perms]) => {
            if (perms.some((p) => isEffectivelyGranted(p.key))) active.add(mod);
        });
        setExpanded((prev) => new Set([...prev, ...active]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permissionModules, roleDefaultKeys, overrides]);

    function isEffectivelyGranted(key: string): boolean {
        const override = overrides[key];
        if (override !== undefined) return override; // explicit override always wins
        return roleDefaultKeys.has(key); // otherwise fall back to role default
    }

    function sourceLabel(key: string): "role" | "grant-override" | "deny-override" | "none" {
        const override = overrides[key];
        if (override === true) return "grant-override";
        if (override === false) return "deny-override";
        if (roleDefaultKeys.has(key)) return "role";
        return "none";
    }

    const effectiveCount = allPermissions.filter((p) => isEffectivelyGranted(p.key)).length;

    function toggleExpand(mod: string) {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(mod) ? next.delete(mod) : next.add(mod);
            return next;
        });
    }

    // Clicking a permission cycles it based on its current effective state:
    //   - if it's ON because of the role -> clicking sets an explicit DENY
    //   - if it's OFF (no role, no override) -> clicking sets an explicit GRANT
    //   - if there's already an explicit override -> clicking clears it,
    //     reverting back to whatever the role says
    function togglePermission(key: string) {
        setOverrides((prev) => {
            const next = { ...prev };
            const hasOverride = prev[key] !== undefined;

            if (hasOverride) {
                delete next[key]; // revert to role default
            } else if (roleDefaultKeys.has(key)) {
                next[key] = false; // explicitly deny a role-granted permission
            } else {
                next[key] = true; // explicitly grant a permission the role doesn't have
            }
            return next;
        });
    }

    function toggleModuleAll(mod: string) {
        const modPerms = permissionModules[mod] || [];
        const allOn = modPerms.every((p) => isEffectivelyGranted(p.key));
        setOverrides((prev) => {
            const next = { ...prev };
            modPerms.forEach((p) => {
                if (allOn) {
                    // turning module off: deny anything from the role, clear any grant override
                    if (roleDefaultKeys.has(p.key)) next[p.key] = false;
                    else delete next[p.key];
                } else {
                    // turning module on: grant anything not already covered by the role
                    if (roleDefaultKeys.has(p.key)) delete next[p.key];
                    else next[p.key] = true;
                }
            });
            return next;
        });
    }


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            // Profile update (unchanged)
            const profileBody: Record<string, unknown> = {
                fullName: form.fullName,
                email: form.email,
                roleId: roleId ? Number(roleId) : null,
            };
            if (form.password) profileBody.password = form.password;

            const profileRes = await fetch(`${API_URL}/api/admin/sub-admins/${id}`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify(profileBody),
            });
            const profileData = await profileRes.json();
            if (!profileRes.ok) {
                setError(profileData.error || "Failed to update sub admin");
                setSaving(false);
                return;
            }

            // ✅ FIX: send the `overrides` shape assignPermissions actually
            // reads — every key with an explicit true/false in the
            // OverrideMap, both grants AND denials in one array. This
            // REPLACES the full override set on the backend, so keys the
            // user reverted back to "role default" (i.e. removed from
            // `overrides` state via togglePermission) are correctly left
            // out here too.
            const overridesArray = Object.entries(overrides)
                .filter(([, granted]) => granted !== undefined)
                .map(([key, granted]) => ({ key, granted: granted as boolean }));

            const permRes = await fetch(`${API_URL}/api/admin/sub-admins/${id}/permissions`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify({ overrides: overridesArray }),
            });

            const permData = await permRes.json();
            if (!permRes.ok) {
                setError(permData.error || "Failed to update permissions");
                setSaving(false);
                return;
            }

            router.push("/admin/Users/sub-admin");
        } catch {
            setError("Network error");
        } finally {
            setSaving(false);
        }
    }

    const moduleNames = Object.keys(permissionModules).sort();

    if (loading) {
        return (
            <div className="px-4 md:px-8 py-10 max-w-6xl mx-auto text-center text-gray-400">
                Loading...
            </div>
        );
    }

    return (
        <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Edit Sub Admin</h1>
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
                    EDIT SUB ADMIN
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
                            className="p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-center gap-4 border-b border-gray-100 py-4">
                        <label className="text-sm text-gray-600">Email *</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            className="p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-center gap-4 border-b border-gray-100 py-4">
                        <label className="text-sm text-gray-600">New password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            placeholder="Leave blank to keep current password"
                            className="p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-center gap-4 border-b border-gray-100 py-4">
                        <label className="text-sm text-gray-600">Role</label>
                        <select
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
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

                {/* Effective permission summary */}
                <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-100">
                    <ShieldCheck size={18} className="text-blue-600 shrink-0" />
                    <p className="text-sm text-blue-900">
                        <span className="font-bold">
                            {effectiveCount} of {allPermissions.length}
                        </span>{" "}
                        permissions are currently active for this account
                        {loadingRoleDefaults ? " (updating for selected role...)" : ""}.
                    </p>
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-600">Permissions</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="inline-flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> from role
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <ShieldPlus size={12} className="text-emerald-600" /> granted override
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <ShieldMinus size={12} className="text-red-500" /> denied override
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
                        {moduleNames.map((mod) => {
                            const isOpen = expanded.has(mod);
                            const modPerms = permissionModules[mod];
                            const onCount = modPerms.filter((p) => isEffectivelyGranted(p.key)).length;
                            const allOn = onCount === modPerms.length;
                            const someOn = onCount > 0;
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
                                            checked={allOn}
                                            ref={(el) => {
                                                if (el) el.indeterminate = someOn && !allOn;
                                            }}
                                            onChange={() => toggleModuleAll(mod)}
                                            className="accent-blue-600"
                                        />
                                        <label
                                            onClick={() => toggleExpand(mod)}
                                            className="text-sm text-gray-700 capitalize cursor-pointer select-none flex-1"
                                        >
                                            {mod.replace(/_/g, " ")}
                                        </label>
                                        <span className="text-[11px] text-gray-400 pr-1">
                                            {onCount}/{modPerms.length}
                                        </span>
                                    </div>

                                    {isOpen && (
                                        <div className="pl-9 pb-3 flex flex-col gap-1.5">
                                            {modPerms.map((perm) => {
                                                const source = sourceLabel(perm.key);
                                                const on = isEffectivelyGranted(perm.key);
                                                return (
                                                    <label
                                                        key={perm.key}
                                                        className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={on}
                                                            onChange={() => togglePermission(perm.key)}
                                                            className="accent-blue-600"
                                                        />
                                                        <span className={source === "deny-override" ? "line-through text-gray-400" : ""}>
                                                            {perm.label}
                                                        </span>
                                                        {source === "role" && (
                                                            <span className="text-[10px] text-gray-400 border border-gray-200 rounded px-1">
                                                                role
                                                            </span>
                                                        )}
                                                        {source === "grant-override" && (
                                                            <span className="text-[10px] text-emerald-700 border border-emerald-200 bg-emerald-50 rounded px-1">
                                                                +override
                                                            </span>
                                                        )}
                                                        {source === "deny-override" && (
                                                            <span className="text-[10px] text-red-600 border border-red-200 bg-red-50 rounded px-1">
                                                                denied
                                                            </span>
                                                        )}
                                                    </label>
                                                );
                                            })}
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
                        disabled={saving}
                        className={`px-6 py-2.5 rounded-lg text-white text-sm font-semibold ${saving ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {saving ? "Saving..." : "Save Changes"}
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
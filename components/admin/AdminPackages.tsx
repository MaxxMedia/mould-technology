"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Save, ToggleLeft, ToggleRight, X, RotateCcw } from "lucide-react";

// ⚠️ Adjust this if your app stores the token under a different localStorage key
const TOKEN_KEY = "token";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Package = {
    id: string;
    name: string;
    type: "SUBSCRIPTION" | "BANNER" | "SPONSORED" | "RECRUITMENT";
    price: number;
    billingCycle: "MONTHLY" | "QUARTERLY" | "ANNUAL" | "ONE_TIME";
    description: string | null;
    badge: string | null;
    displayOrder: number;
    isHighlighted: boolean;
    isActive: boolean;
    metadata: any;
    fromFallback?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

type Draft = {
    name: string;
    price: string;
    description: string;
    badge: string;
    displayOrder: string;
    isHighlighted: boolean;
    isActive: boolean;
    // BANNER only
    monthly?: string;
    quarterly?: string;
    annual?: string;
    // SPONSORED only
    features?: string; // newline-separated in the textarea
    // RECRUITMENT only
    durationDays?: string;
};

// Value for a single cell in the plan features matrix.
// true/false = simple include/exclude, string = custom label like "10 Images" or "Unlimited"
type FeatureValue = boolean | string;
type PlanId = "free" | "basic" | "professional" | "enterprise";
type FeatureMatrix = Record<string, Record<PlanId, FeatureValue>>;

const PLAN_IDS: PlanId[] = ["free", "basic", "professional", "enterprise"];
const PLAN_LABELS: Record<PlanId, string> = {
    free: "Free",
    basic: "Basic",
    professional: "Professional",
    enterprise: "Enterprise",
};

// Seed rows shown the first time, before any DB overrides exist.
// Mirrors the shared feature matrix — used only as a starting point,
// since the real data now lives on each SUBSCRIPTION package's metadata.features.
const DEFAULT_FEATURE_NAMES = [
    "Company Profile",
    "Company Logo",
    "Cover Banner",
    "Company Description",
    "Contact Details",
    "Website Link",
    "Google Map",
    "WhatsApp Button",
    "Company Gallery",
    "Factory Images",
    "Product Categories",
    "Product Listings",
    "Product Images",
    "Product Videos",
    "Product Catalogues (PDF)",
    "Company Brochure",
    "Certifications Display",
    "Brands Represented",
    "Industries Served",
    "Export Markets",
    "Manufacturing Capabilities",
    "Machinery List",
    "Quality Standards",
    "Team Profiles",
    "Verified Supplier Badge",
    "Technical Articles",
    "Product Launch Announcements",
    "Job Postings",
    "Internship Listings",
    "Featured Job",
    "Company Career Page",
    "Resume Download",
    "RFQ Leads",
    "Quote Request Form",
    "Lead Notifications",
    "Search Ranking",
    "Featured in Category",
    "Homepage Featured",
    "Newsletter Promotion",
    "Social Media Promotion",
    "Homepage Spotlight",
    "Trending Supplier Badge",
    "Homepage Hero Banner",
    "Homepage Sidebar",
    "Category Banner",
    "Article Banner",
    "Sticky Banner",
    "Factory Visit Feature",
    "Product Demo Video on Home Page",
    "Email Support",
    "Phone Support",
    "Dedicated Account Manager",
];

const formatInr = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount || 0);

function draftFromPackage(pkg: Package): Draft {
    return {
        name: pkg.name,
        price: String(pkg.price ?? 0),
        description: pkg.description || "",
        badge: pkg.badge || "",
        displayOrder: String(pkg.displayOrder ?? 0),
        isHighlighted: !!pkg.isHighlighted,
        isActive: pkg.isActive !== false,
        monthly: pkg.metadata?.monthly !== undefined ? String(pkg.metadata.monthly) : "",
        quarterly: pkg.metadata?.quarterly !== undefined ? String(pkg.metadata.quarterly) : "",
        annual: pkg.metadata?.annual !== undefined ? String(pkg.metadata.annual) : "",
        features: Array.isArray(pkg.metadata?.features) ? pkg.metadata.features.join("\n") : "",
        durationDays: pkg.metadata?.durationDays !== undefined ? String(pkg.metadata.durationDays) : "",
    };
}

function isDirty(pkg: Package, draft: Draft): boolean {
    const original = draftFromPackage(pkg);
    return JSON.stringify(original) !== JSON.stringify(draft);
}

async function apiFetch(path: string, options: RequestInit = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

    const headers: HeadersInit = {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    let data: any = null;
    try {
        data = await res.json();
    } catch {
        // non-JSON response
    }

    if (res.status === 401) {
        throw new Error(data?.error || "Not authorized. Please log in again.");
    }

    return { res, data };
}

function draftToMetadata(type: Package["type"], draft: Draft) {
    if (type === "BANNER") {
        return {
            monthly: draft.monthly ? Number(draft.monthly) : undefined,
            quarterly: draft.quarterly ? Number(draft.quarterly) : undefined,
            annual: draft.annual ? Number(draft.annual) : undefined,
        };
    }
    if (type === "SPONSORED") {
        return {
            features: (draft.features || "")
                .split("\n")
                .map((f) => f.trim())
                .filter(Boolean),
        };
    }
    if (type === "RECRUITMENT") {
        return {
            durationDays: draft.durationDays ? Number(draft.durationDays) : undefined,
        };
    }
    return null;
}

// Build the initial feature matrix from whatever the 4 SUBSCRIPTION
// packages currently have in metadata.features, falling back to the
// default seed list for any feature name that isn't present yet.
function buildFeatureMatrix(subscriptionPackages: Package[]): FeatureMatrix {
    const matrix: FeatureMatrix = {};

    const nameSet = new Set<string>(DEFAULT_FEATURE_NAMES);
    subscriptionPackages.forEach((pkg) => {
        const features = pkg.metadata?.features;
        if (features && typeof features === "object" && !Array.isArray(features)) {
            Object.keys(features).forEach((name) => nameSet.add(name));
        }
    });

    nameSet.forEach((name) => {
        matrix[name] = { free: false, basic: false, professional: false, enterprise: false };
        subscriptionPackages.forEach((pkg) => {
            const planId = pkg.id as PlanId;
            if (!PLAN_IDS.includes(planId)) return;
            const features = pkg.metadata?.features;
            const val = features && typeof features === "object" ? features[name] : undefined;
            if (val !== undefined) {
                matrix[name][planId] = val;
            }
        });
    });

    return matrix;
}

export default function AdminPackages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [drafts, setDrafts] = useState<Record<string, Draft>>({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [savingFeatures, setSavingFeatures] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fromFallback, setFromFallback] = useState(false);

    // "Add new package" quick form
    const [addingType, setAddingType] = useState<Package["type"] | null>(null);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            setError("");
            const { data } = await apiFetch("/api/admin/packages?includeInactive=true");

            if (data?.success) {
                setPackages(data.data);
                setFromFallback(data.fromFallback || false);
                const nextDrafts: Record<string, Draft> = {};
                data.data.forEach((pkg: Package) => {
                    nextDrafts[pkg.id] = draftFromPackage(pkg);
                });
                setDrafts(nextDrafts);
            } else {
                setError(data?.error || "Failed to load packages");
            }
        } catch (err: any) {
            setError(err.message || "Failed to load packages");
        } finally {
            setLoading(false);
        }
    };

    const grouped = useMemo(() => {
        const sorted = [...packages].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        return {
            SUBSCRIPTION: sorted.filter((p) => p.type === "SUBSCRIPTION"),
            BANNER: sorted.filter((p) => p.type === "BANNER"),
            SPONSORED: sorted.filter((p) => p.type === "SPONSORED"),
            RECRUITMENT: sorted.filter((p) => p.type === "RECRUITMENT"),
        };
    }, [packages]);

    const setDraftField = (id: string, field: keyof Draft, value: string | boolean) => {
        setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } as Draft }));
    };

    const resetDraft = (pkg: Package) => {
        setDrafts((prev) => ({ ...prev, [pkg.id]: draftFromPackage(pkg) }));
    };

    const buildPayload = (pkg: Package, draft: Draft, overrides: Record<string, any> = {}) => ({
        id: pkg.id,
        name: draft.name.trim(),
        type: pkg.type,
        price: Number(draft.price) || 0,
        billingCycle: pkg.billingCycle,
        description: draft.description.trim() || null,
        badge: draft.badge.trim() || null,
        displayOrder: Number(draft.displayOrder) || 0,
        isHighlighted: draft.isHighlighted,
        isActive: draft.isActive,
        metadata: draftToMetadata(pkg.type, draft),
        ...overrides,
    });

    const handleSave = async (pkg: Package) => {
        const draft = drafts[pkg.id];
        if (!draft) return;
        setSavingId(pkg.id);
        setError("");
        try {
            const { data } = await apiFetch("/api/admin/packages", {
                method: "POST",
                body: JSON.stringify(buildPayload(pkg, draft)),
            });
            if (data?.success) {
                setSuccess(`${draft.name} saved`);
                await fetchPackages();
                setTimeout(() => setSuccess(""), 2500);
            } else {
                setError(data?.error || "Failed to save package");
            }
        } catch (err: any) {
            setError(err.message || "Failed to save package");
        } finally {
            setSavingId(null);
        }
    };

    const handleToggle = async (pkg: Package) => {
        const draft = drafts[pkg.id] || draftFromPackage(pkg);
        setSavingId(pkg.id);
        setError("");
        try {
            const { data } = await apiFetch("/api/admin/packages", {
                method: "POST",
                body: JSON.stringify(buildPayload(pkg, draft, { isActive: !pkg.isActive })),
            });
            if (data?.success) {
                setSuccess(`${pkg.name} ${!pkg.isActive ? "activated" : "deactivated"}`);
                await fetchPackages();
                setTimeout(() => setSuccess(""), 2500);
            } else {
                setError(data?.error || "Failed to toggle status");
            }
        } catch (err: any) {
            setError(err.message || "Failed to toggle status");
        } finally {
            setSavingId(null);
        }
    };

    const handleDelete = async (pkg: Package) => {
        if (!confirm(`Delete "${pkg.name}"? This can't be undone.`)) return;
        setSavingId(pkg.id);
        setError("");
        try {
            if (pkg.fromFallback) {
                // Materialize into a DB row first — you can't delete something
                // that only exists as hardcoded fallback data.
                const draft = drafts[pkg.id] || draftFromPackage(pkg);
                await apiFetch("/api/admin/packages", {
                    method: "POST",
                    body: JSON.stringify(buildPayload(pkg, draft)),
                });
            }
            const { data } = await apiFetch(`/api/admin/packages/${pkg.id}`, { method: "DELETE" });
            if (data?.success) {
                setSuccess("Package deleted");
                await fetchPackages();
                setTimeout(() => setSuccess(""), 2500);
            } else {
                setError(data?.error || "Failed to delete package");
            }
        } catch (err: any) {
            setError(err.message || "Failed to delete package");
        } finally {
            setSavingId(null);
        }
    };

    const handleAddNew = async () => {
        if (!addingType || !newName.trim()) return;
        const id = newName.trim().toLowerCase().replace(/\s+/g, "-");
        const billingCycle =
            addingType === "SUBSCRIPTION" ? "ANNUAL" :
                addingType === "BANNER" ? "ANNUAL" :
                    addingType === "RECRUITMENT" ? "MONTHLY" : "ONE_TIME";

        setError("");
        try {
            const { data } = await apiFetch("/api/admin/packages", {
                method: "POST",
                body: JSON.stringify({
                    id,
                    name: newName.trim(),
                    type: addingType,
                    price: Number(newPrice) || 0,
                    billingCycle,
                    description: null,
                    badge: null,
                    displayOrder: 99,
                    isHighlighted: false,
                    isActive: true,
                    metadata: addingType === "BANNER" ? { monthly: 0, quarterly: 0, annual: 0 } : null,
                }),
            });
            if (data?.success) {
                setSuccess(`${newName} created`);
                setAddingType(null);
                setNewName("");
                setNewPrice("");
                await fetchPackages();
                setTimeout(() => setSuccess(""), 2500);
            } else {
                setError(data?.error || "Failed to create package");
            }
        } catch (err: any) {
            setError(err.message || "Failed to create package");
        }
    };

    // Save the full plan features matrix. Writes metadata.features onto
    // each of the 4 SUBSCRIPTION packages (free/basic/professional/enterprise),
    // preserving every other field on that package as-is.
    const handleSaveFeatureMatrix = async (matrix: FeatureMatrix) => {
        setSavingFeatures(true);
        setError("");
        try {
            for (const planId of PLAN_IDS) {
                const pkg = grouped.SUBSCRIPTION.find((p) => p.id === planId);
                if (!pkg) continue;

                const featuresForPlan: Record<string, FeatureValue> = {};
                Object.entries(matrix).forEach(([featureName, values]) => {
                    featuresForPlan[featureName] = values[planId];
                });

                const { data } = await apiFetch("/api/admin/packages", {
                    method: "POST",
                    body: JSON.stringify({
                        id: pkg.id,
                        name: pkg.name,
                        type: pkg.type,
                        price: pkg.price,
                        billingCycle: pkg.billingCycle,
                        description: pkg.description,
                        badge: pkg.badge,
                        displayOrder: pkg.displayOrder,
                        isHighlighted: pkg.isHighlighted,
                        isActive: pkg.isActive,
                        metadata: { ...(pkg.metadata || {}), features: featuresForPlan },
                    }),
                });

                if (!data?.success) {
                    throw new Error(data?.error || `Failed to save features for ${pkg.name}`);
                }
            }
            setSuccess("Plan features saved");
            await fetchPackages();
            setTimeout(() => setSuccess(""), 2500);
        } catch (err: any) {
            setError(err.message || "Failed to save plan features");
        } finally {
            setSavingFeatures(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading packages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Packages</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        This mirrors the live pricing page layout — edit fields directly, then Save.
                        Items tagged <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Fallback</span> aren't
                        in the database yet; saving or toggling them creates the DB row.
                    </p>
                </div>
                {fromFallback && (
                    <span className="shrink-0 px-3 py-1.5 text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md">
                        ⚠️ No DB overrides yet — showing fallback defaults
                    </span>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center justify-between">
                    <span className="text-sm">{error}</span>
                    <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center justify-between">
                    <span className="text-sm">{success}</span>
                    <button onClick={() => setSuccess("")} className="text-green-700 hover:text-green-900">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ============ SUBSCRIPTION ============ */}
            <section>
                <SectionHeader
                    title="Subscription Plans"
                    subtitle="Annual membership plans — mirrors the pricing page table"
                    onAdd={() => setAddingType("SUBSCRIPTION")}
                />
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="min-w-[900px] w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-gray-800 text-white">
                                <th className="px-4 py-3 text-xs font-semibold uppercase">Field</th>
                                {grouped.SUBSCRIPTION.map((pkg) => (
                                    <th key={pkg.id} className="px-4 py-3 text-xs font-semibold uppercase text-center min-w-[180px]">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {pkg.name}
                                            {pkg.fromFallback && (
                                                <span className="px-1.5 py-0.5 text-[10px] bg-gray-600 rounded">Fallback</span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <EditableRow label="Name" packages={grouped.SUBSCRIPTION} drafts={drafts}
                                render={(pkg, draft) => (
                                    <input className="admin-input" value={draft.name}
                                        onChange={(e) => setDraftField(pkg.id, "name", e.target.value)} />
                                )} />
                            <EditableRow label="Price / year" packages={grouped.SUBSCRIPTION} drafts={drafts}
                                render={(pkg, draft) => (
                                    <input type="number" className="admin-input" value={draft.price}
                                        onChange={(e) => setDraftField(pkg.id, "price", e.target.value)} />
                                )} />
                            <EditableRow label="Badge" packages={grouped.SUBSCRIPTION} drafts={drafts}
                                render={(pkg, draft) => (
                                    <input className="admin-input" placeholder="e.g. Most Popular" value={draft.badge}
                                        onChange={(e) => setDraftField(pkg.id, "badge", e.target.value)} />
                                )} />
                            <EditableRow label="Highlighted" packages={grouped.SUBSCRIPTION} drafts={drafts}
                                render={(pkg, draft) => (
                                    <input type="checkbox" checked={draft.isHighlighted}
                                        onChange={(e) => setDraftField(pkg.id, "isHighlighted", e.target.checked)} />
                                )} />
                            <EditableRow label="Active" packages={grouped.SUBSCRIPTION} drafts={drafts}
                                render={(pkg, draft) => (
                                    <input type="checkbox" checked={draft.isActive}
                                        onChange={(e) => setDraftField(pkg.id, "isActive", e.target.checked)} />
                                )} />
                            <EditableRow label="Order" packages={grouped.SUBSCRIPTION} drafts={drafts}
                                render={(pkg, draft) => (
                                    <input type="number" className="admin-input" value={draft.displayOrder}
                                        onChange={(e) => setDraftField(pkg.id, "displayOrder", e.target.value)} />
                                )} />
                            <ActionRow packages={grouped.SUBSCRIPTION} drafts={drafts} savingId={savingId}
                                onSave={handleSave} onToggle={handleToggle} onDelete={handleDelete} onReset={resetDraft} />
                        </tbody>
                    </table>
                </div>

                {/* ---- Plan Features Matrix ---- */}
                <div className="mt-6">
                    {grouped.SUBSCRIPTION.length === PLAN_IDS.length ? (
                        <PlanFeaturesMatrix
                            subscriptionPackages={grouped.SUBSCRIPTION}
                            saving={savingFeatures}
                            onSave={handleSaveFeatureMatrix}
                        />
                    ) : (
                        <p className="text-xs text-gray-400">
                            Plan features matrix needs all four plans (free, basic, professional, enterprise) to be present.
                        </p>
                    )}
                </div>
            </section>

            {/* ============ BANNER ============ */}
            <section>
                <SectionHeader title="Banner Advertising Packages" subtitle="Premium placements" onAdd={() => setAddingType("BANNER")} />
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                    <table className="min-w-[800px] w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-gray-800 text-white">
                                <th className="px-4 py-3 text-xs font-semibold uppercase">Position</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center">Monthly</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center">Quarterly</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center">Annual</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center">Active</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grouped.BANNER.map((pkg, i) => {
                                const draft = drafts[pkg.id];
                                if (!draft) return null;
                                const dirty = isDirty(pkg, draft);
                                return (
                                    <tr key={pkg.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <input className="admin-input" value={draft.name}
                                                    onChange={(e) => setDraftField(pkg.id, "name", e.target.value)} />
                                                {pkg.fromFallback && (
                                                    <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded shrink-0">Fallback</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input type="number" className="admin-input text-center" value={draft.monthly}
                                                onChange={(e) => setDraftField(pkg.id, "monthly", e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input type="number" className="admin-input text-center" value={draft.quarterly}
                                                onChange={(e) => setDraftField(pkg.id, "quarterly", e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input type="number" className="admin-input text-center" value={draft.annual}
                                                onChange={(e) => setDraftField(pkg.id, "annual", e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input type="checkbox" checked={draft.isActive}
                                                onChange={(e) => setDraftField(pkg.id, "isActive", e.target.checked)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <RowActions pkg={pkg} dirty={dirty} saving={savingId === pkg.id}
                                                onSave={() => handleSave(pkg)} onToggle={() => handleToggle(pkg)}
                                                onDelete={() => handleDelete(pkg)} onReset={() => resetDraft(pkg)} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============ SPONSORED ============ */}
            <section>
                <SectionHeader title="Sponsored Content Packages" subtitle="Editorial & digital campaigns" onAdd={() => setAddingType("SPONSORED")} />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {grouped.SPONSORED.map((pkg) => {
                        const draft = drafts[pkg.id];
                        if (!draft) return null;
                        const dirty = isDirty(pkg, draft);
                        return (
                            <div key={pkg.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <input className="admin-input font-semibold text-lg" value={draft.name}
                                        onChange={(e) => setDraftField(pkg.id, "name", e.target.value)} />
                                    {pkg.fromFallback && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded shrink-0 ml-2">Fallback</span>
                                    )}
                                </div>
                                <label className="text-xs text-gray-500 mt-2">Description</label>
                                <input className="admin-input" value={draft.description}
                                    onChange={(e) => setDraftField(pkg.id, "description", e.target.value)} />
                                <label className="text-xs text-gray-500 mt-3">Price (₹)</label>
                                <input type="number" className="admin-input" value={draft.price}
                                    onChange={(e) => setDraftField(pkg.id, "price", e.target.value)} />
                                <label className="text-xs text-gray-500 mt-3">Badge</label>
                                <input className="admin-input" placeholder="e.g. Best Value" value={draft.badge}
                                    onChange={(e) => setDraftField(pkg.id, "badge", e.target.value)} />
                                <label className="text-xs text-gray-500 mt-3">Features (one per line)</label>
                                <textarea className="admin-input min-h-[100px]" value={draft.features}
                                    onChange={(e) => setDraftField(pkg.id, "features", e.target.value)} />
                                <div className="flex items-center gap-4 mt-3 text-sm">
                                    <label className="flex items-center gap-1.5">
                                        <input type="checkbox" checked={draft.isHighlighted}
                                            onChange={(e) => setDraftField(pkg.id, "isHighlighted", e.target.checked)} />
                                        Highlighted
                                    </label>
                                    <label className="flex items-center gap-1.5">
                                        <input type="checkbox" checked={draft.isActive}
                                            onChange={(e) => setDraftField(pkg.id, "isActive", e.target.checked)} />
                                        Active
                                    </label>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <RowActions pkg={pkg} dirty={dirty} saving={savingId === pkg.id}
                                        onSave={() => handleSave(pkg)} onToggle={() => handleToggle(pkg)}
                                        onDelete={() => handleDelete(pkg)} onReset={() => resetDraft(pkg)} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ============ RECRUITMENT ============ */}
            <section>
                <SectionHeader title="Recruitment Packages" subtitle="Monthly job posting" onAdd={() => setAddingType("RECRUITMENT")} />
                <div className="space-y-4 max-w-xl">
                    {grouped.RECRUITMENT.map((pkg) => {
                        const draft = drafts[pkg.id];
                        if (!draft) return null;
                        const dirty = isDirty(pkg, draft);
                        return (
                            <div key={pkg.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <input className="admin-input font-semibold text-lg" value={draft.name}
                                        onChange={(e) => setDraftField(pkg.id, "name", e.target.value)} />
                                    {pkg.fromFallback && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded shrink-0 ml-2">Fallback</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Price (₹)</label>
                                        <input type="number" className="admin-input" value={draft.price}
                                            onChange={(e) => setDraftField(pkg.id, "price", e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Duration (days)</label>
                                        <input type="number" className="admin-input" value={draft.durationDays}
                                            onChange={(e) => setDraftField(pkg.id, "durationDays", e.target.value)} />
                                    </div>
                                </div>
                                <label className="flex items-center gap-1.5 mt-3 text-sm">
                                    <input type="checkbox" checked={draft.isActive}
                                        onChange={(e) => setDraftField(pkg.id, "isActive", e.target.checked)} />
                                    Active
                                </label>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <RowActions pkg={pkg} dirty={dirty} saving={savingId === pkg.id}
                                        onSave={() => handleSave(pkg)} onToggle={() => handleToggle(pkg)}
                                        onDelete={() => handleDelete(pkg)} onReset={() => resetDraft(pkg)} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ============ ADD NEW MODAL ============ */}
            {addingType && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-sm w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Add {addingType.charAt(0) + addingType.slice(1).toLowerCase()} Package</h2>
                            <button onClick={() => setAddingType(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <label className="text-xs text-gray-500">Name</label>
                        <input className="admin-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Platinum" />
                        <label className="text-xs text-gray-500 mt-3 block">Starting Price (₹)</label>
                        <input type="number" className="admin-input" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0" />
                        <div className="flex gap-3 pt-5">
                            <button onClick={handleAddNew} disabled={!newName.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                                Create
                            </button>
                            <button onClick={() => setAddingType(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .admin-input {
                    width: 100%;
                    padding: 0.375rem 0.5rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                }
                .admin-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
                }
            `}</style>
        </div>
    );
}

function SectionHeader({ title, subtitle, onAdd }: { title: string; subtitle: string; onAdd: () => void }) {
    return (
        <div className="flex justify-between items-end mb-4">
            <div>
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
            <button onClick={onAdd} className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" /> Add
            </button>
        </div>
    );
}

function EditableRow({
    label, packages, drafts, render,
}: {
    label: string;
    packages: Package[];
    drafts: Record<string, Draft>;
    render: (pkg: Package, draft: Draft) => React.ReactNode;
}) {
    return (
        <tr className="border-t border-gray-100">
            <td className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{label}</td>
            {packages.map((pkg) => {
                const draft = drafts[pkg.id];
                if (!draft) return <td key={pkg.id} className="px-4 py-3" />;
                return (
                    <td key={pkg.id} className="px-4 py-3 text-center">
                        {render(pkg, draft)}
                    </td>
                );
            })}
        </tr>
    );
}

function ActionRow({
    packages, drafts, savingId, onSave, onToggle, onDelete, onReset,
}: {
    packages: Package[];
    drafts: Record<string, Draft>;
    savingId: string | null;
    onSave: (pkg: Package) => void;
    onToggle: (pkg: Package) => void;
    onDelete: (pkg: Package) => void;
    onReset: (pkg: Package) => void;
}) {
    return (
        <tr className="border-t border-gray-100 bg-gray-50">
            <td className="px-4 py-3 text-xs font-medium text-gray-500">Actions</td>
            {packages.map((pkg) => {
                const draft = drafts[pkg.id];
                if (!draft) return <td key={pkg.id} className="px-4 py-3" />;
                const dirty = isDirty(pkg, draft);
                return (
                    <td key={pkg.id} className="px-4 py-3">
                        <RowActions pkg={pkg} dirty={dirty} saving={savingId === pkg.id}
                            onSave={() => onSave(pkg)} onToggle={() => onToggle(pkg)}
                            onDelete={() => onDelete(pkg)} onReset={() => onReset(pkg)} />
                    </td>
                );
            })}
        </tr>
    );
}

function RowActions({
    pkg, dirty, saving, onSave, onToggle, onDelete, onReset,
}: {
    pkg: Package;
    dirty: boolean;
    saving: boolean;
    onSave: () => void;
    onToggle: () => void;
    onDelete: () => void;
    onReset: () => void;
}) {
    return (
        <div className="flex items-center justify-center gap-2">
            <button onClick={onSave} disabled={!dirty || saving} title="Save changes"
                className="p-1.5 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
                <Save className="w-3.5 h-3.5" />
            </button>
            {dirty && (
                <button onClick={onReset} title="Discard changes" className="p-1.5 rounded-md text-gray-500 hover:text-gray-700">
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>
            )}
            <button onClick={onToggle} disabled={saving} title={pkg.isActive ? "Deactivate" : "Activate"}
                className="p-1.5 rounded-md text-gray-600 hover:text-blue-600 disabled:opacity-40">
                {pkg.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
            <button onClick={onDelete} disabled={saving} title="Delete"
                className="p-1.5 rounded-md text-gray-600 hover:text-red-600 disabled:opacity-40">
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

// A single editable cell in the features matrix.
// Checkbox toggles include/exclude; when included, an optional text
// field lets you give it a custom label like "10 Images" or "Unlimited".
function FeatureCell({
    value, onChange,
}: {
    value: FeatureValue;
    onChange: (next: FeatureValue) => void;
}) {
    const included = value !== false && value !== undefined && value !== "";
    const textValue = typeof value === "string" ? value : "";

    return (
        <div className="flex items-center justify-center gap-1.5">
            <input
                type="checkbox"
                checked={included}
                onChange={(e) => onChange(e.target.checked ? (textValue || true) : false)}
                title={included ? "Included in this plan" : "Not included"}
            />
            {included && (
                <input
                    className="admin-input text-center"
                    style={{ minWidth: 80 }}
                    placeholder="Yes"
                    value={textValue}
                    onChange={(e) => onChange(e.target.value === "" ? true : e.target.value)}
                />
            )}
        </div>
    );
}

// Editable table: rows = features, columns = plans (free/basic/professional/enterprise).
// Lets admins see and edit exactly what each subscription plan includes,
// add new feature rows, remove rows, and save the whole matrix at once.
function PlanFeaturesMatrix({
    subscriptionPackages, saving, onSave,
}: {
    subscriptionPackages: Package[];
    saving: boolean;
    onSave: (matrix: FeatureMatrix) => void;
}) {
    const [matrix, setMatrix] = useState<FeatureMatrix>(() => buildFeatureMatrix(subscriptionPackages));
    const [newFeatureName, setNewFeatureName] = useState("");

    // Re-sync local matrix whenever the underlying packages change
    // (e.g. after a save + refetch), so the table reflects saved state.
    useEffect(() => {
        setMatrix(buildFeatureMatrix(subscriptionPackages));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(subscriptionPackages.map((p) => [p.id, p.metadata?.features]))]);

    const featureNames = Object.keys(matrix);

    const setCell = (featureName: string, planId: PlanId, value: FeatureValue) => {
        setMatrix((prev) => ({
            ...prev,
            [featureName]: { ...prev[featureName], [planId]: value },
        }));
    };

    const removeFeature = (featureName: string) => {
        setMatrix((prev) => {
            const next = { ...prev };
            delete next[featureName];
            return next;
        });
    };

    const addFeature = () => {
        const name = newFeatureName.trim();
        if (!name || matrix[name]) return;
        setMatrix((prev) => ({
            ...prev,
            [name]: { free: false, basic: false, professional: false, enterprise: false },
        }));
        setNewFeatureName("");
    };

    return (
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Plan Features Matrix</h3>
                    <p className="text-xs text-gray-500">
                        Tick a box to include a feature in that plan. Add text (e.g. "10 Images", "Unlimited")
                        for a custom value instead of a plain checkmark.
                    </p>
                </div>
                <button
                    onClick={() => onSave(matrix)}
                    disabled={saving}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save Matrix"}
                </button>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="min-w-[700px] w-full border-collapse text-left">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-800 text-white">
                            <th className="px-4 py-2 text-xs font-semibold uppercase">Feature</th>
                            {PLAN_IDS.map((planId) => (
                                <th key={planId} className="px-4 py-2 text-xs font-semibold uppercase text-center min-w-[140px]">
                                    {PLAN_LABELS[planId]}
                                </th>
                            ))}
                            <th className="px-4 py-2 text-xs font-semibold uppercase text-center w-12" />
                        </tr>
                    </thead>
                    <tbody>
                        {featureNames.map((featureName, i) => (
                            <tr key={featureName} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">{featureName}</td>
                                {PLAN_IDS.map((planId) => (
                                    <td key={planId} className="px-4 py-2">
                                        <FeatureCell
                                            value={matrix[featureName][planId]}
                                            onChange={(v) => setCell(featureName, planId, v)}
                                        />
                                    </td>
                                ))}
                                <td className="px-4 py-2 text-center">
                                    <button
                                        onClick={() => removeFeature(featureName)}
                                        title="Remove this feature row"
                                        className="p-1 rounded-md text-gray-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
                <input
                    className="admin-input max-w-xs"
                    placeholder="New feature name, e.g. Priority Listing"
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFeature()}
                />
                <button
                    onClick={addFeature}
                    disabled={!newFeatureName.trim()}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Feature Row
                </button>
            </div>
        </div>
    );
}
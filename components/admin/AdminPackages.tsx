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

const PLAN_IDS: PlanId[] = ["free", "basic", "professional", "enterprise"];
const PLAN_LABELS: Record<PlanId, string> = {
    free: "Free",
    basic: "Basic",
    professional: "Professional",
    enterprise: "Enterprise",
};

// Static reference data — mirrors SUBSCRIPTION_FEATURES from lib/packages.js.
// This is display-only here; it isn't editable and isn't fetched from the DB.
const STATIC_FEATURES: { name: string; free: FeatureValue; basic: FeatureValue; professional: FeatureValue; enterprise: FeatureValue }[] = [
    { name: "Company Profile", free: "Standard", basic: "Enhanced", professional: "Premium", enterprise: "Premium+" },
    { name: "Company Logo", free: true, basic: true, professional: true, enterprise: true },
    { name: "Cover Banner", free: false, basic: "1", professional: "3", enterprise: "5" },
    { name: "Company Description", free: "150 Words", basic: "1000 Words", professional: "2500 Words", enterprise: "Unlimited" },
    { name: "Contact Details", free: "Limited", basic: "Full", professional: "Full", enterprise: "Full" },
    { name: "Website Link", free: true, basic: true, professional: true, enterprise: true },
    { name: "Google Map", free: true, basic: true, professional: true, enterprise: true },
    { name: "WhatsApp Button", free: false, basic: true, professional: true, enterprise: true },
    { name: "Company Gallery", free: false, basic: "10 Images", professional: "15 Images", enterprise: "Unlimited" },
    { name: "Factory Images", free: false, basic: "10", professional: "30", enterprise: "Unlimited" },
    { name: "Product Categories", free: "3", basic: "10", professional: "30", enterprise: "Unlimited" },
    { name: "Product Listings", free: "5", basic: "25", professional: "100", enterprise: "Unlimited" },
    { name: "Product Images", free: "10", basic: "50", professional: "100", enterprise: "Unlimited" },
    { name: "Product Videos", free: false, basic: "5", professional: "20", enterprise: "Unlimited" },
    { name: "Product Catalogues (PDF)", free: false, basic: "2", professional: "10", enterprise: "Unlimited" },
    { name: "Company Brochure", free: false, basic: true, professional: true, enterprise: true },
    { name: "Certifications Display", free: false, basic: true, professional: true, enterprise: true },
    { name: "Brands Represented", free: false, basic: "10", professional: "Unlimited", enterprise: "Unlimited" },
    { name: "Industries Served", free: "5", basic: "20", professional: "Unlimited", enterprise: "Unlimited" },
    { name: "Export Markets", free: false, basic: true, professional: true, enterprise: true },
    { name: "Manufacturing Capabilities", free: false, basic: "Basic", professional: "Complete", enterprise: "Complete + Photos+Video" },
    { name: "Machinery List", free: false, basic: "Basic", professional: "Detailed", enterprise: "Detailed with Images" },
    { name: "Quality Standards", free: false, basic: true, professional: true, enterprise: true },
    { name: "Team Profiles", free: false, basic: "5", professional: "10", enterprise: "Unlimited" },
    { name: "Verified Supplier Badge", free: false, basic: "Silver", professional: "Gold", enterprise: "Platinum" },
    { name: "Technical Articles", free: false, basic: "4/year", professional: "12/year", enterprise: "Unlimited" },
    { name: "Product Launch Announcements", free: false, basic: false, professional: "6/year", enterprise: "Unlimited" },
    { name: "Job Postings", free: "2", basic: "20", professional: "Unlimited", enterprise: "Unlimited" },
    { name: "Internship Listings", free: false, basic: "10", professional: "Unlimited", enterprise: "Unlimited" },
    { name: "Featured Job", free: false, basic: false, professional: "10 Days", enterprise: "30 Days" },
    { name: "Company Career Page", free: false, basic: false, professional: false, enterprise: true },
    { name: "Resume Download", free: false, basic: "10", professional: "20", enterprise: "Unlimited" },
    { name: "RFQ Leads", free: false, basic: "10 Leads / month", professional: "20 leads / per month", enterprise: "unlimited" },
    { name: "Quote Request Form", free: false, basic: "yes", professional: "yes", enterprise: "Yes" },
    { name: "Lead Notifications", free: "Email", basic: "Email", professional: "Email+SMS", enterprise: "Email+Whatsapp+SMS Realtime" },
    { name: "Search Ranking", free: "Standard", basic: "Priority", professional: "Top Results", enterprise: "#1 Priority" },
    { name: "Featured in Category", free: false, basic: true, professional: true, enterprise: true },
    { name: "Homepage Featured", free: false, basic: false, professional: "1 AD / PER MONTH", enterprise: "1 AD PER WEEK" },
    { name: "Newsletter Promotion", free: false, basic: "3 times per year", professional: "6 times per year", enterprise: "Every Month" },
    { name: "Social Media Promotion", free: false, basic: "1 Post/Year", professional: "6 Post/Year", enterprise: "12 Posts/Year" },
    { name: "Homepage Spotlight", free: false, basic: false, professional: true, enterprise: true },
    { name: "Trending Supplier Badge", free: false, basic: false, professional: false, enterprise: true },
    { name: "Homepage Hero Banner", free: false, basic: false, professional: false, enterprise: "1 / Rotational" },
    { name: "Homepage Sidebar", free: false, basic: false, professional: "1 / Rotational", enterprise: "1 / Rotational" },
    { name: "Category Banner", free: false, basic: false, professional: false, enterprise: "1 / Rotational" },
    { name: "Article Banner", free: false, basic: false, professional: "1 / Rotational", enterprise: "1 / Rotational" },
    { name: "Sticky Banner", free: false, basic: false, professional: false, enterprise: "1 / Rotational" },
    { name: "Factory Visit Feature", free: false, basic: false, professional: false, enterprise: "1/Year" },
    { name: "Product Demo Video on Home Page", free: false, basic: false, professional: "1/Year", enterprise: "4/ Year" },
    { name: "Email Support", free: true, basic: true, professional: true, enterprise: "Priority" },
    { name: "Phone Support", free: false, basic: false, professional: true, enterprise: true },
    { name: "Dedicated Account Manager", free: false, basic: false, professional: false, enterprise: true },
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

export default function AdminPackages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [drafts, setDrafts] = useState<Record<string, Draft>>({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
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

                {/* ---- Plan Features (static reference table) ---- */}
                <div className="mt-6">
                    <StaticFeaturesTable />
                </div>
                <p className="mt-3 text-xs text-gray-400">
                    This table is a static reference matching the pricing page's feature comparison —
                    it comes from a shared code-level list, not per-plan DB data, and isn't editable here.
                </p>
            </section>

            {/* ============ BANNER ============ */}
            {/* <section>
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
            </section> */}

            {/* ============ SPONSORED ============ */}
            {/* <section>
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
            </section> */}

            {/* ============ RECRUITMENT ============ */}
            {/* <section>
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
            </section> */}

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

// Renders a single feature value as plain, read-only text.
// true -> a checkmark, false -> a dash, string -> shown as-is.
function StaticFeatureValue({ value }: { value: FeatureValue }) {
    if (value === true) {
        return <span className="text-green-600">✓</span>;
    }
    if (value === false) {
        return <span className="text-gray-300">—</span>;
    }
    return <span className="text-gray-700">{value}</span>;
}

// Plain, read-only reference table showing what each subscription plan
// includes. Sourced from a static list (mirrors SUBSCRIPTION_FEATURES in
// lib/packages.js) — not editable, not fetched from the DB.
function StaticFeaturesTable() {
    return (
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
            <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Plan Features</h3>
                <p className="text-xs text-gray-500">What's included in each subscription plan.</p>
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
                        </tr>
                    </thead>
                    <tbody>
                        {STATIC_FEATURES.map((row, i) => (
                            <tr key={row.name} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">{row.name}</td>
                                {PLAN_IDS.map((planId) => (
                                    <td key={planId} className="px-4 py-2 text-center">
                                        <StaticFeatureValue value={row[planId]} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
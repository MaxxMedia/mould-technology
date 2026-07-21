// app/admin/recruiter-usage/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Users,
    FileText,
    Building2,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Mail,
    Calendar,
    ChevronDown,
    BarChart3,
    ShieldCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RecruiterUsage = {
    id: number;
    name: string;
    slug: string;
    location: string;
    website: string;
    isVerified: boolean;
    createdAt: string;
    type?: "company" | "recruiter";
    hasCompany?: boolean;
    companyName?: string | null;
    email?: string;
    username?: string;
    fullName?: string;
    subscriptionPlan: string;
    planLabel: string;
    subscriptionExpiresAt: string | null;
    isActiveSubscription: boolean;
    totalSpent: number;
    latestPurchase: {
        id: number;
        packageName: string;
        amount: number;
        createdAt: string;
    } | null;
    users: {
        id: number;
        email: string;
        username: string;
        fullName: string;
        role: string;
    }[];
    usage: {
        directories: { active: number; pending: number; total: number; limit: number | string; isUnlimited: boolean; remaining: number | string };
        articles: { active: number; pending: number; total: number; limit: number | string; isUnlimited: boolean; remaining: number | string };
        teamMembers: { active: number; limit: number | string; isUnlimited: boolean; remaining: number | string };
        productSupplies: { count: number; limit: number | string; isUnlimited: boolean };
        coverImages: { count: number; limit: number | string; isUnlimited: boolean; remaining: number | string };
        productImages: { count: number; limit: number | string; isUnlimited: boolean; remaining: number | string };
        companyGallery: { count: number; limit: number | string; isUnlimited: boolean; remaining: number | string };
        factoryGallery: { count: number; limit: number | string; isUnlimited: boolean; remaining: number | string };
        productCatalogues: { count: number; limit: number | string; isUnlimited: boolean; remaining: number | string };
        productVideos: { count: number; limit: number | string; isUnlimited: boolean; remaining: number | string };
        brands: { count: number; limit: number | string; isUnlimited: boolean; remaining: number | string };
        industriesServed: { count: number; limit: number | string; isUnlimited: boolean; remaining: number | string };
        exportMarkets: { count: number; allowed: boolean };
        certifications: { count: number; allowed: boolean };
        brochures: { count: number; allowed: boolean };
        manufacturingCapabilities: { allowed: string | boolean; tier: string | boolean };
        machineryList: { allowed: string | boolean; tier: string | boolean };
        qualityStandards: { allowed: boolean };
        googleMap: { allowed: boolean };
        whatsapp: { allowed: boolean };
        description: { limit: number | string };
    };
};

type Stats = {
    totalRecruiters: number;
    totalPaidCompanies: number;
    totalFreeCompanies: number;
    totalPendingDirectories: number;
    totalPendingArticles: number;
    totalTeamMembers: number;
    totalSupplierDirectories: number;
    totalArticles: number;
};

type PlanTab = "all" | "free" | "basic" | "professional" | "enterprise";

// ---------------------------------------------------------------------------
// Design tokens — steel / ink / amber, tuned for a B2B sourcing admin tool
// ---------------------------------------------------------------------------

const PLAN_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
    free: { badge: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200", dot: "bg-slate-400", label: "Free" },
    basic: { badge: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200", dot: "bg-sky-500", label: "Basic" },
    professional: { badge: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200", dot: "bg-violet-500", label: "Professional" },
    enterprise: { badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-300", dot: "bg-amber-500", label: "Enterprise" },
};

const TAB_ACTIVE_STYLES: Record<PlanTab, string> = {
    all: "bg-[#12172B] text-white",
    free: "bg-slate-600 text-white",
    basic: "bg-sky-600 text-white",
    professional: "bg-violet-600 text-white",
    enterprise: "bg-amber-600 text-white",
};

function planStyle(plan: string) {
    return PLAN_STYLES[plan] ?? PLAN_STYLES.free;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminRecruiterUsagePage() {
    const [recruiters, setRecruiters] = useState<RecruiterUsage[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activePlanTab, setActivePlanTab] = useState<PlanTab>("all");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);
    async function fetchData() {
        try {
            const token = localStorage.getItem("token");

            // Use the correct endpoint
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/companies/admin/list`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Status:", res.status);
            console.log("Content-Type:", res.headers.get("content-type"));

            if (!res.ok) {
                throw new Error(`Request failed: ${res.status}`);
            }

            const data = await res.json();
            console.log("Response:", data);

            // The API returns an array directly
            const companies = Array.isArray(data) ? data : (data.companies || data.data || []);

            // Transform the data to match the expected structure
            const transformedCompanies = companies.map((company: any) => ({
                id: company.id,
                name: company.name,
                slug: company.slug,
                location: company.location || "",
                website: company.website || "",
                isVerified: company.isVerified || false,
                createdAt: company.createdAt || new Date().toISOString(),
                type: "company",
                hasCompany: true,
                companyName: company.name,
                email: company.email || "N/A",
                username: company.username || company.slug || "N/A",
                fullName: company.fullName || company.name,
                subscriptionPlan: company.plan || company.subscriptionPlan || "free",
                planLabel: company.planLabel || getPlanLabel(company.plan || company.subscriptionPlan || "free"),
                subscriptionExpiresAt: company.subscriptionExpiresAt || null,
                isActiveSubscription: !!company.subscriptionExpiresAt && new Date(company.subscriptionExpiresAt) > new Date(),
                totalSpent: company.totalSpent || 0,
                latestPurchase: company.latestPurchase || null,
                users: company.users || [],
                usage: {
                    directories: {
                        active: company.directoriesActive || 0,
                        pending: company.directoriesPending || 0,
                        total: (company.directoriesActive || 0) + (company.directoriesPending || 0),
                        limit: company.directoriesLimit || getPlanLimit(company.plan || "free", "directories"),
                        isUnlimited: company.directoriesLimit === -1 || company.directoriesLimit === "unlimited",
                        remaining: company.directoriesRemaining || 0
                    },
                    articles: {
                        active: company.articlesActive || 0,
                        pending: company.articlesPending || 0,
                        total: (company.articlesActive || 0) + (company.articlesPending || 0),
                        limit: company.articlesLimit || getPlanLimit(company.plan || "free", "articles"),
                        isUnlimited: company.articlesLimit === -1 || company.articlesLimit === "unlimited",
                        remaining: company.articlesRemaining || 0
                    },
                    teamMembers: {
                        active: company.teamMembersActive || 0,
                        limit: company.teamMembersLimit || getPlanLimit(company.plan || "free", "teamMembers"),
                        isUnlimited: company.teamMembersLimit === -1 || company.teamMembersLimit === "unlimited",
                        remaining: company.teamMembersRemaining || 0
                    },
                    productSupplies: {
                        count: company.productSuppliesCount || 0,
                        limit: company.productSuppliesLimit || getPlanLimit(company.plan || "free", "productSupplies"),
                        isUnlimited: company.productSuppliesLimit === -1 || company.productSuppliesLimit === "unlimited"
                    },
                    coverImages: {
                        count: company.coverImagesCount || 0,
                        limit: company.coverImagesLimit || getPlanLimit(company.plan || "free", "coverImages"),
                        isUnlimited: company.coverImagesLimit === -1 || company.coverImagesLimit === "unlimited",
                        remaining: company.coverImagesRemaining || 0
                    },
                    productImages: {
                        count: company.productImagesCount || 0,
                        limit: company.productImagesLimit || getPlanLimit(company.plan || "free", "productImages"),
                        isUnlimited: company.productImagesLimit === -1 || company.productImagesLimit === "unlimited",
                        remaining: company.productImagesRemaining || 0
                    },
                    companyGallery: {
                        count: company.companyGalleryCount || 0,
                        limit: company.companyGalleryLimit || getPlanLimit(company.plan || "free", "companyGallery"),
                        isUnlimited: company.companyGalleryLimit === -1 || company.companyGalleryLimit === "unlimited",
                        remaining: company.companyGalleryRemaining || 0
                    },
                    factoryGallery: {
                        count: company.factoryGalleryCount || 0,
                        limit: company.factoryGalleryLimit || getPlanLimit(company.plan || "free", "factoryGallery"),
                        isUnlimited: company.factoryGalleryLimit === -1 || company.factoryGalleryLimit === "unlimited",
                        remaining: company.factoryGalleryRemaining || 0
                    },
                    productCatalogues: {
                        count: company.productCataloguesCount || 0,
                        limit: company.productCataloguesLimit || getPlanLimit(company.plan || "free", "productCatalogues"),
                        isUnlimited: company.productCataloguesLimit === -1 || company.productCataloguesLimit === "unlimited",
                        remaining: company.productCataloguesRemaining || 0
                    },
                    productVideos: {
                        count: company.productVideosCount || 0,
                        limit: company.productVideosLimit || getPlanLimit(company.plan || "free", "productVideos"),
                        isUnlimited: company.productVideosLimit === -1 || company.productVideosLimit === "unlimited",
                        remaining: company.productVideosRemaining || 0
                    },
                    brands: {
                        count: company.brandsCount || 0,
                        limit: company.brandsLimit || getPlanLimit(company.plan || "free", "brands"),
                        isUnlimited: company.brandsLimit === -1 || company.brandsLimit === "unlimited",
                        remaining: company.brandsRemaining || 0
                    },
                    industriesServed: {
                        count: company.industriesServedCount || 0,
                        limit: company.industriesServedLimit || getPlanLimit(company.plan || "free", "industriesServed"),
                        isUnlimited: company.industriesServedLimit === -1 || company.industriesServedLimit === "unlimited",
                        remaining: company.industriesServedRemaining || 0
                    },
                    exportMarkets: {
                        count: company.exportMarketsCount || 0,
                        allowed: company.exportMarketsAllowed || getPlanFeature(company.plan || "free", "exportMarkets")
                    },
                    certifications: {
                        count: company.certificationsCount || 0,
                        allowed: company.certificationsAllowed || getPlanFeature(company.plan || "free", "certifications")
                    },
                    brochures: {
                        count: company.brochuresCount || 0,
                        allowed: company.brochuresAllowed || getPlanFeature(company.plan || "free", "brochures")
                    },
                    manufacturingCapabilities: {
                        allowed: company.manufacturingCapabilitiesAllowed || getPlanFeature(company.plan || "free", "manufacturingCapabilities"),
                        tier: company.manufacturingCapabilitiesTier || false
                    },
                    machineryList: {
                        allowed: company.machineryListAllowed || getPlanFeature(company.plan || "free", "machineryList"),
                        tier: company.machineryListTier || false
                    },
                    qualityStandards: {
                        allowed: company.qualityStandardsAllowed || getPlanFeature(company.plan || "free", "qualityStandards")
                    },
                    googleMap: {
                        allowed: company.googleMapAllowed || getPlanFeature(company.plan || "free", "googleMap")
                    },
                    whatsapp: {
                        allowed: company.whatsappAllowed || getPlanFeature(company.plan || "free", "whatsapp")
                    },
                    description: {
                        limit: company.descriptionLimit || 0
                    }
                }
            }));

            // Calculate stats
            const stats = {
                totalRecruiters: transformedCompanies.length,
                totalPaidCompanies: transformedCompanies.filter((c: any) => c.subscriptionPlan !== "free").length,
                totalFreeCompanies: transformedCompanies.filter((c: any) => c.subscriptionPlan === "free").length,
                totalPendingDirectories: transformedCompanies.reduce((acc: number, c: any) => acc + c.usage.directories.pending, 0),
                totalPendingArticles: transformedCompanies.reduce((acc: number, c: any) => acc + c.usage.articles.pending, 0),
                totalTeamMembers: transformedCompanies.reduce((acc: number, c: any) => acc + c.usage.teamMembers.active, 0),
                totalSupplierDirectories: transformedCompanies.reduce((acc: number, c: any) => acc + c.usage.directories.active, 0),
                totalArticles: transformedCompanies.reduce((acc: number, c: any) => acc + c.usage.articles.active, 0)
            };

            setRecruiters(transformedCompanies);
            setStats(stats);
        } catch (error) {
            console.error("Failed to fetch recruiter usage data:", error);
        } finally {
            setLoading(false);
        }
    }

    // Helper function to get plan labels
    function getPlanLabel(plan: string): string {
        const labels: Record<string, string> = {
            free: "Free",
            basic: "Basic",
            professional: "Professional",
            enterprise: "Enterprise"
        };
        return labels[plan] || "Free";
    }

    // Helper function to get plan limits
    function getPlanLimit(plan: string, feature: string): number | string {
        const limits: Record<string, any> = {
            free: {
                directories: 1,
                articles: 0,
                teamMembers: 1,
                productSupplies: 0,
                coverImages: 0,
                productImages: 0,
                companyGallery: 0,
                factoryGallery: 0,
                productCatalogues: 0,
                productVideos: 0,
                brands: 0,
                industriesServed: 0
            },
            basic: {
                directories: 5,
                articles: 2,
                teamMembers: 3,
                productSupplies: 10,
                coverImages: 3,
                productImages: 10,
                companyGallery: 5,
                factoryGallery: 5,
                productCatalogues: 5,
                productVideos: 3,
                brands: 5,
                industriesServed: 5
            },
            professional: {
                directories: 20,
                articles: 10,
                teamMembers: 10,
                productSupplies: 50,
                coverImages: 10,
                productImages: 50,
                companyGallery: 20,
                factoryGallery: 20,
                productCatalogues: 20,
                productVideos: 10,
                brands: 20,
                industriesServed: 20
            },
            enterprise: {
                directories: "Unlimited",
                articles: "Unlimited",
                teamMembers: "Unlimited",
                productSupplies: "Unlimited",
                coverImages: "Unlimited",
                productImages: "Unlimited",
                companyGallery: "Unlimited",
                factoryGallery: "Unlimited",
                productCatalogues: "Unlimited",
                productVideos: "Unlimited",
                brands: "Unlimited",
                industriesServed: "Unlimited"
            }
        };
        return limits[plan]?.[feature] || 0;
    }

    // Helper function to get plan features
    function getPlanFeature(plan: string, feature: string): boolean {
        const features: Record<string, any> = {
            free: {
                exportMarkets: false,
                certifications: false,
                brochures: false,
                manufacturingCapabilities: false,
                machineryList: false,
                qualityStandards: false,
                googleMap: false,
                whatsapp: false
            },
            basic: {
                exportMarkets: false,
                certifications: false,
                brochures: false,
                manufacturingCapabilities: false,
                machineryList: false,
                qualityStandards: false,
                googleMap: false,
                whatsapp: false
            },
            professional: {
                exportMarkets: true,
                certifications: true,
                brochures: true,
                manufacturingCapabilities: true,
                machineryList: true,
                qualityStandards: true,
                googleMap: true,
                whatsapp: true
            },
            enterprise: {
                exportMarkets: true,
                certifications: true,
                brochures: true,
                manufacturingCapabilities: true,
                machineryList: true,
                qualityStandards: true,
                googleMap: true,
                whatsapp: true
            }
        };
        return features[plan]?.[feature] || false;
    }

    const planCounts = useMemo(() => {
        return {
            all: recruiters.length,
            free: recruiters.filter((r) => r.subscriptionPlan === "free").length,
            basic: recruiters.filter((r) => r.subscriptionPlan === "basic").length,
            professional: recruiters.filter((r) => r.subscriptionPlan === "professional").length,
            enterprise: recruiters.filter((r) => r.subscriptionPlan === "enterprise").length,
        };
    }, [recruiters]);

    const filtered = useMemo(() => {
        return recruiters
            .filter((r) => {
                if (activePlanTab !== "all" && r.subscriptionPlan !== activePlanTab) return false;
                if (searchTerm) {
                    const q = searchTerm.toLowerCase();
                    return (
                        (r.fullName || r.name || "").toLowerCase().includes(q) ||
                        (r.email || "").toLowerCase().includes(q) ||
                        (r.username || "").toLowerCase().includes(q)
                    );
                }
                return true;
            })
            .sort((a, b) => {
                if (a.isActiveSubscription && !b.isActiveSubscription) return -1;
                if (!a.isActiveSubscription && b.isActiveSubscription) return 1;
                return (a.fullName || a.name).localeCompare(b.fullName || b.name);
            });
    }, [recruiters, activePlanTab, searchTerm]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F6F7F9]">
                <div className="flex items-center gap-3 text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                    <span className="text-sm">Loading recruiter accounts…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F7F9]">
            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-8">
                    <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-2">
                        Admin · Accounts
                    </p>
                    <h1 className="text-3xl font-bold text-[#12172B] tracking-tight">
                        Recruiter Accounts
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Every recruiter on the platform, with their real plan and their own companies posted — not a blended company total.
                    </p>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                        <StatCard label="Recruiters" value={recruiters.length} icon={<Users className="w-4 h-4" />} />
                        <StatCard label="Paid plans" value={stats.totalPaidCompanies} icon={<ShieldCheck className="w-4 h-4" />} accent="emerald" />
                        <StatCard label="Companies pending" value={stats.totalPendingDirectories} icon={<Clock className="w-4 h-4" />} accent="amber" />
                        {/* <StatCard label="Articles pending" value={stats.totalPendingArticles} icon={<FileText className="w-4 h-4" />} accent="amber" /> */}
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {(["all", "free", "basic", "professional", "enterprise"] as PlanTab[]).map((plan) => (
                            <button
                                key={plan}
                                onClick={() => setActivePlanTab(plan)}
                                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${activePlanTab === plan
                                        ? TAB_ACTIVE_STYLES[plan]
                                        : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:ring-slate-300"
                                    }`}
                            >
                                {plan === "all" ? "All" : planStyle(plan).label}
                                <span
                                    className={`px-1.5 py-0.5 rounded-full text-[11px] leading-none ${activePlanTab === plan ? "bg-white/20" : "bg-slate-100 text-slate-500"
                                        }`}
                                >
                                    {planCounts[plan]}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search name, email, or username"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12172B]/20 focus:border-[#12172B]/30"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {filtered.map((r) => (
                        <RecruiterCard
                            key={r.id}
                            recruiter={r}
                            expanded={expandedId === r.id}
                            onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                        />
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-500 text-sm">No recruiter accounts match this search.</p>
                        <p className="text-slate-400 text-xs mt-1">Try a different name, email, or plan filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
    label,
    value,
    icon,
    accent = "slate",
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    accent?: "slate" | "emerald" | "amber";
}) {
    const accentClasses: Record<string, string> = {
        slate: "bg-slate-100 text-slate-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${accentClasses[accent]}`}>{icon}</div>
            <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-xl font-bold text-[#12172B] tabular-nums">{value}</p>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Recruiter card
// ---------------------------------------------------------------------------

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("");
}

function RecruiterCard({
    recruiter,
    expanded,
    onToggle,
}: {
    recruiter: RecruiterUsage;
    expanded: boolean;
    onToggle: () => void;
}) {
    const displayName = recruiter.fullName || recruiter.name || recruiter.username || "Unnamed recruiter";
    const plan = planStyle(recruiter.subscriptionPlan);

    const companiesPosted = recruiter.usage.directories.active;
    const companiesLimit = recruiter.usage.directories.limit;
    const companiesPending = recruiter.usage.directories.pending;
    const percent =
        typeof companiesLimit === "number" && companiesLimit > 0
            ? Math.min(100, Math.round((companiesPosted / companiesLimit) * 100))
            : 0;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
                {/* Avatar */}
                <div className="shrink-0 h-11 w-11 rounded-full bg-[#12172B] text-white flex items-center justify-center text-sm font-semibold">
                    {initials(displayName)}
                </div>

                {/* Identity */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#12172B] truncate">{displayName}</p>
                        {recruiter.isVerified && (
                            <CheckCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        )}
                    </div>
                    {recruiter.email && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            {recruiter.email}
                        </p>
                    )}
                </div>

                {/* Plan */}
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${plan.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${plan.dot}`} />
                        {plan.label}
                    </span>
                    {recruiter.subscriptionExpiresAt && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(recruiter.subscriptionExpiresAt).toLocaleDateString()}
                        </span>
                    )}
                </div>

                {/* Companies posted */}
                <div className="hidden md:flex flex-col items-end gap-1 w-32 shrink-0">
                    <span className="text-xs text-slate-500">
                        <span className="font-semibold text-[#12172B]">{companiesPosted}</span> / {companiesLimit} companies
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${percent > 80 ? "bg-rose-500" : percent > 50 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    {companiesPending > 0 && (
                        <span className="text-[11px] text-amber-600">{companiesPending} pending review</span>
                    )}
                </div>

                {/* Status */}
                <span
                    className={`hidden lg:inline-flex shrink-0 items-center px-2.5 py-1 rounded-full text-xs font-medium ${recruiter.isActiveSubscription
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                >
                    {recruiter.isActiveSubscription ? "Active" : "Inactive"}
                </span>

                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>

            {expanded && <RecruiterDetails recruiter={recruiter} />}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Expanded details
// ---------------------------------------------------------------------------

function RecruiterDetails({ recruiter }: { recruiter: RecruiterUsage }) {
    const u = recruiter.usage;

    return (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Account */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-3">Account</h4>
                <dl className="space-y-2.5 text-sm">
                    <Row label="Username" value={recruiter.username || "—"} />
                    <Row label="Email" value={recruiter.email || "—"} />
                    <Row label="Company" value={recruiter.companyName || "No company yet"} />
                    <Row label="Location" value={recruiter.location || "—"} />
                    <Row label="Joined" value={new Date(recruiter.createdAt).toLocaleDateString()} />
                    {recruiter.totalSpent > 0 && (
                        <Row label="Total spent" value={`₹${recruiter.totalSpent.toLocaleString()}`} emphasize />
                    )}
                </dl>
                {recruiter.latestPurchase && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">Latest purchase</p>
                        <p className="text-sm text-[#12172B] font-medium">{recruiter.latestPurchase.packageName}</p>
                        <p className="text-xs text-slate-400">
                            ₹{recruiter.latestPurchase.amount.toLocaleString()} · {new Date(recruiter.latestPurchase.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>

            {/* Usage */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Usage
                </h4>
                <div className="space-y-2 text-sm">
                    <Row label="Companies posted" value={`${u.directories.active}/${u.directories.limit}`} />
                    <Row label="Articles" value={`${u.articles.active}/${u.articles.limit}`} />
                    <Row label="Team members" value={`${u.teamMembers.active}/${u.teamMembers.limit}`} />
                    <Row label="Product supplies" value={`${u.productSupplies.count}/${u.productSupplies.limit}`} />
                    <Row label="Product images" value={`${u.productImages.count}/${u.productImages.limit}`} />
                    <Row label="Company gallery" value={`${u.companyGallery.count}/${u.companyGallery.limit}`} />
                    <Row label="Product catalogues" value={`${u.productCatalogues.count}/${u.productCatalogues.limit}`} />
                    <Row label="Brands" value={`${u.brands.count}/${u.brands.limit}`} />
                </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-3">Features allowed</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <Feature ok={u.googleMap.allowed} label="Google Map" />
                    <Feature ok={u.whatsapp.allowed} label="WhatsApp" />
                    <Feature ok={u.exportMarkets.allowed} label="Export markets" />
                    <Feature ok={u.certifications.allowed} label="Certifications" />
                    <Feature ok={u.brochures.allowed} label="Brochures" />
                    <Feature ok={u.qualityStandards.allowed} label="Quality standards" />
                    <Feature ok={!!u.manufacturingCapabilities.allowed} label="Manufacturing" />
                    <Feature ok={!!u.machineryList.allowed} label="Machinery list" />
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                    <Row label="Description limit" value={String(u.description.limit)} />
                </div>
            </div>
        </div>
    );
}

function Row({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">{label}</dt>
            <dd className={`font-medium text-right truncate ${emphasize ? "text-emerald-600" : "text-[#12172B]"}`}>{value}</dd>
        </div>
    );
}

function Feature({ ok, label }: { ok: boolean; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            {ok ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span className={ok ? "text-slate-700" : "text-slate-400"}>{label}</span>
        </div>
    );
}
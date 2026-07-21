"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import PackagesHero from "./PackagesHero";
import {
  activateFreePlan,
  startPackagePayment,
  type PackageType,
} from "@/lib/razorpay";
import {
  formatInr,
  type FeatureValue,
} from "@/lib/packages";

// Keep the types but fetch data from API
type PlanTier = string;

async function refreshLocalUser() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const freshUser = await res.json();
      const existing = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...existing, ...freshUser }));
      window.dispatchEvent(new Event("userChanged"));
    }
  } catch {
    // ignore
  }
}

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center text-emerald-600">
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center text-gray-300">
        <X className="h-4 w-4" strokeWidth={2.5} />
      </span>
    );
  }

  return <span className="text-sm text-[#2a3d47]">{value}</span>;
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-semibold text-[#121213] sm:text-3xl">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-sm text-[#616C74] sm:text-base">{subtitle}</p>
      )}
      <div className="mx-auto mt-4 h-[2px] w-12 bg-blue-600" />
    </div>
  );
}

// Free Plan Card — the "Continue" option. Only rendered when the visitor
// arrived here from the login page (see showFreePlanCard below), so someone
// who doesn't want to buy a plan can just continue on Free instead.
function FreePlanCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    setLoading(true);
    setError("");

    await activateFreePlan({
      onSuccess: async () => {
        await refreshLocalUser();
        window.location.href = "/recruiter/onboarding";
      },
      onError: (message) => {
        setError(message);
        setLoading(false);
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl mb-12">
      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 shadow-lg">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Continue with Free Plan
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start using ToolingTrends immediately with our Free plan.
            You can upgrade your subscription anytime.
          </p>
          <button
            onClick={handleContinue}
            disabled={loading}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue with Free Plan"
            )}
          </button>
          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Type for API response
type ApiPackage = {
  id: string;
  name: string;
  type: string;
  price: number;
  billingCycle: string;
  description: string | null;
  badge: string | null;
  displayOrder: number;
  isHighlighted: boolean;
  isActive: boolean;
  metadata: any;
  fromFallback?: boolean;
};

// Extended package type with features for sponsored content
type SponsoredPackage = ApiPackage & {
  features?: string[];
};

function PayButton({
  label,
  packageType,
  packageId,
  variant = "primary",
  disabled = false,
  currentPlan,
  activeUntil,
}: {
  label: string;
  packageType: PackageType;
  packageId: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  currentPlan?: string | null;
  activeUntil?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isCurrentPlan =
    packageType === "SUBSCRIPTION" && currentPlan === packageId;

  const isActiveMonthlyPackage =
    packageType === "RECRUITMENT" &&
    activeUntil &&
    new Date(activeUntil) > new Date();

  const baseClass =
    variant === "primary"
      ? "bg-[#004d73] hover:bg-[#003a59] text-white"
      : "bg-[#2a3d47] hover:bg-[#1f2d34] text-white";

  const handleClick = async () => {
    if (isCurrentPlan || isActiveMonthlyPackage) return;

    setError("");
    setLoading(true);

    if (packageType === "SUBSCRIPTION" && packageId === "free") {
      await activateFreePlan({
        onSuccess: async () => {
          await refreshLocalUser();
          router.push("/recruiter/onboarding");
        },
        onError: (message) => setError(message),
      });
      setLoading(false);
      return;
    }

    await startPackagePayment({
      packageType,
      packageId,
      onSuccess: async () => {
        await refreshLocalUser();
        router.push("/recruiter/onboarding");
      },
      onError: (message) => {
        setError(message);
        setLoading(false);
      },
    });

    setLoading(false);
  };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || disabled || isCurrentPlan || !!isActiveMonthlyPackage}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${baseClass}`}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : isActiveMonthlyPackage ? (
          `Active until ${new Date(activeUntil!).toLocaleDateString()}`
        ) : isCurrentPlan ? (
          "Current Plan"
        ) : (
          label
        )}
      </button>
      {error && error !== "Payment cancelled" && (
        <span className="max-w-[180px] text-center text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}

export default function PackagesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const bannerDurations = ["monthly", "quarterly", "annual"] as const;
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [recruitmentExpiresAt, setRecruitmentExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPackageSelected, setIsPackageSelected] = useState(false);

  // State for packages from API
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [subscriptionFeatures, setSubscriptionFeatures] = useState<any[]>([]);
  const [bannerPackages, setBannerPackages] = useState<any[]>([]);
  const [sponsoredPackages, setSponsoredPackages] = useState<SponsoredPackage[]>([]);
  const [recruitmentPackages, setRecruitmentPackages] = useState<any[]>([]);
  const [fromFallback, setFromFallback] = useState(false);

  // Check if user already has packageSelected
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.packageSelected) {
          setIsPackageSelected(true);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Fetch packages from API
  useEffect(() => {
    async function fetchPackages() {
      try {
        // Public, unauthenticated endpoint — do NOT point this at /api/admin/packages,
        // that route requires requireAuth + requireAdmin and will 401 for site visitors,
        // silently dropping into the hardcoded fallback below every time.
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/packages?includeInactive=false`);
        const data = await res.json();

        if (data.success) {
          setFromFallback(data.fromFallback || false);

          // Group packages by type
          const grouped = data.data.reduce((acc: any, pkg: ApiPackage) => {
            const type = pkg.type.toLowerCase();
            if (!acc[type]) acc[type] = [];
            acc[type].push(pkg);
            return acc;
          }, {});

          // Sort by display order
          const sortByOrder = (items: any[]) =>
            items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

          setSubscriptionPlans(sortByOrder(grouped.subscription || []));
          setBannerPackages(sortByOrder(grouped.banner || []));
          setSponsoredPackages(sortByOrder(grouped.sponsored || []));
          setRecruitmentPackages(sortByOrder(grouped.recruitment || []));

          // Subscription feature comparison rows aren't per-package DB data —
          // they always come from the static SUBSCRIPTION_FEATURES table.
          const { SUBSCRIPTION_FEATURES } = await import("@/lib/packages");
          setSubscriptionFeatures(SUBSCRIPTION_FEATURES);
        } else {
          throw new Error(data.error || "Failed to load packages");
        }
      } catch (error) {
        console.error("Failed to fetch packages:", error);
        // Fallback to hardcoded data if API fails
        try {
          const { SUBSCRIPTION_PLANS, SUBSCRIPTION_FEATURES } = await import('@/lib/packages');
          setSubscriptionPlans(SUBSCRIPTION_PLANS as unknown as any[]);
          setSubscriptionFeatures(SUBSCRIPTION_FEATURES);
          // setBannerPackages(BANNER_PACKAGES as unknown as any[]);
          // setSponsoredPackages(SPONSORED_CONTENT_PACKAGES as unknown as any[]);
          // setRecruitmentPackages(RECRUITMENT_PACKAGES as unknown as any[]);
          setFromFallback(true);
        } catch (fallbackError) {
          console.error("Failed to load fallback packages:", fallbackError);
        }
      }
    }

    fetchPackages();
  }, []);

  useEffect(() => {
    async function loadCurrentPlan() {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payments/my-packages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setCurrentPlan(data.subscription?.plan ?? null);
          setRecruitmentExpiresAt(data.subscription?.recruitmentExpiresAt ?? null);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentPlan();
  }, []);

  // Show the Free Plan "Continue" card only when the visitor arrived here
  // from the login page (not signup) and hasn't already picked a package.
  const showFreePlanCard = from === "login" && !isPackageSelected;

  // Filter out free plan from subscription plans when showing free plan card
  const displaySubscriptionPlans = showFreePlanCard
    ? subscriptionPlans.filter((plan: any) => plan.id !== "free")
    : subscriptionPlans;

  const planKeys = displaySubscriptionPlans.map((plan: any) => plan.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d73] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full bg-white">
      <PackagesHero
        title="Packages & Pricing"
        breadcrumbLabel="Packages"
        description="Grow your visibility on ToolingTrends.com with subscription plans, banner advertising, sponsored content, and recruitment packages. Secure checkout powered by Razorpay."
      />

      {/* Show fallback notice if using fallback data */}
      {fromFallback && (
        <div className="max-w-[1320px] mx-auto px-4 mt-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
            ⚠️ Using fallback package data. Admin can override packages in the database.
          </div>
        </div>
      )}

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          {/* Show Free Plan Card only when coming from the login page */}
          {showFreePlanCard && <FreePlanCard />}

          <SectionHeading
            title="ToolingTrends.com Subscription Plans"
            subtitle="Annual membership plans for suppliers and manufacturers"
          />

          <div className="overflow-x-auto rounded-2xl border border-[#e5e9ef] shadow-sm">
            <table className="min-w-[900px] w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#2a3d47] text-white">
                  <th className="px-4 py-4 text-sm font-semibold sm:px-6">Feature</th>
                  {displaySubscriptionPlans.map((plan: any) => (
                    <th
                      key={plan.id}
                      className="px-4 py-4 text-center text-sm font-semibold sm:px-6 relative"
                    >
                      {plan.isHighlighted && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                            {plan.badge || "Most Popular"}
                          </span>
                        </div>
                      )}
                      <div className="mt-2">{plan.name}</div>
                      {plan.description && (
                        <div className="mt-1 text-xs font-normal text-white/70 max-w-[120px] mx-auto">
                          {plan.description}
                        </div>
                      )}
                      <div className="mt-1 text-xs font-normal text-white/80">
                        {plan.price === 0 ? "₹0" : `${formatInr(plan.price)}/year`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscriptionFeatures.map((feature: any, index: number) => (
                  <tr
                    key={feature.name}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#f8f9fb]"}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[#121213] sm:px-6">
                      {feature.name}
                    </td>
                    {planKeys
                      .filter(key => displaySubscriptionPlans.some((p: any) => p.id === key))
                      .map((key) => (
                        <td key={key} className="px-4 py-3 text-center sm:px-6">
                          <FeatureCell value={feature[key]} />
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {displaySubscriptionPlans.map((plan: any) => (
              <PayButton
                key={plan.id}
                label={plan.price === 0 ? "Get Started Free" : `Buy ${plan.name}`}
                packageType="SUBSCRIPTION"
                packageId={plan.id}
                currentPlan={currentPlan}
              />
            ))}
          </div>
        </div>
      </section>

      {/* <section className="bg-[#f8f9fb] py-16 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <SectionHeading
            title="Banner Advertising Packages"
            subtitle="Premium placements across ToolingTrends.com"
          />

          <div className="overflow-x-auto rounded-2xl border border-[#e5e9ef] bg-white shadow-sm">
            <table className="min-w-[900px] w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#2a3d47] text-white">
                  <th className="px-4 py-4 text-sm font-semibold sm:px-6">Position</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold sm:px-6">Monthly</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold sm:px-6">Quarterly</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold sm:px-6">Annual</th>
                </tr>
              </thead>
              <tbody>
                {bannerPackages.map((row: any, index: number) => (
                  <tr
                    key={row.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#f8f9fb]"}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[#121213] sm:px-6">
                      {row.name}
                    </td>
                    {bannerDurations.map((duration) => {
                      const price = row.metadata?.[duration] || row[duration];
                      return (
                        <td key={duration} className="px-4 py-3 text-center sm:px-6">
                          <div className="text-sm font-medium text-[#2a3d47]">
                            {formatInr(price)}
                          </div>
                          <div className="mt-2 flex justify-center">
                            <PayButton
                              label="Buy"
                              packageType="BANNER"
                              packageId={`${row.id}:${duration}`}
                              variant="secondary"
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <SectionHeading
            title="Sponsored Content Packages"
            subtitle="Promote your brand with editorial and digital campaigns"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {sponsoredPackages.map((pkg: SponsoredPackage) => (
              <div
                key={pkg.id}
                className={`flex flex-col rounded-2xl border p-8 shadow-sm relative ${pkg.isHighlighted
                  ? "border-yellow-400 bg-gradient-to-b from-yellow-50 to-white"
                  : "border-[#e5e9ef] bg-white"
                  }`}
              >
                {pkg.isHighlighted && pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      {pkg.badge}
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-[#121213]">{pkg.name}</h3>
                {pkg.description && (
                  <p className="text-sm text-[#616C74] mt-1">{pkg.description}</p>
                )}
                <p className="mt-2 text-2xl font-bold text-[#004d73]">
                  {formatInr(pkg.price)}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {(pkg.metadata?.features || pkg.features || []).map((item: string) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#616C74]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <PayButton
                    label={`Buy ${pkg.name}`}
                    packageType="SPONSORED"
                    packageId={pkg.id}
                    variant="secondary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fb] py-16 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <SectionHeading
            title="Recruitment Packages"
            subtitle="Monthly job posting package — active for 30 days, then your base plan applies again"
          />

          <div className="mx-auto max-w-md rounded-2xl border border-[#e5e9ef] bg-white p-8 text-center shadow-sm">
            {recruitmentPackages.map((pkg: any) => (
              <div key={pkg.id}>
                <h3 className="text-xl font-semibold text-[#121213]">{pkg.name}</h3>
                <p className="mt-2 text-sm text-[#616C74]">
                  Valid for 30 days · adds 1 job posting slot
                </p>
                <p className="mt-3 text-3xl font-bold text-[#004d73]">
                  {formatInr(pkg.price)}
                </p>
              </div>
            ))}
            <div className="mt-8 flex flex-col items-center gap-3">
              <PayButton
                label="Buy Monthly Job Posting"
                packageType="RECRUITMENT"
                packageId="single-job"
                activeUntil={recruitmentExpiresAt}
              />
              {recruitmentExpiresAt && new Date(recruitmentExpiresAt) > new Date() ? (
                <p className="text-sm text-emerald-700">
                  Active until {new Date(recruitmentExpiresAt).toLocaleDateString()}. After that your{" "}
                  {currentPlan === "free" ? "Free" : currentPlan} plan applies.
                </p>
              ) : (
                <Link
                  href="/recruiter/jobs/new"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Post a job after purchase →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section> */}
    </main>
  );
}
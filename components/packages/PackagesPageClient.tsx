"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import PackagesHero from "./PackagesHero";
import {
  activateFreePlan,
  startPackagePayment,
  type PackageType,
} from "@/lib/razorpay";
import {
  BANNER_PACKAGES,
  formatInr,
  RECRUITMENT_PACKAGES,
  SPONSORED_CONTENT_PACKAGES,
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_PLANS,
  type FeatureValue,
  type PlanTier,
} from "@/lib/packages";

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
        onError: (message) => setError(message),
      });
      setLoading(false);
      return;
    }

    await startPackagePayment({
      packageType,
      packageId,
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
  const planKeys: PlanTier[] = ["free", "basic", "professional", "enterprise"];
  const bannerDurations = ["monthly", "quarterly", "annual"] as const;
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [recruitmentExpiresAt, setRecruitmentExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrentPlan() {
      const token = localStorage.getItem("token");
      if (!token) return;

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
        // ignore — user may not be logged in
      }
    }

    loadCurrentPlan();
  }, []);

  return (
    <main className="w-full bg-white">
            <PackagesHero
        title="Packages & Pricing"
        breadcrumbLabel="Packages"
        description="Grow your visibility on ToolingTrends.com with subscription plans, banner advertising, sponsored content, and recruitment packages. Secure checkout powered by Razorpay."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <SectionHeading
            title="ToolingTrends.com Subscription Plans"
            subtitle="Annual membership plans for suppliers and manufacturers"
          />

          <div className="overflow-x-auto rounded-2xl border border-[#e5e9ef] shadow-sm">
            <table className="min-w-[900px] w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#2a3d47] text-white">
                  <th className="px-4 py-4 text-sm font-semibold sm:px-6">Feature</th>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      className="px-4 py-4 text-center text-sm font-semibold sm:px-6"
                    >
                      <div>{plan.name}</div>
                      <div className="mt-1 text-xs font-normal text-white/80">
                        {plan.price === 0 ? "₹0" : `${formatInr(plan.price)}/year`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUBSCRIPTION_FEATURES.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#f8f9fb]"}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[#121213] sm:px-6">
                      {feature.name}
                    </td>
                    {planKeys.map((key) => (
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
            {SUBSCRIPTION_PLANS.map((plan) => (
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
                {BANNER_PACKAGES.map((row, index) => (
                  <tr
                    key={row.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#f8f9fb]"}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[#121213] sm:px-6">
                      {row.position}
                    </td>
                    {bannerDurations.map((duration) => (
                      <td key={duration} className="px-4 py-3 text-center sm:px-6">
                        <div className="text-sm font-medium text-[#2a3d47]">
                          {formatInr(row[duration])}
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
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section> */}

      {/* <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <SectionHeading
            title="Sponsored Content Packages"
            subtitle="Promote your brand with editorial and digital campaigns"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SPONSORED_CONTENT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col rounded-2xl border border-[#e5e9ef] bg-white p-8 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[#121213]">{pkg.name}</h3>
                <p className="mt-2 text-2xl font-bold text-[#004d73]">
                  {formatInr(pkg.price)}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {pkg.features.map((item) => (
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
      </section> */}

      {/* <section className="bg-[#f8f9fb] py-16 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <SectionHeading
            title="Recruitment Packages"
            subtitle="Monthly job posting package — active for 30 days, then your base plan applies again"
          />

          <div className="mx-auto max-w-md rounded-2xl border border-[#e5e9ef] bg-white p-8 text-center shadow-sm">
            {RECRUITMENT_PACKAGES.map((pkg) => (
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



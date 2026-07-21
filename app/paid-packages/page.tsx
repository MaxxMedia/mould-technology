"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import {
  startPackagePayment,
  type PackageType,
} from "@/lib/razorpay";
import {
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_PLANS,
  formatInr,
  type FeatureValue,
  type PlanTier,
} from "@/lib/packages";

// Paid tiers only — Free is intentionally excluded from this page.
const PAID_PLANS = SUBSCRIPTION_PLANS.filter((plan) => plan.id !== "free");
const PAID_PLAN_KEYS = PAID_PLANS.map((plan) => plan.id) as Exclude<PlanTier, "free">[];

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
      <div className="mx-auto mt-4 h-[2px] w-12 bg-[#D71920]" />
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
}: {
  label: string;
  packageType: PackageType;
  packageId: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  currentPlan?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isCurrentPlan =
    packageType === "SUBSCRIPTION" && currentPlan === packageId;

  const baseClass =
    variant === "primary"
      ? "bg-[#D71920] hover:bg-red-700 text-white"
      : "bg-[#2a3d47] hover:bg-[#1f2d34] text-white";

  const handleClick = async () => {
    if (isCurrentPlan) return;

    setError("");
    setLoading(true);

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
        disabled={loading || disabled || isCurrentPlan}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${baseClass}`}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
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

export default function PaidPackage() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

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
        }
      } catch {
        // ignore — user may not be logged in
      }
    }

    loadCurrentPlan();
  }, []);

  return (
    <section className="bg-white">
      {/* Header */}
      <div
        className="relative py-20 overflow-hidden"
        style={{
          backgroundImage: "url('/standout-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-[1320px] mx-auto px-6 md:px-16 text-center">
          <h1
            className="mb-4 text-[#11cbe4]"
            style={{ fontFamily: "Oswald, sans-serif", fontSize: "48px", fontWeight: 400, lineHeight: "1.1" }}
          >
            Choose Your Plan
          </h1>
          <p
            className="text-white max-w-[640px] mx-auto"
            style={{ fontFamily: "Roboto, sans-serif", fontSize: "18px", lineHeight: "28px" }}
          >
            Upgrade your listing to unlock stronger visibility, more product capacity,
            and premium placement across the platform. Secure checkout powered by Razorpay.
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="max-w-[1320px] mx-auto px-6 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PAID_PLANS.map((plan) => {
            const isFeatured = plan.id === "professional";

            return (
              <div
                key={plan.id}
                className={`relative border ${
                  isFeatured ? "border-[#D71920] shadow-xl scale-[1.03]" : "shadow-xl scale-[1.03] border-gray-200"
                } bg-white flex flex-col`}
              >
                {isFeatured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D71920] text-white text-xs font-semibold px-4 py-1"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  >
                    MOST POPULAR
                  </div>
                )}

                <div className="p-8 border-b border-gray-100">
                  <h3
                    className="mb-2"
                    style={{ fontFamily: "Oswald, sans-serif", fontSize: "26px", fontWeight: 400 }}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{formatInr(plan.price)}</span>
                    <span className="text-sm text-gray-500">/year</span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {SUBSCRIPTION_FEATURES.filter((f) => f[plan.id] !== false).slice(0, 8).map((f) => (
                      <li key={f.name} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0a8f18]" strokeWidth={2.5} />
                        <span>
                          {f.name}
                          {typeof f[plan.id] === "string" && (
                            <span className="text-gray-400"> — {f[plan.id]}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <PayButton
                    label={`Buy ${plan.name}`}
                    packageType="SUBSCRIPTION"
                    packageId={plan.id}
                    currentPlan={currentPlan}
                    variant={isFeatured ? "primary" : "secondary"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full comparison table */}
      <div className="max-w-[1320px] mx-auto px-6 md:px-16 pb-20">
        <SectionHeading
          title="Compare Everything"
          subtitle="Every feature across Basic, Professional, and Enterprise"
        />

        <div className="overflow-x-auto rounded-2xl border border-[#e5e9ef] shadow-sm">
          <table className="min-w-[900px] w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#2a3d47] text-white">
                <th className="px-4 py-4 text-sm font-semibold sm:px-6">Feature</th>
                {PAID_PLANS.map((plan) => (
                  <th
                    key={plan.id}
                    className="px-4 py-4 text-center text-sm font-semibold sm:px-6"
                  >
                    <div>{plan.name}</div>
                    <div className="mt-1 text-xs font-normal text-white/80">
                      {formatInr(plan.price)}/year
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
                  {PAID_PLAN_KEYS.map((key) => (
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
          {PAID_PLANS.map((plan) => (
            <PayButton
              key={plan.id}
              label={`Buy ${plan.name}`}
              packageType="SUBSCRIPTION"
              packageId={plan.id}
              currentPlan={currentPlan}
              variant={plan.id === "professional" ? "primary" : "secondary"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
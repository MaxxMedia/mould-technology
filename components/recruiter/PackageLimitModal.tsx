"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { ContentLimitEligibility } from "@/lib/packageLimits";

export default function PackageLimitModal({
  open,
  onClose,
  title,
  eligibility,
  usedLabel = "Used",
  usedValue,
  limitValue,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eligibility?: ContentLimitEligibility | null;
  usedLabel?: string;
  usedValue?: number;
  limitValue?: number | "Unlimited";
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {eligibility?.message ||
                "You've reached your package limit. Upgrade to continue."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {eligibility && !eligibility.isUnlimited && usedValue !== undefined && (
          <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p>
              <span className="font-medium">Current plan:</span>{" "}
              {eligibility.planLabel}
            </p>
            <p className="mt-1">
              <span className="font-medium">{usedLabel}:</span> {usedValue} of{" "}
              {limitValue ?? eligibility.effectiveLimit}
              {eligibility.periodLabel ? ` ${eligibility.periodLabel}` : ""}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/packages"
            className="flex-1 rounded-lg bg-[#004d73] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#003a59]"
            onClick={onClose}
          >
            View Packages
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

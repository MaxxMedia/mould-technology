"use client";

import { useState } from "react";
import Link from "next/link";
import PackageLimitModal from "@/components/recruiter/PackageLimitModal";
import type { ContentLimitEligibility } from "@/lib/packageLimits";

export default function CreateArticleButton({
  eligibility,
  className = "bg-black text-white px-5 py-2 rounded-lg",
  label = "+ Create Article",
}: {
  eligibility?: ContentLimitEligibility | null;
  className?: string;
  label?: string;
}) {
  const [showModal, setShowModal] = useState(false);

  if (eligibility?.canCreate) {
    return (
      <Link href="/recruiter/articles/create" className={className}>
        {label}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={className}
      >
        {label}
      </button>
      <PackageLimitModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Article limit reached"
        eligibility={eligibility}
        usedLabel="Articles"
        usedValue={eligibility?.articlesThisYear}
        limitValue={eligibility?.effectiveLimit}
      />
    </>
  );
}

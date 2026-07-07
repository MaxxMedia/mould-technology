export type ContentLimitEligibility = {
  canCreate?: boolean;
  canAdd?: boolean;
  plan?: string;
  planLabel?: string;
  articlesThisYear?: number;
  activeListings?: number;
  effectiveLimit?: number | "Unlimited";
  remaining?: number | null;
  isUnlimited?: boolean;
  periodLabel?: string;
  upgradeRequired?: boolean;
  message?: string;
};

export async function fetchArticlePostingEligibility(
  token: string
): Promise<ContentLimitEligibility> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/recruiter/articles/eligibility`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to load article eligibility");
  }

  return res.json();
}

export async function fetchProductListingEligibility(
  token: string
): Promise<ContentLimitEligibility> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/recruiter/product-listings/eligibility`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to load product listing eligibility");
  }

  return res.json();
}

// lib/packageLimits.ts - FULL COMPLETE VERSION

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
  maxCoverImages?: number;
  allowWhatsapp?: boolean;
  reason?: string;
  usedThisPeriod?: number;
};

export type CompanyProfileEligibility = {
  canEdit: boolean;
  plan: string;
  planLabel: string;
  descriptionLimit: number | null;
  coverBanner: boolean;
  website: boolean;
  googleMap: boolean;
  whatsapp: boolean;
  contactDetails: "Limited" | "Full";
  galleryImages: number | null;
  factoryImages: number | null;
  productImages: number | null;
  productCategories: number | null;
  productListings: number | null;
  productVideos: number | null;
  productCatalogues: number | null;
  brochures: boolean;
  certifications: boolean;
  brandsRepresented: number | null;
  industriesServed: number | null;
  exportMarkets: boolean;
  manufacturingCapabilities: string | boolean;
  machineryList: string | boolean;
  qualityStandards: boolean;
  teamMembers: number | null;
  inquiryForm: string;
};

export async function fetchCompanyProfileEligibility(
  token: string
): Promise<CompanyProfileEligibility> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/recruiter/company-profile/eligibility`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Failed to load company profile eligibility");
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

// ✅ ADD THIS FUNCTION - It was missing
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
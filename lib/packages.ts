export type PlanTier = "free" | "basic" | "professional" | "enterprise";

export type FeatureValue = boolean | string;

export type SubscriptionFeature = {
  name: string;
  free: FeatureValue;
  basic: FeatureValue;
  professional: FeatureValue;
  enterprise: FeatureValue;
};

export const SUBSCRIPTION_PLANS = [
  { id: "free" as const, name: "Free", price: 0 },
  { id: "basic" as const, name: "Basic", price: 9999 },
  { id: "professional" as const, name: "Professional", price: 24999 },
  { id: "enterprise" as const, name: "Enterprise", price: 99999 },
] as const;

export const SUBSCRIPTION_FEATURES: SubscriptionFeature[] = [
  { name: "Company Profile", free: true, basic: "Enhanced", professional: "Premium", enterprise: "Premium+" },
  { name: "Company Logo", free: true, basic: true, professional: true, enterprise: true },
  { name: "Contact Details", free: "Limited", basic: "Full", professional: "Full", enterprise: "Full" },
  { name: "Website Link", free: true, basic: true, professional: true, enterprise: true },
  { name: "Product Listings", free: "5", basic: "25", professional: "Unlimited", enterprise: "Unlimited" },
  { name: "Product Catalogue PDF", free: false, basic: true, professional: true, enterprise: true },
  { name: "Product Videos", free: false, basic: "5", professional: "Unlimited", enterprise: "Unlimited" },
  { name: "Technical Articles", free: false, basic: "4/year", professional: "Unlimited", enterprise: "Unlimited" },
  { name: "Company News", free: false, basic: "Monthly", professional: "Unlimited", enterprise: "Unlimited" },
  { name: "Press Releases", free: false, basic: "6/year", professional: "Unlimited", enterprise: "Unlimited" },
  { name: "Industry White Papers", free: false, basic: false, professional: true, enterprise: true },
  { name: "Job Postings", free: "2", basic: "20", professional: "Unlimited", enterprise: "Unlimited" },
  { name: "Internship Listings", free: false, basic: true, professional: true, enterprise: true },
  { name: "RFQ Leads", free: false, basic: true, professional: "Priority", enterprise: "Premium" },
  { name: "Buyer Enquiries", free: false, basic: true, professional: true, enterprise: "Priority" },
  { name: "Featured in Search", free: false, basic: true, professional: "Top Results", enterprise: "#1 Priority" },
  { name: "Homepage Featured", free: false, basic: false, professional: "Monthly", enterprise: "Weekly" },
  { name: "Newsletter Promotion", free: false, basic: "Once/Quarter", professional: "Monthly", enterprise: "Every Issue" },
  { name: "Social Media Promotion", free: false, basic: "Monthly", professional: "Weekly", enterprise: "Multiple Weekly" },
  { name: "Video Interview", free: false, basic: false, professional: "1/year", enterprise: "4/year" },
  { name: "CEO Interview", free: false, basic: false, professional: true, enterprise: true },
  { name: "Podcast Feature", free: false, basic: false, professional: "1 Episode", enterprise: "Quarterly" },
  { name: "Event Calendar Listing", free: true, basic: "Priority", professional: "Featured", enterprise: "Featured" },
  { name: "Exhibition Discounts", free: false, basic: "10%", professional: "20%", enterprise: "30%" },
  { name: "Webinar Hosting", free: false, basic: false, professional: "2/year", enterprise: "Unlimited" },
  { name: "Lead Analytics", free: false, basic: "Basic", professional: "Advanced", enterprise: "Enterprise" },
  { name: "Monthly Reports", free: false, basic: false, professional: true, enterprise: true },
  { name: "Dedicated Account Manager", free: false, basic: false, professional: false, enterprise: true },
];

export const BANNER_PACKAGES = [
  { id: "homepage-hero", position: "Homepage Hero Banner", monthly: 40000, quarterly: 108000, annual: 360000 },
  { id: "homepage-sidebar", position: "Homepage Sidebar", monthly: 18000, quarterly: 48000, annual: 160000 },
  { id: "category", position: "Category Banner", monthly: 12000, quarterly: 32000, annual: 110000 },
  { id: "article", position: "Article Banner", monthly: 8000, quarterly: 22000, annual: 75000 },
  { id: "sticky", position: "Sticky Banner", monthly: 25000, quarterly: 70000, annual: 240000 },
] as const;

export const SPONSORED_CONTENT_PACKAGES = [
  {
    id: "bronze",
    name: "Bronze",
    price: 15000,
    features: ["Sponsored Article", "Social Media Promotion", "Newsletter Mention"],
  },
  {
    id: "silver",
    name: "Silver",
    price: 35000,
    features: [
      "Featured Article",
      "Homepage for 7 Days",
      "LinkedIn Promotion",
      "Newsletter Feature",
      "SEO Optimized",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 60000,
    features: [
      "Premium Sponsored Story",
      "Homepage for 30 Days",
      "Video Interview",
      "Newsletter",
      "Social Campaign",
      "Lead Collection Form",
    ],
  },
] as const;

export const RECRUITMENT_PACKAGES = [
  { name: "Single Job (30 Days)", price: 2000 },
] as const;

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

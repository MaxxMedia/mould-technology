"use client";

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
    };
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export type PackageType = "SUBSCRIPTION" | "BANNER" | "SPONSORED" | "RECRUITMENT";

// Helper to update user in localStorage
function updateUserPackageStatus() {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    user.packageSelected = true;
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("userChanged"));
  }
}

export async function startPackagePayment({
  packageType,
  packageId,
  onSuccess,
  onError,
}: {
  packageType: PackageType;
  packageId: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = `/signup?role=recruiter&redirect=${encodeURIComponent("/packages")}`;
    return;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    onError?.("Failed to load payment gateway");
    return;
  }

  try {
    const orderRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageType, packageId }),
      }
    );

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      onError?.(orderData.error || "Could not start payment");
      return;
    }

    const rzp = new window.Razorpay({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Tooling Trends",
      description: orderData.packageName,
      order_id: orderData.orderId,
      prefill: orderData.prefill,
      theme: { color: "#004d73" },
      handler: async (response) => {
        const verifyRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(response),
          }
        );

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          onError?.(verifyData.error || "Payment verification failed");
          return;
        }

        // ✅ Update localStorage with packageSelected = true
        updateUserPackageStatus();

        onSuccess?.();

        // ✅ Redirect to onboarding after successful payment
        window.location.href = "/recruiter/onboarding";
      },
      modal: {
        ondismiss: () => onError?.("Payment cancelled"),
      },
    });

    rzp.on("payment.failed", (response) => {
      onError?.(response.error.description || "Payment failed");
    });

    rzp.open();
  } catch {
    onError?.("Something went wrong. Please try again.");
  }
}

export async function activateFreePlan({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = `/signup?role=recruiter&redirect=${encodeURIComponent("/packages")}`;
    return;
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payments/activate-free`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) {
      onError?.(data.error || "Could not activate free plan");
      return;
    }

    // ✅ Update localStorage with packageSelected = true
    updateUserPackageStatus();

    if (data.alreadyActive) {
      onSuccess?.();
      // ✅ Redirect to onboarding after free plan activation
      window.location.href = "/recruiter/onboarding";
      return;
    }

    onSuccess?.();
    // ✅ Redirect to onboarding after free plan activation
    window.location.href = "/recruiter/onboarding";
  } catch {
    onError?.("Something went wrong. Please try again.");
  }
}

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
  { name: "Email Support", free: true, basic: true, professional: true, enterprise: "Priority" },
  { name: "Phone Support", free: false, basic: false, professional: true, enterprise: true },
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
  { id: "single-job", name: "Single Job (Monthly · 30 Days)", price: 2000, durationDays: 30 },
] as const;

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
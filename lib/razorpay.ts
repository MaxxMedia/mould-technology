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

        onSuccess?.();
        window.location.href = "/packages/success";
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

    onSuccess?.();
    window.location.href = "/packages/success?plan=free";
  } catch {
    onError?.("Something went wrong. Please try again.");
  }
}

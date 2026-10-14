import type { PackageType } from "./razorpay";

export type CompanyTrial = {
  eligible: boolean;
  status: "ELIGIBLE" | "ACTIVE" | "EXPIRED" | "CONVERTED";
  days: number;
  startsAt?: string;
  expiresAt?: string;
  daysRemaining?: number;
  packageType?: PackageType;
  packageId?: string;
  packageName?: string;
  purchaseId?: number;
};

export async function startCompanyTrial(packageType: PackageType, packageId: string): Promise<CompanyTrial | null> {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/signup?role=recruiter&redirect=" + encodeURIComponent("/packages");
    return null;
  }
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/payments/start-trial", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ packageType, packageId }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || "Unable to start your trial. Please try again.");
  try {
    const cached = localStorage.getItem("user");
    if (cached) {
      const user = JSON.parse(cached);
      localStorage.setItem("user", JSON.stringify({ ...user, packageSelected: true }));
      window.dispatchEvent(new Event("userChanged"));
    }
  } catch { /* Cache failures do not change a successful server activation. */ }
  return data.trial;
}

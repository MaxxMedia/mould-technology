"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type FreshUser = {
  id: number;
  role: string;
  packageSelected: boolean;
  isOnboarded: boolean;
  companyId: number | null;
  subscriptionPlan: string;
  [key: string]: any;
};

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
          router.push("/login");
          return;
        }

        let user: FreshUser = JSON.parse(userStr);

        // ✅ FIX (root cause #4/#6): don't trust the cached snapshot for
        // gating decisions. Refresh from /api/auth/me first so
        // packageSelected / isOnboarded / subscriptionPlan are current —
        // this is what makes "refresh the page still shows correct plan"
        // and "dashboard immediately shows purchased plan" work, even if
        // some other screen forgot to update localStorage after payment.
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.ok) {
            const freshUser: FreshUser = await res.json();
            user = { ...user, ...freshUser };
            localStorage.setItem("user", JSON.stringify(user));
            window.dispatchEvent(new Event("userChanged"));
          }
        } catch {
          // offline or API down — fall back to cached user below
        }

        if (user.role !== "recruiter") {
          router.push("/");
          return;
        }

        // If on packages page, allow access
        if (pathname === "/packages") {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // If on onboarding page, check package selected
        if (pathname === "/recruiter/onboarding") {
          if (!user.packageSelected) {
            router.push("/packages");
            return;
          }
          if (user.isOnboarded) {
            router.push("/recruiter/dashboard");
            return;
          }
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // For protected routes, check both package and onboarding
        const protectedRoutes = [
          "/recruiter/dashboard",
          "/recruiter/products",
          "/recruiter/articles",
          "/recruiter/company",
          "/recruiter/jobs",
          "/recruiter/team",
          "/recruiter/settings",
          "/recruiter/leads",
          "/recruiter/rfq",
        ];

        const isProtectedRoute = protectedRoutes.some((route) =>
          pathname.startsWith(route)
        );

        if (isProtectedRoute) {
          if (!user.packageSelected) {
            router.push("/packages");
            return;
          }
          if (!user.isOnboarded) {
            router.push("/recruiter/onboarding");
            return;
          }
        }

        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    };

    checkAccess();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0073FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
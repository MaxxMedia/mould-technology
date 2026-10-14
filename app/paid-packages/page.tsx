import { Suspense } from "react";
import PackagesPageClient from "@/components/packages/PackagesPageClient";

export default function PaidPackagesPage() {
  return <Suspense fallback={<div className="p-10 text-center">Loading packages...</div>}><PackagesPageClient /></Suspense>;
}

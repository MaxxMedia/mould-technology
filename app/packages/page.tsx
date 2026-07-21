import { Suspense } from "react";
import PackagesPageClient from "@/components/packages/PackagesPageClient";

export default function PackagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d73] mx-auto" />
          <p className="mt-4 text-gray-600">Loading packages...</p>
        </div>
      </div>
    }>
      <PackagesPageClient />
    </Suspense>
  );
}

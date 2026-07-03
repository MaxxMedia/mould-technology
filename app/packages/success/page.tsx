import Link from "next/link";

export default function PackageSuccessPage() {
  return (
    <main className="w-full bg-white">
      <section className="py-24 text-center">
        <div className="mx-auto max-w-lg px-6">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
            ✓
          </div>
          <h1 className="text-3xl font-semibold text-[#121213]">Payment Successful</h1>
          <p className="mt-4 text-[#616C74]">
            Your package has been activated. You can view your plan and purchase
            history in your recruiter dashboard.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/recruiter/dashboard"
              className="rounded-lg bg-[#004d73] px-6 py-3 text-sm font-semibold text-white hover:bg-[#003a59]"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/packages"
              className="rounded-lg border border-[#e5e9ef] px-6 py-3 text-sm font-semibold text-[#2a3d47] hover:bg-[#f8f9fb]"
            >
              View Packages
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

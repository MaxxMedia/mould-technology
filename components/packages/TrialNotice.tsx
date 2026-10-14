import Link from "next/link";
import type { CompanyTrial } from "@/lib/companyTrial";

export default function TrialNotice({ trial }: { trial?: CompanyTrial | null }) {
  if (!trial || trial.status === "CONVERTED") return null;
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
      {trial.status === "ACTIVE" ? (
        <>
          <p className="font-semibold">{trial.packageName} free trial</p>
          <p className="mt-1">Ends {new Date(trial.expiresAt!).toLocaleString()}. Renew to continue these benefits. No automatic charge.</p>
          <p className="mt-1">Changing your trial package keeps the same end date. Choosing Free ends the trial. Saved content stays in your account after expiry.</p>
          <Link href="/packages" className="mt-2 inline-block font-semibold underline">Renew or change package</Link>
        </>
      ) : trial.status === "EXPIRED" ? (
        <>
          <p className="font-semibold">Your free trial has ended</p>
          <p className="mt-1">Your current plan limits apply. All saved content is retained. Renew to restore the features included in your chosen package.</p>
          <Link href="/packages" className="mt-2 inline-block font-semibold underline">Choose a package</Link>
        </>
      ) : (
        <>
          <p className="font-semibold">Try any package free for 30 days</p>
          <p className="mt-1">One trial per company, shared by your team. Choose a package to start. No payment is needed for the trial.</p>
          <Link href="/packages" className="mt-2 inline-block font-semibold underline">Choose your trial</Link>
        </>
      )}
    </div>
  );
}

"use client";

import AdminPackages from "@/components/admin/AdminPackages";
import { useEffect, useState } from "react";

type Purchase = {
  id: number;
  packageType: string;
  packageId: string;
  packageName: string;
  amount: number;
  status: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  User?: { email: string; fullName?: string };
  Company?: { name: string; subscriptionPlan?: string };
};

export default function AdminPackagesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
    planBreakdown: [] as { plan: string; planLabel: string; count: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalRevenue: data.totalRevenue ?? 0,
            paidCount: data.paidCount ?? 0,
            pendingCount: data.pendingCount ?? 0,
            planBreakdown: data.planBreakdown ?? [],
          });
          setPurchases(data.recentPurchases ?? []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading package data...</p>;
  }

  return (

    <>
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">
          Packages &amp; Payments
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-indigo-700 mt-2">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-600">Paid Orders</p>
            <p className="text-3xl font-bold text-emerald-700 mt-2">{stats.paidCount}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-600">Pending Orders</p>
            <p className="text-3xl font-bold text-amber-700 mt-2">{stats.pendingCount}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscription Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.planBreakdown.map((row) => (
            <div key={row.plan} className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <p className="text-sm text-gray-600">{row.planLabel}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{row.count}</p>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Purchases</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{purchase.packageName}</td>
                  <td className="px-4 py-3">{purchase.packageType}</td>
                  <td className="px-4 py-3">
                    {purchase.User?.fullName || purchase.User?.email || "—"}
                  </td>
                  <td className="px-4 py-3">{purchase.Company?.name || "—"}</td>
                  <td className="px-4 py-3">₹{purchase.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">{purchase.status}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {purchase.razorpayPaymentId || purchase.razorpayOrderId || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(purchase.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AdminPackages/>
    </>
  );
}

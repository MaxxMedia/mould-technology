"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PaymentStats = {
  totalRevenue: number;
  paidCount: number;
  pendingCount: number;
  planBreakdown: { plan: string; planLabel: string; count: number }[];
  recentPurchases: {
    id: number;
    packageName: string;
    packageType: string;
    amount: number;
    status: string;
    createdAt: string;
    User?: { email: string; fullName?: string };
    Company?: { name: string };
  }[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ posts: 0, categories: 0, authors: 0 });
  const [payments, setPayments] = useState<PaymentStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const [p, c, a, paymentRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authors`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [pd, cd, ad] = await Promise.all([p.json(), c.json(), a.json()]);
        setStats({
          posts: pd?.data?.length ?? pd.length ?? 0,
          categories: cd?.data?.length ?? cd.length ?? 0,
          authors: ad?.data?.length ?? ad.length ?? 0,
        });

        if (paymentRes.ok) {
          setPayments(await paymentRes.json());
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">
        Admin Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Posts" value={stats.posts} />
        <StatCard title="Categories" value={stats.categories} />
        <StatCard title="Authors" value={stats.authors} />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">Package &amp; Payments</h3>
        <Link
          href="/admin/packages"
          className="text-sm font-medium text-indigo-700 hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${(payments?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
        />
        <StatCard title="Paid Orders" value={payments?.paidCount ?? 0} />
        <StatCard title="Pending Orders" value={payments?.pendingCount ?? 0} />
        <StatCard
          title="Active Plans"
          value={payments?.planBreakdown?.reduce((sum, row) => sum + row.count, 0) ?? 0}
        />
      </div>

      {payments?.planBreakdown && payments.planBreakdown.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {payments.planBreakdown.map((row) => (
            <div
              key={row.plan}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center"
            >
              <p className="text-sm text-gray-600">{row.planLabel}</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{row.count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">Package</th>
              <th className="px-4 py-3 font-semibold text-gray-700">User</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Company</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {(payments?.recentPurchases ?? []).map((purchase) => (
              <tr key={purchase.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{purchase.packageName}</td>
                <td className="px-4 py-3">
                  {purchase.User?.fullName || purchase.User?.email || "—"}
                </td>
                <td className="px-4 py-3">{purchase.Company?.name || "—"}</td>
                <td className="px-4 py-3">
                  ₹{purchase.amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      purchase.status === "PAID"
                        ? "bg-emerald-100 text-emerald-700"
                        : purchase.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {purchase.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {(!payments?.recentPurchases || payments.recentPurchases.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No package purchases yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-4xl font-bold text-indigo-700">{value}</p>
    </div>
  );
}

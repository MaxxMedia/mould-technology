"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  FolderOpen,
  Calendar,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type Slice = { name: string; key: string; value: number };

type Analytics = {
  overview: {
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalPosts: number;
    totalDirectories: number;
    totalEvents: number;
    totalRevenue: number;
    paidOrders: number;
    pendingOrders: number;
  };
  usersByRole: Slice[];
  subscriptionPlans: Slice[];
  directoryStatus: Slice[];
  postStatus: Slice[];
  paymentStatus: Slice[];
  applicationStatus: Slice[];
  revenueByMonth: { month: string; revenue: number }[];
  growthByMonth: {
    month: string;
    users: number;
    jobs: number;
    applications: number;
  }[];
  recentPurchases: {
    id: number;
    packageName: string;
    amount: number;
    status: string;
    createdAt: string;
    User?: { email: string; fullName?: string };
    Company?: { name: string };
  }[];
};

const PIE_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#0ea5e9",
  "#8b5cf6",
  "#64748b",
];

const planChartConfig = {
  free: { label: "Free", color: "#94a3b8" },
  basic: { label: "Basic", color: "#6366f1" },
  professional: { label: "Professional", color: "#8b5cf6" },
  enterprise: { label: "Enterprise", color: "#0ea5e9" },
} satisfies ChartConfig;

const roleChartConfig = {
  admin: { label: "Admin", color: "#6366f1" },
  recruiter: { label: "Recruiter", color: "#10b981" },
  candidate: { label: "Candidate", color: "#f59e0b" },
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "#6366f1" },
} satisfies ChartConfig;

const growthChartConfig = {
  users: { label: "New users", color: "#6366f1" },
  jobs: { label: "New jobs", color: "#10b981" },
  applications: { label: "Applications", color: "#f59e0b" },
} satisfies ChartConfig;

const directoryChartConfig = {
  pending: { label: "Pending", color: "#f59e0b" },
  approved: { label: "Approved", color: "#10b981" },
  rejected: { label: "Rejected", color: "#f43f5e" },
} satisfies ChartConfig;

const paymentChartConfig = {
  paid: { label: "Paid", color: "#10b981" },
  pending: { label: "Pending", color: "#f59e0b" },
  failed: { label: "Failed", color: "#f43f5e" },
} satisfies ChartConfig;

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function pieTotal(data: Slice[]) {
  return data.reduce((sum, row) => sum + row.value, 0);
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics`,
          { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load analytics");
        }
        setAnalytics(await res.json());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "Unable to load analytics"}
      </div>
    );
  }

  const { overview } = analytics;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Analytics Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Platform metrics, subscriptions, and growth for the last 6 months
          </p>
        </div>
        <Link
          href="/admin/packages"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <TrendingUp className="h-4 w-4" />
          Manage packages
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value={overview.totalUsers}
          accent="indigo"
        />
        <KpiCard
          icon={<Building2 className="h-5 w-5" />}
          label="Companies"
          value={overview.totalCompanies}
          accent="emerald"
        />
        <KpiCard
          icon={<Briefcase className="h-5 w-5" />}
          label="Active Jobs"
          value={overview.activeJobs}
          sub={`${overview.totalJobs} total`}
          accent="sky"
        />
        <KpiCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Total Revenue"
          value={formatCurrency(overview.totalRevenue)}
          sub={`${overview.paidOrders} paid orders`}
          accent="violet"
        />
        <KpiCard
          icon={<FileText className="h-5 w-5" />}
          label="Articles"
          value={overview.totalPosts}
          accent="amber"
        />
        <KpiCard
          icon={<FolderOpen className="h-5 w-5" />}
          label="Directories"
          value={overview.totalDirectories}
          accent="rose"
        />
        <KpiCard
          icon={<Calendar className="h-5 w-5" />}
          label="Events"
          value={overview.totalEvents}
          accent="cyan"
        />
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label="Applications"
          value={overview.totalApplications}
          accent="slate"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Subscription Plans" subtitle="Companies by active plan">
          <ChartContainer config={planChartConfig} className="mx-auto h-[280px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={analytics.subscriptionPlans}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {analytics.subscriptionPlans.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={
                      planChartConfig[entry.key as keyof typeof planChartConfig]?.color ??
                      PIE_COLORS[index % PIE_COLORS.length]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <PieLegend data={analytics.subscriptionPlans} />
        </ChartCard>

        <ChartCard title="Users by Role" subtitle={`${pieTotal(analytics.usersByRole)} registered users`}>
          <ChartContainer config={roleChartConfig} className="mx-auto h-[280px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={analytics.usersByRole}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {analytics.usersByRole.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={
                      roleChartConfig[entry.key as keyof typeof roleChartConfig]?.color ??
                      PIE_COLORS[index % PIE_COLORS.length]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <PieLegend data={analytics.usersByRole} />
        </ChartCard>

        <ChartCard title="Monthly Revenue" subtitle="Paid package orders (₹)">
          <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
            <BarChart data={analytics.revenueByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Platform Growth" subtitle="New users, jobs & applications per month">
          <ChartContainer config={growthChartConfig} className="h-[300px] w-full">
            <BarChart data={analytics.growthByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="jobs" fill="var(--color-jobs)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="applications" fill="var(--color-applications)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Directory Status" subtitle="Supplier directory approvals">
          <ChartContainer config={directoryChartConfig} className="mx-auto h-[280px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={analytics.directoryStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
              >
                {analytics.directoryStatus.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={
                      directoryChartConfig[entry.key as keyof typeof directoryChartConfig]?.color ??
                      PIE_COLORS[index % PIE_COLORS.length]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <PieLegend data={analytics.directoryStatus} />
        </ChartCard>

        <ChartCard title="Payment Status" subtitle={`${overview.pendingOrders} pending orders`}>
          <ChartContainer config={paymentChartConfig} className="mx-auto h-[280px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={analytics.paymentStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
              >
                {analytics.paymentStatus.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={
                      paymentChartConfig[entry.key as keyof typeof paymentChartConfig]?.color ??
                      PIE_COLORS[index % PIE_COLORS.length]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <PieLegend data={analytics.paymentStatus} />
        </ChartCard>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="font-semibold text-slate-900">Recent Package Purchases</h3>
            <p className="text-sm text-slate-500">Latest subscription and package orders</p>
          </div>
          <Link
            href="/admin/packages"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-600">Package</th>
                <th className="px-6 py-3 font-medium text-slate-600">User</th>
                <th className="px-6 py-3 font-medium text-slate-600">Company</th>
                <th className="px-6 py-3 font-medium text-slate-600">Amount</th>
                <th className="px-6 py-3 font-medium text-slate-600">Status</th>
                <th className="px-6 py-3 font-medium text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.recentPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {purchase.packageName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {purchase.User?.fullName || purchase.User?.email || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {purchase.Company?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-900">
                    {formatCurrency(purchase.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={purchase.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(purchase.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
              {analytics.recentPurchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No package purchases yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  accent: "indigo" | "emerald" | "sky" | "violet" | "amber" | "rose" | "cyan" | "slate";
}) {
  const accents = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    cyan: "bg-cyan-50 text-cyan-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex rounded-xl p-2.5 ${accents[accent]}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function PieLegend({ data }: { data: Slice[] }) {
  const total = pieTotal(data);
  if (total === 0) {
    return <p className="text-center text-sm text-slate-400">No data yet</p>;
  }

  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
      {data.map((row, index) => (
        <div key={row.key} className="flex items-center gap-2 text-sm text-slate-600">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
          />
          <span>
            {row.name}{" "}
            <span className="font-semibold text-slate-900">{row.value}</span>
            <span className="text-slate-400">
              {" "}
              ({Math.round((row.value / total) * 100)}%)
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "PAID"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : status === "PENDING"
        ? "bg-amber-50 text-amber-700 ring-amber-600/20"
        : "bg-red-50 text-red-700 ring-red-600/20";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles}`}>
      {status}
    </span>
  );
}

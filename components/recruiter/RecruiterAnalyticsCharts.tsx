"use client";

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
import { Eye, BarChart3 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type RecruiterAnalyticsSlice = {
  name: string;
  key: string;
  value: number;
};

export type RecruiterAnalytics = {
  overview: {
    totalJobViews: number;
    totalDirectoryViews: number;
    articlesCount: number;
    directoriesCount: number;
  };
  applicationsByStatus: RecruiterAnalyticsSlice[];
  articlesByStatus: RecruiterAnalyticsSlice[];
  directoriesByStatus: RecruiterAnalyticsSlice[];
  applicationsByMonth: { month: string; value: number }[];
  jobsPostedByMonth: { month: string; value: number }[];
  engagementByMonth: { month: string; applications: number; jobs: number }[];
  topJobsByApplications: { name: string; applications: number }[];
};

const PIE_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#0ea5e9",
  "#8b5cf6",
];

const applicationChartConfig = {
  applied: { label: "Applied", color: "#6366f1" },
  shortlisted: { label: "Shortlisted", color: "#10b981" },
  rejected: { label: "Rejected", color: "#f43f5e" },
  interviewed: { label: "Interviewed", color: "#0ea5e9" },
  hired: { label: "Hired", color: "#8b5cf6" },
} satisfies ChartConfig;

const contentChartConfig = {
  pending: { label: "Pending", color: "#f59e0b" },
  approved: { label: "Approved", color: "#10b981" },
  rejected: { label: "Rejected", color: "#f43f5e" },
} satisfies ChartConfig;

const applicationsMonthConfig = {
  value: { label: "Applications", color: "#6366f1" },
} satisfies ChartConfig;

const engagementChartConfig = {
  applications: { label: "Applications", color: "#6366f1" },
  jobs: { label: "Jobs posted", color: "#10b981" },
} satisfies ChartConfig;

const topJobsConfig = {
  applications: { label: "Applications", color: "#8b5cf6" },
} satisfies ChartConfig;

function pieTotal(data: RecruiterAnalyticsSlice[]) {
  return data.reduce((sum, row) => sum + row.value, 0);
}

function PieLegend({ data }: { data: RecruiterAnalyticsSlice[] }) {
  const total = pieTotal(data);
  if (total === 0) {
    return <p className="text-center text-sm text-gray-400">No data yet</p>;
  }

  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
      {data.map((row, index) => (
        <div key={row.key} className="flex items-center gap-2 text-sm text-gray-600">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
          />
          <span>
            {row.name}{" "}
            <span className="font-semibold text-gray-900">{row.value}</span>
            <span className="text-gray-400">
              {" "}
              ({Math.round((row.value / total) * 100)}%)
            </span>
          </span>
        </div>
      ))}
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
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function RecruiterAnalyticsCharts({
  analytics,
  applicationsCount,
  shortlistedCount,
}: {
  analytics: RecruiterAnalytics;
  applicationsCount: number;
  shortlistedCount: number;
}) {
  const { overview } = analytics;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Recruitment Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Performance overview for the last 6 months
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat
          label="Job Views"
          value={overview.totalJobViews}
          icon={<Eye className="h-4 w-4" />}
          color="indigo"
        />
        <MiniStat
          label="Directory Views"
          value={overview.totalDirectoryViews}
          icon={<Eye className="h-4 w-4" />}
          color="amber"
        />
        <MiniStat
          label="Shortlisted"
          value={shortlistedCount}
          icon={<BarChart3 className="h-4 w-4" />}
          color="emerald"
        />
        <MiniStat
          label="Total Applications"
          value={applicationsCount}
          icon={<BarChart3 className="h-4 w-4" />}
          color="purple"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Application Status"
          subtitle="How candidates are progressing"
        >
          <ChartContainer config={applicationChartConfig} className="mx-auto h-[260px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={analytics.applicationsByStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
              >
                {analytics.applicationsByStatus.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={
                      applicationChartConfig[
                        entry.key as keyof typeof applicationChartConfig
                      ]?.color ?? PIE_COLORS[index % PIE_COLORS.length]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <PieLegend data={analytics.applicationsByStatus} />
        </ChartCard>

        <ChartCard title="Monthly Applications" subtitle="New applications received">
          <ChartContainer config={applicationsMonthConfig} className="h-[280px] w-full">
            <BarChart data={analytics.applicationsByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Engagement Trend" subtitle="Applications vs jobs posted">
          <ChartContainer config={engagementChartConfig} className="h-[280px] w-full">
            <BarChart data={analytics.engagementByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="applications" fill="var(--color-applications)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="jobs" fill="var(--color-jobs)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Top Jobs" subtitle="Most applications by job posting">
          <ChartContainer config={topJobsConfig} className="h-[280px] w-full">
            <BarChart
              data={analytics.topJobsByApplications}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="applications" fill="var(--color-applications)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Article Status" subtitle={`${overview.articlesCount} technical articles`}>
          <ChartContainer config={contentChartConfig} className="mx-auto h-[260px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={analytics.articlesByStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={4}
              >
                {analytics.articlesByStatus.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={
                      contentChartConfig[entry.key as keyof typeof contentChartConfig]?.color ??
                      PIE_COLORS[index % PIE_COLORS.length]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <PieLegend data={analytics.articlesByStatus} />
        </ChartCard>

        <ChartCard
          title="Directory Status"
          subtitle={`${overview.directoriesCount} supplier directories`}
        >
          <ChartContainer config={contentChartConfig} className="mx-auto h-[260px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={analytics.directoriesByStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={4}
              >
                {analytics.directoriesByStatus.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={
                      contentChartConfig[entry.key as keyof typeof contentChartConfig]?.color ??
                      PIE_COLORS[index % PIE_COLORS.length]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <PieLegend data={analytics.directoriesByStatus} />
        </ChartCard>
      </div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "indigo" | "amber" | "emerald" | "purple";
}) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`mb-2 inline-flex rounded-lg p-2 ${colors[color]}`}>{icon}</div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}

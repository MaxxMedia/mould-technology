"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Dashboard = {
  totalSubscribers: number;
  activeSubscribers: number;
  inactiveSubscribers: number;
  totalCampaigns: number;
  draftCampaigns: number;
  scheduledCampaigns: number;
  sentCampaigns: number;
};

export default function NewsletterDashboard() {
  const [stats, setStats] = useState<Dashboard>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    inactiveSubscribers: 0,
    totalCampaigns: 0,
    draftCampaigns: 0,
    scheduledCampaigns: 0,
    sentCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      console.log("📡 Fetching analytics from:", `${apiUrl}/api/newsletter/analytics`);
      console.log("🔑 Token present:", !!token);

      if (!token) {
        setError("Authentication required. Please login.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/api/newsletter/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📊 Response status:", res.status);

      if (res.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error response:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Failed with status: ${res.status}`);
        } catch {
          throw new Error(`Server returned ${res.status}: ${errorText.substring(0, 100)}`);
        }
      }

      const data = await res.json();
      console.log("📦 Analytics data:", data);

      // Map backend fields to frontend fields
      setStats({
        totalSubscribers: data.totalSubscribers || 0,
        activeSubscribers: data.activeSubscribers || 0,
        inactiveSubscribers: data.inactiveSubscribers || 0,
        totalCampaigns: data.totalCampaigns || 0,
        draftCampaigns: data.draftCampaigns || 0,
        scheduledCampaigns: data.scheduledCampaigns || 0,
        sentCampaigns: data.sentCampaigns || 0,
      });
    } catch (err: any) {
      console.error("❌ Dashboard error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Dashboard</h1>
          <p className="text-gray-500 mt-2">Loading dashboard data...</p>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border bg-white p-6 shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mt-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mt-1"></div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border bg-white p-6 shadow-sm animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 p-6">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage subscribers, campaigns and templates.</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          <h3 className="font-semibold text-lg">Error loading dashboard</h3>
          <p className="mt-2">{error}</p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={loadDashboard}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Retry
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/admin/login";
              }}
              className="border border-red-300 text-red-700 px-4 py-2 rounded hover:bg-red-50 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm">
          <details>
            <summary className="font-semibold cursor-pointer">🔍 Debug Info</summary>
            <div className="mt-2 space-y-1">
              <p>
                <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}
              </p>
              <p>
                <strong>Endpoint:</strong> /api/newsletter/analytics
              </p>
              <p>
                <strong>Full URL:</strong> {process.env.NEXT_PUBLIC_API_URL}/api/newsletter/analytics
              </p>
              <p>
                <strong>Token:</strong> {localStorage.getItem("token") ? "✅ Present" : "❌ Missing"}
              </p>
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage subscribers, campaigns and templates.</p>
        </div>
        <button
          onClick={loadDashboard}
          className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card
          title="Total Subscribers"
          value={stats.totalSubscribers}
          subtitle={`${stats.activeSubscribers} active`}
        />
        <Card
          title="Active Subscribers"
          value={stats.activeSubscribers}
          subtitle={`${stats.inactiveSubscribers} inactive`}
        />
        <Card
          title="Total Campaigns"
          value={stats.totalCampaigns}
          subtitle={`${stats.sentCampaigns} sent`}
        />
        <Card
          title="Sent Campaigns"
          value={stats.sentCampaigns}
          subtitle={`${stats.draftCampaigns} draft, ${stats.scheduledCampaigns} scheduled`}
        />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickLink
            title="📧 Subscribers"
            description={`Manage ${stats.totalSubscribers} subscribers`}
            href="/admin/newsletter/subscribers"
          />
          <QuickLink
            title="📨 Campaigns"
            description={`Create and manage ${stats.totalCampaigns} campaigns`}
            href="/admin/newsletter/campaigns"
          />
          <QuickLink
            title="📝 Templates"
            description="Manage email templates"
            href="/admin/newsletter/templates"
          />
          <QuickLink
            title="📊 Analytics"
            description="View delivery statistics and performance"
            href="/admin/newsletter/analytics"
          />
        </div>
      </div>

      {/* Quick Stats Summary */}
      {stats.totalSubscribers > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
          <h3 className="font-semibold text-lg text-blue-900">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
            <div>
              <span className="text-gray-600">Conversion Rate:</span>
              <span className="ml-2 font-semibold text-blue-700">
                {stats.totalSubscribers > 0
                  ? Math.round((stats.activeSubscribers / stats.totalSubscribers) * 100)
                  : 0}
                %
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Sent:</span>
              <span className="ml-2 font-semibold text-green-700">
                {stats.sentCampaigns}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Scheduled:</span>
              <span className="ml-2 font-semibold text-yellow-700">
                {stats.scheduledCampaigns}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Drafts:</span>
              <span className="ml-2 font-semibold text-gray-700">
                {stats.draftCampaigns}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h2 className="mt-2 text-3xl font-bold text-gray-900">
        {value.toLocaleString()}
      </h2>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

function QuickLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-white p-6 hover:border-blue-500 transition shadow-sm hover:shadow-md group"
    >
      <h2 className="font-semibold text-lg group-hover:text-blue-600 transition">
        {title}
      </h2>
      <p className="text-gray-500 mt-1 text-sm">{description}</p>
      <span className="inline-block mt-3 text-blue-600 text-sm group-hover:translate-x-1 transition">
        View →
      </span>
    </Link>
  );
}
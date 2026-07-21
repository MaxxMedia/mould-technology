"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Analytics = {
  totalSubscribers: number;
  activeSubscribers: number;
  inactiveSubscribers: number;
  totalCampaigns: number;
  draftCampaigns: number;
  scheduledCampaigns: number;
  sentCampaigns: number;
  // Channel breakdown
  emailSubscribers: number;
  whatsappSubscribers: number;
  smsSubscribers: number;
  // Source breakdown
  formSubscribers: number;
  companySubscribers: number;
  adminSubscribers: number;
  importSubscribers: number;
  eventSubscribers: number;
  magazineSubscribers: number;
};

export default function NewsletterAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load analytics");
      }

      console.log("📊 Analytics data:", data);

      setAnalytics({
        totalSubscribers: data.totalSubscribers || 0,
        activeSubscribers: data.activeSubscribers || 0,
        inactiveSubscribers: data.inactiveSubscribers || 0,
        totalCampaigns: data.totalCampaigns || 0,
        draftCampaigns: data.draftCampaigns || 0,
        scheduledCampaigns: data.scheduledCampaigns || 0,
        sentCampaigns: data.sentCampaigns || 0,
        // Channel breakdown
        emailSubscribers: data.emailSubscribers || 0,
        whatsappSubscribers: data.whatsappSubscribers || 0,
        smsSubscribers: data.smsSubscribers || 0,
        // Source breakdown
        formSubscribers: data.formSubscribers || 0,
        companySubscribers: data.companySubscribers || 0,
        adminSubscribers: data.adminSubscribers || 0,
        importSubscribers: data.importSubscribers || 0,
        eventSubscribers: data.eventSubscribers || 0,
        magazineSubscribers: data.magazineSubscribers || 0,
      });
    } catch (err: any) {
      console.error("❌ Analytics error:", err);
      setError(err.message);
      setAnalytics({
        totalSubscribers: 0,
        activeSubscribers: 0,
        inactiveSubscribers: 0,
        totalCampaigns: 0,
        draftCampaigns: 0,
        scheduledCampaigns: 0,
        sentCampaigns: 0,
        emailSubscribers: 0,
        whatsappSubscribers: 0,
        smsSubscribers: 0,
        formSubscribers: 0,
        companySubscribers: 0,
        adminSubscribers: 0,
        importSubscribers: 0,
        eventSubscribers: 0,
        magazineSubscribers: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-semibold">Error loading analytics</h3>
          <p className="mt-1">{error}</p>
          <button
            onClick={loadAnalytics}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">📊 Newsletter Analytics</h1>
          <p className="text-gray-500 mt-2">
            Overview of subscribers, campaigns, and performance metrics.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAnalytics}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <Link
            href="/admin/newsletter/campaigns"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Campaigns
          </Link>
        </div>
      </div>

      {/* Subscriber Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Subscriber Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Subscribers"
            value={analytics.totalSubscribers}
            description="All time subscribers"
            icon="👥"
          />
          <StatCard
            title="Active Subscribers"
            value={analytics.activeSubscribers}
            description="Currently active"
            icon="✅"
            color="green"
          />
          <StatCard
            title="Inactive Subscribers"
            value={analytics.inactiveSubscribers}
            description="Unsubscribed or blocked"
            icon="⛔"
            color="red"
          />
          <StatCard
            title="Active Rate"
            value={`${analytics.totalSubscribers > 0 ? Math.round((analytics.activeSubscribers / analytics.totalSubscribers) * 100) : 0}%`}
            description="Active vs total"
            icon="📈"
            color="blue"
          />
        </div>
      </div>

      {/* Campaign Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Campaign Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Campaigns"
            value={analytics.totalCampaigns}
            description="All campaigns"
            icon="📨"
          />
          <StatCard
            title="Draft"
            value={analytics.draftCampaigns}
            description="In progress"
            icon="📝"
            color="gray"
          />
          <StatCard
            title="Scheduled"
            value={analytics.scheduledCampaigns}
            description="Ready to send"
            icon="📅"
            color="yellow"
          />
          <StatCard
            title="Sent"
            value={analytics.sentCampaigns}
            description="Completed"
            icon="✅"
            color="green"
          />
        </div>
      </div>

      {/* Channel Breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Channel Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Email"
            value={analytics.emailSubscribers}
            description={`${analytics.totalSubscribers > 0 ? Math.round((analytics.emailSubscribers / analytics.totalSubscribers) * 100) : 0}% of subscribers`}
            icon="📧"
            color="blue"
          />
          <StatCard
            title="WhatsApp"
            value={analytics.whatsappSubscribers}
            description={`${analytics.totalSubscribers > 0 ? Math.round((analytics.whatsappSubscribers / analytics.totalSubscribers) * 100) : 0}% of subscribers`}
            icon="💬"
            color="green"
          />
          <StatCard
            title="SMS"
            value={analytics.smsSubscribers}
            description={`${analytics.totalSubscribers > 0 ? Math.round((analytics.smsSubscribers / analytics.totalSubscribers) * 100) : 0}% of subscribers`}
            icon="📱"
            color="purple"
          />
        </div>
      </div>

      {/* Source Breakdown */}
      {analytics.totalSubscribers > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Subscriber Sources</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SourceCard
              title="Newsletter Form"
              value={analytics.formSubscribers}
              icon="📋"
            />
            <SourceCard
              title="Company Profile"
              value={analytics.companySubscribers}
              icon="🏢"
            />
            <SourceCard
              title="Admin"
              value={analytics.adminSubscribers}
              icon="👤"
            />
            <SourceCard
              title="Import"
              value={analytics.importSubscribers}
              icon="📥"
            />
            <SourceCard
              title="Event"
              value={analytics.eventSubscribers}
              icon="🎪"
            />
            <SourceCard
              title="Magazine"
              value={analytics.magazineSubscribers}
              icon="📰"
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionCard
            title="Add Subscriber"
            description="Manually add a new subscriber"
            href="/admin/newsletter/subscribers/add"
            icon="➕"
          />
          <ActionCard
            title="Create Campaign"
            description="Start a new newsletter campaign"
            href="/admin/newsletter/campaigns/create"
            icon="📨"
          />
          <ActionCard
            title="Create Template"
            description="Build a new email template"
            href="/admin/newsletter/templates/new"
            icon="📝"
          />
          <ActionCard
            title="Export Data"
            description="Export subscribers list"
            href="/admin/newsletter/subscribers/export"
            icon="📤"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
        <h3 className="font-semibold text-lg text-blue-900">📈 Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          <div>
            <span className="text-gray-600">Active Rate:</span>
            <span className="ml-2 font-semibold text-blue-700">
              {analytics.totalSubscribers > 0 ? Math.round((analytics.activeSubscribers / analytics.totalSubscribers) * 100) : 0}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">Sent Campaigns:</span>
            <span className="ml-2 font-semibold text-green-700">
              {analytics.sentCampaigns}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Scheduled:</span>
            <span className="ml-2 font-semibold text-yellow-700">
              {analytics.scheduledCampaigns}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Drafts:</span>
            <span className="ml-2 font-semibold text-gray-700">
              {analytics.draftCampaigns}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  description?: string; 
  icon?: string;
  color?: string;
}) {
  const colors = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
    red: "border-red-200 bg-red-50",
    yellow: "border-yellow-200 bg-yellow-50",
    purple: "border-purple-200 bg-purple-50",
    gray: "border-gray-200 bg-gray-50",
  };

  const colorClass = color ? colors[color as keyof typeof colors] : colors.gray;

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${colorClass}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        <div className="text-sm font-medium text-gray-600">{title}</div>
      </div>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
      {description && <div className="mt-1 text-xs text-gray-500">{description}</div>}
    </div>
  );
}

function SourceCard({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: number; 
  icon?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center shadow-sm hover:shadow-md transition-shadow">
      {icon && <div className="text-2xl">{icon}</div>}
      <div className="mt-1 text-sm font-medium text-gray-600">{title}</div>
      <div className="mt-1 text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function ActionCard({ 
  title, 
  description, 
  href, 
  icon 
}: { 
  title: string; 
  description: string; 
  href: string;
  icon?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-white p-4 text-center shadow-sm hover:border-blue-500 hover:shadow-md transition-all group"
    >
      {icon && <div className="text-2xl group-hover:scale-110 transition-transform">{icon}</div>}
      <div className="mt-2 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {title}
      </div>
      <div className="mt-1 text-xs text-gray-500">{description}</div>
    </Link>
  );
}
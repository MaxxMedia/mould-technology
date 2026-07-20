"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Campaign = {
  id: number;
  title: string;
  subject: string;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT";
  sendChannels: string[];
  recipientsCount: number;
  totalRecipients?: number;
  delivered?: number;
  opened?: number;
  clicked?: number;
  failed?: number;
  sentAt?: string;
  scheduledAt?: string;
  createdAt: string;
  emailEnabled?: boolean;
  whatsappEnabled?: boolean;
  smsEnabled?: boolean;
};

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showStats, setShowStats] = useState(false);
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      // Fetch campaigns
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/campaigns`,
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
        throw new Error(data.error || "Failed to load campaigns");
      }

      // Handle different response formats
      const campaignsData = Array.isArray(data) ? data : data.campaigns || [];
      setCampaigns(campaignsData);

      // ✅ Fetch total subscribers count
      await loadSubscriberCount();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ New function to get subscriber count
  async function loadSubscriberCount() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        setTotalSubscribers(data.activeSubscribers || data.totalSubscribers || 0);
        console.log("📊 Total subscribers:", data.activeSubscribers || data.totalSubscribers || 0);
      }
    } catch (err) {
      console.error("Failed to load subscriber count:", err);
    }
  }

  async function deleteCampaign(id: number) {
    if (!confirm("Delete this campaign?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/campaigns/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      alert("✅ Campaign deleted");
      loadCampaigns();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  async function sendCampaign(id: number) {
    if (!confirm("Send campaign now?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/campaigns/${id}/send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to send campaign");
      }

      alert(`✅ Campaign sent! ${data.totalRecipients || 0} recipients.`);
      loadCampaigns();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  async function scheduleCampaign(id: number) {
    const scheduledAt = prompt("Enter scheduled date and time (YYYY-MM-DD HH:MM):");
    if (!scheduledAt) return;

    try {
      const token = localStorage.getItem("token");
      const dateObj = new Date(scheduledAt);
      
      if (isNaN(dateObj.getTime())) {
        alert("Invalid date format. Please use YYYY-MM-DD HH:MM");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/campaigns/${id}/schedule`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scheduledAt: dateObj.toISOString() }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to schedule campaign");
      }

      alert("✅ Campaign scheduled successfully!");
      loadCampaigns();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  async function cancelCampaign(id: number) {
    if (!confirm("Cancel this scheduled campaign?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/campaigns/${id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to cancel campaign");
      }

      alert("✅ Campaign cancelled!");
      loadCampaigns();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  const filtered = useMemo(() => {
    return campaigns.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.subject.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, search, statusFilter]);

  function getStatusColor(status: string) {
    switch(status) {
      case "SENT": return "bg-green-100 text-green-700";
      case "DRAFT": return "bg-gray-200 text-gray-700";
      case "SCHEDULED": return "bg-yellow-100 text-yellow-700";
      case "SENDING": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-200 text-gray-700";
    }
  }

  function getChannelsDisplay(campaign: Campaign) {
    const channels = [];
    if (campaign.emailEnabled !== false) channels.push("📧 Email");
    if (campaign.whatsappEnabled) channels.push("💬 WhatsApp");
    if (campaign.smsEnabled) channels.push("📱 SMS");
    return channels.length ? channels.join(", ") : "📧 Email";
  }

  function formatDate(dateString?: string) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  // Calculate stats
  const stats = useMemo(() => {
    const total = campaigns.length;
    const sent = campaigns.filter(c => c.status === "SENT").length;
    const scheduled = campaigns.filter(c => c.status === "SCHEDULED").length;
    const drafts = campaigns.filter(c => c.status === "DRAFT").length;
    const totalRecipients = campaigns.reduce(
      (sum, c) => sum + (c.totalRecipients || c.recipientsCount || 0), 
      0
    );
    return { total, sent, scheduled, drafts, totalRecipients };
  }, [campaigns]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Campaigns</h1>
          <p className="text-gray-500 mt-1">
            {stats.total} total campaigns • 
            {stats.sent} sent • 
            {stats.scheduled} scheduled • 
            {stats.drafts} drafts
          </p>
          {/* ✅ Show total subscribers */}
          <p className="text-sm text-blue-600 mt-1">
            📧 {totalSubscribers} active subscribers available
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowStats(!showStats)}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>
          <Link
            href="/admin/newsletter/campaigns/create"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Campaign
          </Link>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
        <strong>💡 Tip:</strong> Create dynamic campaigns using templates with 
        <code className="bg-blue-100 px-2 py-1 rounded mx-1">{"{{posts}}"}</code> 
        placeholder. The latest content will be automatically fetched when sending.
        {totalSubscribers === 0 && (
          <div className="mt-2 text-yellow-600 bg-yellow-50 p-2 rounded">
            ⚠️ No active subscribers found. Add subscribers first to send campaigns.
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          className="border h-11 rounded-lg px-4 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border h-11 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="DRAFT">📝 Draft</option>
          <option value="SCHEDULED">📅 Scheduled</option>
          <option value="SENDING">⏳ Sending</option>
          <option value="SENT">✅ Sent</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-600">
          ❌ {error}
        </div>
      )}

      {/* Campaigns Table */}
      <div className="border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Campaign</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Channels</th>
                <th className="p-3 text-left">Recipients</th>
                {showStats && (
                  <>
                    <th className="p-3 text-left">Delivered</th>
                    <th className="p-3 text-left">Opened</th>
                    <th className="p-3 text-left">Clicked</th>
                  </>
                )}
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium">{item.title}</td>
                    <td className="p-3">{item.subject}</td>
                    <td className="p-3 text-sm">{getChannelsDisplay(item)}</td>
                    <td className="p-3">
                      <span className="font-semibold">
                        {item.totalRecipients || item.recipientsCount || 0}
                      </span>
                      {totalSubscribers > 0 && (item.totalRecipients || item.recipientsCount || 0) === 0 && (
                        <span className="ml-2 text-xs text-yellow-600">
                          (Needs update)
                        </span>
                      )}
                    </td>
                    {showStats && (
                      <>
                        <td className="p-3">{item.delivered || 0}</td>
                        <td className="p-3">{item.opened || 0}</td>
                        <td className="p-3">{item.clicked || 0}</td>
                      </>
                    )}
                    <td className="p-3">
                      <div className="space-y-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs inline-block ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                        {item.scheduledAt && (
                          <div className="text-xs text-gray-500">
                            📅 {formatDate(item.scheduledAt)}
                          </div>
                        )}
                        {item.sentAt && (
                          <div className="text-xs text-gray-500">
                            ✅ {formatDate(item.sentAt)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/newsletter/campaigns/${item.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          ✏️ Edit
                        </Link>
                        
                        {item.status === "DRAFT" && (
                          <>
                            <button
                              onClick={() => sendCampaign(item.id)}
                              className="text-green-600 hover:underline text-sm"
                              disabled={totalSubscribers === 0}
                              title={totalSubscribers === 0 ? "No subscribers available" : ""}
                            >
                              🚀 Send
                            </button>
                            <button
                              onClick={() => scheduleCampaign(item.id)}
                              className="text-yellow-600 hover:underline text-sm"
                              disabled={totalSubscribers === 0}
                              title={totalSubscribers === 0 ? "No subscribers available" : ""}
                            >
                              📅 Schedule
                            </button>
                          </>
                        )}
                        
                        {item.status === "SCHEDULED" && (
                          <>
                            <button
                              onClick={() => cancelCampaign(item.id)}
                              className="text-orange-600 hover:underline text-sm"
                            >
                              ❌ Cancel
                            </button>
                          </>
                        )}
                        
                        {item.status === "SENT" && (
                          <Link
                            href={`/admin/newsletter/campaigns/${item.id}/analytics`}
                            className="text-purple-600 hover:underline text-sm"
                          >
                            📊 Analytics
                          </Link>
                        )}
                        
                        <button
                          onClick={() => deleteCampaign(item.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showStats ? 9 : 7} className="text-center p-8 text-gray-500">
                    {search || statusFilter !== "all" 
                      ? "No campaigns match your filters" 
                      : "No campaigns found. Create your first campaign!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Cards */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {stats.sent}
            </div>
            <div className="text-sm text-gray-500">✅ Sent</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.scheduled}
            </div>
            <div className="text-sm text-gray-500">📅 Scheduled</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-600">
              {stats.drafts}
            </div>
            <div className="text-sm text-gray-500">📝 Drafts</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalRecipients || 0}
            </div>
            <div className="text-sm text-gray-500">Total Recipients</div>
            {stats.totalRecipients === 0 && totalSubscribers > 0 && (
              <div className="text-xs text-yellow-600 mt-1">
                Click "Send" to update
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug info */}
      <div className="text-xs text-gray-400 border-t pt-4 mt-4">
        <details>
          <summary className="cursor-pointer">Debug Info</summary>
          <div className="mt-2 space-y-1">
            <p>Total Subscribers: {totalSubscribers}</p>
            <p>Campaigns: {campaigns.length}</p>
            <p>First campaign recipients: {campaigns[0]?.recipientsCount}</p>
            <p>First campaign totalRecipients: {campaigns[0]?.totalRecipients}</p>
          </div>
        </details>
      </div>
    </div>
  );
}
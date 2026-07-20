"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Subscriber = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  companyName?: string;
  source:
    | "NEWSLETTER_FORM"
    | "COMPANY_PROFILE"
    | "ADMIN"
    | "IMPORT"
    | "EVENT"
    | "MAGAZINE";
  frequency:
    | "WEEKLY"
    | "BIWEEKLY"
    | "MONTHLY"
    | "QUARTERLY"
    | "HALF_YEARLY"
    | "YEARLY"
    | "TEN_TIMES_PER_YEAR"
    | "CUSTOM";
  emailSubscribed: boolean;
  whatsappSubscribed: boolean;
  smsSubscribed: boolean;
  status: "ACTIVE" | "UNSUBSCRIBED" | "BLOCKED";
  createdAt: string;
  plan?: string;
};

const SOURCE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Sources" },
  { value: "NEWSLETTER_FORM", label: "Newsletter Form" },
  { value: "COMPANY_PROFILE", label: "Company" },
  { value: "ADMIN", label: "Admin" },
];

export default function SubscribersPage() {
  const searchParams = useSearchParams();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadSubscribers();

    const subscribed = searchParams.get("subscribed");
    if (subscribed === "true") {
      setSuccessMessage("✅ New subscriber added successfully!");
      window.history.replaceState({}, "", "/admin/newsletter/subscribers");
    }
  }, []);

  async function loadSubscribers() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setError("❌ Authentication required. Please login.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/api/newsletter/subscribers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          setError("❌ Session expired. Please login again.");
          setLoading(false);
          return;
        }
        throw new Error(`Failed with status: ${res.status}`);
      }

      const data = await res.json();
      console.log("📊 API Response:", data); // Debug log

      // ✅ FIX: Handle the correct response format
      // The API returns { subscribers: [...] } or { data: [...] }
      let subscribersData = [];
      
      if (data.subscribers) {
        // API returns { subscribers: [...] }
        subscribersData = data.subscribers;
      } else if (data.data) {
        // Alternative format { data: [...] }
        subscribersData = data.data;
      } else if (Array.isArray(data)) {
        // Direct array
        subscribersData = data;
      } else {
        // Fallback - try to find any array property
        const firstArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
        if (firstArrayKey) {
          subscribersData = data[firstArrayKey];
        } else {
          subscribersData = [];
        }
      }

      console.log("📊 Subscribers data:", subscribersData); // Debug log
      setSubscribers(subscribersData);
    } catch (err: any) {
      console.error("❌ Load error:", err);
      setError(err.message || "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSubscriber(id: number) {
    if (!confirm("Delete subscriber?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        alert("Delete failed");
        return;
      }

      setSubscribers((prev) => prev.filter((item) => item.id !== id));
      setSuccessMessage(`✅ Subscriber deleted successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      alert("Something went wrong");
    }
  }

  const filtered = useMemo(() => {
    return subscribers.filter((item) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        item.fullName?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        item.companyName?.toLowerCase().includes(searchLower);

      const matchesFilter =
        selectedFilter === "ALL" ||
        (selectedFilter === "COMPANY_PROFILE"
          ? item.source === "COMPANY_PROFILE" || !!item.companyName
          : item.source === selectedFilter);

      const matchesPlan =
        planFilter === "ALL" ||
        (item.plan || "free").toLowerCase() === planFilter.toLowerCase();

      return matchesSearch && matchesFilter && matchesPlan;
    });
  }, [search, selectedFilter, planFilter, subscribers]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-500">Loading subscribers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadSubscribers}
            className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Newsletter Subscribers
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {subscribers.length} total
            </span>
          </h1>
          <p className="text-gray-500 mt-1">
            {filtered.length} subscribers shown
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={loadSubscribers}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
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

          <Link
            href="/admin/newsletter/subscribers/import"
            className="border px-5 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Import CSV
          </Link>

          <Link
            href="/admin/newsletter/subscribers/add"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Add Subscriber
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            className="border rounded-lg px-4 h-11 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg
            className="absolute left-3 top-3.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="border rounded-lg px-4 h-11 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {SOURCE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="border rounded-lg px-4 h-11 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="ALL">All Plans</option>
          <option value="FREE">Free</option>
          <option value="BASIC">Basic</option>
          <option value="PROFESSIONAL">Professional</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
      </div>

      <div className="overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Source</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Frequency</th>
              <th className="p-3 text-left">Channels</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center p-10 text-gray-500">
                  {subscribers.length === 0 ? (
                    <div className="space-y-2">
                      <div className="text-4xl">📭</div>
                      <p>No subscribers found</p>
                      <p className="text-sm">Subscribers will appear here once they sign up</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-4xl">🔍</div>
                      <p>No subscribers match your search</p>
                      <button
                        onClick={() => {
                          setSearch("");
                          setSelectedFilter("ALL");
                          setPlanFilter("ALL");
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-gray-500 text-xs">{index + 1}</td>
                  <td className="p-3 font-medium">{item.fullName || "N/A"}</td>
                  <td className="p-3">
                    <a
                      href={`mailto:${item.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.email || "-"}
                    </a>
                  </td>
                  <td className="p-3">{item.phoneNumber || "-"}</td>
                  <td className="p-3">{item.companyName || "-"}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {item.source}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize border ${
                      item.plan === "enterprise"
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : item.plan === "professional"
                        ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                        : item.plan === "basic"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {item.plan || "free"}
                    </span>
                  </td>
                  <td className="p-3">{item.frequency}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {item.emailSubscribed && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          📧
                        </span>
                      )}
                      {item.whatsappSubscribed && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          💬
                        </span>
                      )}
                      {item.smsSubscribed && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          📱
                        </span>
                      )}
                      {!item.emailSubscribed &&
                        !item.whatsappSubscribed &&
                        !item.smsSubscribed && (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : item.status === "UNSUBSCRIBED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/newsletter/subscribers/${item.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteSubscriber(item.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 flex-wrap gap-2">
        <div>
          Showing {filtered.length} of {subscribers.length} subscribers
        </div>
        <div>Last updated: {new Date().toLocaleString()}</div>
      </div>
    </div>
  );
}
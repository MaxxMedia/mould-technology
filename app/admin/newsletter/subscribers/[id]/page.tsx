"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditSubscriberPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "ADMIN",
    frequency: "MONTHLY",
    receiveEmail: true,
    receiveWhatsapp: false,
    receiveSMS: false,
    status: "ACTIVE",
  });

  useEffect(() => {
    loadSubscriber();
  }, [id]);

  async function loadSubscriber() {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        throw new Error(data.error || "Subscriber not found");
      }

      const data = await res.json();

      setForm({
        name: data.fullName || data.name || "",
        email: data.email || "",
        phone: data.phoneNumber || data.phone || "",
        source: data.source || "ADMIN",
        frequency: data.frequency || "MONTHLY",
        receiveEmail: data.emailSubscribed ?? data.receiveEmail ?? true,
        receiveWhatsapp: data.whatsappSubscribed ?? data.receiveWhatsapp ?? false,
        receiveSMS: data.smsSubscribed ?? data.receiveSMS ?? false,
        status: data.status || "ACTIVE",
      });
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
      router.push("/admin/newsletter/subscribers");
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function updateSubscriber(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      // Map frontend field names to backend field names
      const payload = {
        fullName: form.name,
        email: form.email,
        phoneNumber: form.phone,
        source: form.source,
        frequency: form.frequency,
        emailSubscribed: form.receiveEmail,
        whatsappSubscribed: form.receiveWhatsapp,
        smsSubscribed: form.receiveSMS,
        status: form.status,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribers/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      alert("Subscriber updated successfully");
      router.push("/admin/newsletter/subscribers");
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteSubscriber() {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

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
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      alert("Subscriber deleted successfully");
      router.push("/admin/newsletter/subscribers");
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Edit Subscriber</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={updateSubscriber} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            className="border w-full h-11 px-4 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            className="border w-full h-11 px-4 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={updateField}
            className="border w-full h-11 px-4 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Source</label>
          <select
            name="source"
            value={form.source}
            onChange={updateField}
            className="border w-full h-11 px-4 rounded-lg"
          >
            <option value="NEWSLETTER_FORM">Newsletter Form</option>
            <option value="COMPANY_PROFILE">Company Profile</option>
            <option value="ADMIN">Admin</option>
            <option value="IMPORT">Import</option>
            <option value="EVENT">Event</option>
            <option value="MAGAZINE">Magazine</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Frequency</label>
          <select
            name="frequency"
            value={form.frequency}
            onChange={updateField}
            className="border w-full h-11 px-4 rounded-lg"
          >
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        <div>
          <label className="font-medium block mb-3">Delivery Channels</label>
          <label className="flex gap-3 mb-3">
            <input
              type="checkbox"
              name="receiveEmail"
              checked={form.receiveEmail}
              onChange={updateField}
            />
            Email
          </label>
          <label className="flex gap-3 mb-3">
            <input
              type="checkbox"
              name="receiveWhatsapp"
              checked={form.receiveWhatsapp}
              onChange={updateField}
            />
            WhatsApp
          </label>
          <label className="flex gap-3">
            <input
              type="checkbox"
              name="receiveSMS"
              checked={form.receiveSMS}
              onChange={updateField}
            />
            SMS
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={updateField}
            className="border w-full h-11 px-4 rounded-lg"
          >
            <option value="ACTIVE">Active</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Subscriber"}
          </button>

          <button
            type="button"
            onClick={deleteSubscriber}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="border px-6 py-3 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
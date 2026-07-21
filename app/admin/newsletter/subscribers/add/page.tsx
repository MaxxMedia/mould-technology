"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSubscriberPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "MANUAL",
    frequency: "MONTHLY",
    receiveEmail: true,
    receiveWhatsapp: false,
    receiveSMS: false,
    status: "ACTIVE",
  });

  function updateField(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      // Map frontend fields to backend fields
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create subscriber");
      }

      alert("Subscriber created successfully");
      router.push("/admin/newsletter/subscribers");
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Add Subscriber</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            required
            className="border rounded-lg w-full h-11 px-4"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            required
            className="border rounded-lg w-full h-11 px-4"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={updateField}
            className="border rounded-lg w-full h-11 px-4"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Source</label>
          <select
            name="source"
            value={form.source}
            onChange={updateField}
            className="border rounded-lg w-full h-11 px-4"
          >
            <option value="MANUAL">Manual</option>
            <option value="FORM">Newsletter Form</option>
            <option value="COMPANY">Company Profile</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Frequency</label>
          <select
            name="frequency"
            value={form.frequency}
            onChange={updateField}
            className="border rounded-lg w-full h-11 px-4"
          >
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        <div>
          <label className="block mb-3 font-medium">Delivery Channels</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="receiveEmail"
                checked={form.receiveEmail}
                onChange={updateField}
              />
              Email
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="receiveWhatsapp"
                checked={form.receiveWhatsapp}
                onChange={updateField}
              />
              WhatsApp
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="receiveSMS"
                checked={form.receiveSMS}
                onChange={updateField}
              />
              SMS
            </label>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={updateField}
            className="border rounded-lg w-full h-11 px-4"
          >
            <option value="ACTIVE">Active</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Create Subscriber"}
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
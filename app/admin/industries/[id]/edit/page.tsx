"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Factory } from "lucide-react";
import IndustryForm from "@/components/admin/IndustryForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Industry = {
  id: number;
  name: string;
  parentId: number | null;
};

export default function EditIndustryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/admin/industries/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load industry");
        setIndustry(data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(values: { name: string; parentId: number | null }) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/admin/industries/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Failed to update industry");
    }

    router.push("/admin/industries");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !industry) {
    return <p className="text-red-600">{error || "Industry not found"}</p>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-1">
        <Factory className="text-indigo-600" size={24} />
        Edit Industry
      </h1>
      <p className="text-sm text-gray-500 mb-6">Update the name or parent of this industry.</p>
      <IndustryForm
        excludeId={industry.id}
        initialValues={{ name: industry.name, parentId: industry.parentId }}
        submitLabel="Update Industry"
        onSubmit={handleSubmit}
      />
    </div>
  );
}

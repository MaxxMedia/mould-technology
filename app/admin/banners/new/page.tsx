"use client";

import BannerForm from "../BannerForm";

export default function NewBannerPage() {
  const createBanner = async (data: any) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/banners`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create banner");
    }
    alert("Banner created successfully");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Banner</h1>
      <BannerForm onSubmit={createBanner} />
    </div>
  );
}

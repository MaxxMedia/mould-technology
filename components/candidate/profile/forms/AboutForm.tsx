"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface AboutFormProps {
  initialValue: string;
  onSubmit: (about: string) => Promise<void>;
  loading?: boolean;
}

export default function AboutForm({
  initialValue,
  onSubmit,
  loading = false,
}: AboutFormProps) {
  const [about, setAbout] = useState(initialValue || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(about);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
          Summary / About You
        </label>
        <textarea
          rows={6}
          maxLength={2000}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="You can write about your years of experience, industry, or skills. People also talk about their achievements or previous job experiences."
          className="w-full border border-gray-300 rounded-lg p-3.5 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent leading-relaxed transition-all"
        />
        <div className="flex justify-end text-xs text-[#5A5F69] mt-1 font-medium">
          {about.length} / 2000
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#0F5B78] hover:bg-[#0b445a] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Save
        </button>
      </div>
    </form>
  );
}

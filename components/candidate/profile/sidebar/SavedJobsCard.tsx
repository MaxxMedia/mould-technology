"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

export default function SavedJobsCard() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/saved/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setSavedJobs(data.slice(0, 5));
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadSaved();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-md overflow-hidden">
      <div className="bg-[#0F5B78] px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
          <Bookmark size={18} />
          Saved Jobs
        </h3>
        <span className="text-[11px] font-semibold text-white bg-white/20 px-2.5 py-0.5 rounded-full">
          {savedJobs.length} Listed
        </span>
      </div>

      {loading ? (
        <div className="p-4 text-center text-xs text-[#5A5F69]">Loading saved jobs...</div>
      ) : savedJobs.length === 0 ? (
        <div className="p-5 text-center text-xs text-[#5A5F69]">
          <p className="font-semibold text-[#000000]">No saved jobs yet</p>
          <p className="mt-1">Bookmark jobs to view them here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {savedJobs.slice(0, 5).map((item) => {
            const job = item.Job || item;
            return (
              <div
                key={item.id || job.id}
                className="p-3.5 block hover:bg-blue-50/40 transition-colors group"
              >
                <h4 className="text-xs sm:text-sm font-bold text-[#000000] group-hover:text-[#0F5B78] transition-colors truncate">
                  {job.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-[#5A5F69] mt-1">
                  <span className="font-medium text-[#0F5B78]">{job.Company?.name || job.companyName || ""}</span>
                  <span>{job.location || ""}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

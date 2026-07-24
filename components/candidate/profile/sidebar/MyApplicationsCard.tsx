"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";

export default function MyApplicationsCard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setApplications(data.slice(0, 5));
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-md overflow-hidden">
      <div className="bg-[#0F5B78] px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
          <FileText size={18} />
          My Applications
        </h3>
        <span className="text-[11px] font-semibold text-white bg-white/20 px-2.5 py-0.5 rounded-full">
          {applications.length} Listed
        </span>
      </div>

      {loading ? (
        <div className="p-4 text-center text-xs text-[#5A5F69]">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="p-5 text-center text-xs text-[#5A5F69]">
          <p className="font-semibold text-[#000000]">No applications submitted</p>
          <p className="mt-1">Applied roles will appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {applications.slice(0, 5).map((app) => {
            const job = app.Job || {};
            return (
              <div
                key={app.id}
                className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[#000000] truncate">{job.title || "Applied Role"}</h4>
                  <p className="text-xs text-[#5A5F69] mt-0.5 truncate">{job.Company?.name || ""}</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-[#0F5B78] border border-[#0F5B78]/30 shrink-0">
                  {app.status || "APPLIED"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

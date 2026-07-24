"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";

export default function HomeFeedCard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        let fetchedJobs: any[] = [];
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?page=1&limit=20`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          fetchedJobs = data.jobs || (Array.isArray(data) ? data : []);
        }
        if (fetchedJobs.length === 0) {
          const fallbackRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/approved`, { cache: "no-store" });
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            fetchedJobs = Array.isArray(data) ? data : data.jobs || [];
          }
        }
        setJobs(fetchedJobs.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch jobs for Recommended Jobs card", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-md overflow-hidden">
      <div className="bg-[#0F5B78] px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
          <Briefcase size={18} />
          Recommended Jobs
        </h3>
        <span className="text-[11px] font-semibold text-white bg-white/20 px-2.5 py-0.5 rounded-full">
          {jobs.length > 0 ? `${jobs.length} Listed` : "Jobs"}
        </span>
      </div>

      {loading ? (
        <div className="p-4 text-center text-xs text-[#5A5F69]">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="p-5 text-center text-xs text-[#5A5F69]">No recommended jobs available.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {jobs.slice(0, 5).map((job) => (
            <Link
              key={job.id}
              href="/feed"
              className="p-3.5 block hover:bg-blue-50/30 transition-colors cursor-pointer group"
            >
              <h4 className="text-xs sm:text-sm font-bold text-[#000000] group-hover:text-[#0F5B78] transition-colors truncate">
                {job.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-[#5A5F69] mt-1">
                <span className="font-medium text-[#0F5B78]">{job.Company?.name || job.companyName || ""}</span>
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-[#5A5F69]" />
                    {job.location}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 bg-white p-2">
        <Link
          href="/feed"
          className="w-full text-center font-bold text-xs text-[#0F5B78] hover:underline py-2 block hover:bg-blue-50/40 rounded transition-colors cursor-pointer"
        >
          View all jobs in feed →
        </Link>
      </div>
    </div>
  );
}

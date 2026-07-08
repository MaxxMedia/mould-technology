"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Bookmark } from "lucide-react";

type SavedJob = {
  id: number;
  createdAt: string;
  Job: {
    id: number;
    title: string;
    slug: string;
    location: string;
    employmentType: string;
    Company?: {
      name: string;
      slug: string;
    };
    companyName?: string;
  };
};

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedJobs() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/saved/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        console.log("Saved Jobs:", data);

        if (Array.isArray(data)) {
          setSavedJobs(data);
        }
      } catch (err) {
        console.error("Failed to load saved jobs", err);
      } finally {
        setLoading(false);
      }
    }

    loadSavedJobs();
  }, []);

  async function handleUnsave(jobId: number) {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}/save`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSavedJobs((prev) => prev.filter((job) => job.Job.id !== jobId));
    } catch (err) {
      console.error("Failed to unsave job", err);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        Loading saved jobs...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Saved Jobs</h2>

      {savedJobs.length === 0 ? (
        <p className="text-gray-500">No saved jobs yet.</p>
      ) : (
        <div className="space-y-5">
          {savedJobs.map((saved) => (
            <div
              key={saved.id}
              className="rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition"
            >
              <Link
                href={`/company/${saved.Job.Company?.slug ?? ""}`}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                {saved.Job.Company?.name ||
                  saved.Job.companyName ||
                  "Company"}
              </Link>

              <Link
                href={`/jobs/${saved.Job.slug}`}
                className="block text-lg font-semibold mt-2 hover:text-blue-600"
              >
                {saved.Job.title}
              </Link>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {saved.Job.location}
                </span>

                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Saved on{" "}
                  {new Date(saved.createdAt).toLocaleDateString()}
                </span>

                <span>{saved.Job.employmentType}</span>
              </div>

              <button
                onClick={() => handleUnsave(saved.Job.id)}
                className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <Bookmark size={16} className="fill-blue-600" />
                Remove from saved
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
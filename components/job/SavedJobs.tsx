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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedJobs() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in as a candidate to view saved jobs.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/saved/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load saved jobs.");
          setSavedJobs([]);
          return;
        }

        if (Array.isArray(data)) {
          setSavedJobs(data);
        } else {
          // Backend returned something unexpected — surface it instead
          // of silently showing "No saved jobs yet."
          console.error("Unexpected saved jobs response shape:", data);
          setError("Unexpected response from server.");
        }
      } catch (err) {
        console.error("Failed to load saved jobs", err);
        setError("Something went wrong while loading saved jobs.");
      } finally {
        setLoading(false);
      }
    }

    loadSavedJobs();
  }, []);

  async function handleUnsave(jobId: number) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}/save`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to remove saved job.");
        return;
      }

      setSavedJobs((prev) => prev.filter((job) => job.Job.id !== jobId));
    } catch (err) {
      console.error("Failed to unsave job", err);
      alert("Something went wrong. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        Loading saved jobs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-red-600 text-sm">{error}</p>
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
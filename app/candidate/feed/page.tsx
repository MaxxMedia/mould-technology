"use client";

import { useEffect, useState } from "react";
import CandidateLinkedInProfile from "@/components/candidate/CandidateLinkedInProfile";
import { fetchMyCandidateProfile } from "@/lib/candidateProfile";

export default function CandidateFeedPage() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.username) {
          setUsername(u.username);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchMyCandidateProfile()
      .then((me) => setUsername(me.username || "gopinath2322002"))
      .catch(() => setUsername("gopinath2322002"));
  }, []);

  if (!username) {
    return (
      <div className="bg-[#f3f2ef] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0a66c2] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium text-sm">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  return <CandidateLinkedInProfile username={username} />;
}
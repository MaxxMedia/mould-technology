"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchMyCandidateProfile } from "@/lib/candidateProfile";

export default function EditCandidateProfilePage() {
  const router = useRouter();

  useEffect(() => {
    fetchMyCandidateProfile()
      .then((profile) => {
        if (profile?.username) {
          router.replace(`/candidate/${profile.username}`);
        } else {
          router.replace("/candidate/feed");
        }
      })
      .catch(() => {
        router.replace("/candidate/feed");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#0a66c2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-600">Redirecting to profile...</p>
      </div>
    </div>
  );
}

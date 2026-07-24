"use client";

import Image from "next/image";
import ConnectionButton from "./ConnectionButton";

interface SuggestionCardProps {
  user: {
    id: number;
    fullName: string;
    profileImage?: string | null;
    headline?: string | null;
    location?: string | null;
    mutualCount?: number;
  };
}

export default function SuggestionCard({
  user,
}: SuggestionCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col items-center text-center">

        <Image
          src={user.profileImage || "/images/avatar.png"}
          alt={user.fullName}
          width={80}
          height={80}
          className="h-20 w-20 rounded-full object-cover"
        />

        <h3 className="mt-4 text-lg font-semibold">
          {user.fullName}
        </h3>

        <p className="mt-1 text-sm text-gray-600">
          {user.headline || "No headline"}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {user.location}
        </p>

        {user.mutualCount !== undefined && (
          <p className="mt-3 text-xs text-gray-500">
            {user.mutualCount} Mutual Connections
          </p>
        )}

        <div className="mt-5 w-full">
          <ConnectionButton userId={user.id} />
        </div>
      </div>
    </div>
  );
}
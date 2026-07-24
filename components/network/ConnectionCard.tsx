"use client";

import Image from "next/image";
import { removeConnection } from "@/services/connection.service";

interface ConnectionCardProps {
  user: {
    id: number;
    fullName: string;
    profileImage?: string | null;
    headline?: string | null;
    location?: string | null;
  };
  onRemove?: () => void;
}

export default function ConnectionCard({
  user,
  onRemove,
}: ConnectionCardProps) {
  const handleRemove = async () => {
    const confirmed = window.confirm(
      `Remove ${user.fullName} from your connections?`
    );

    if (!confirmed) return;

    try {
      await removeConnection(user.id);
      onRemove?.();
    } catch (error) {
      console.error(error);
      alert("Failed to remove connection.");
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <Image
          src={user.profileImage || "/images/avatar.png"}
          alt={user.fullName}
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-cover"
        />

        <div>
          <h3 className="text-lg font-semibold">
            {user.fullName}
          </h3>

          {user.headline && (
            <p className="text-sm text-gray-600">
              {user.headline}
            </p>
          )}

          {user.location && (
            <p className="text-sm text-gray-500">
              📍 {user.location}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Message
        </button>

        <button
          onClick={handleRemove}
          className="rounded-lg border border-red-500 px-4 py-2 text-red-500 hover:bg-red-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
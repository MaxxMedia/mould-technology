"use client";

import Image from "next/image";
import { acceptRequest, rejectRequest } from "@/services/connection.service";

interface RequestCardProps {
  request: {
    id: number;
    sender: {
      id: number;
      fullName: string;
      profileImage?: string | null;
      headline?: string | null;
      location?: string | null;
    };
    message?: string | null;
    createdAt: string;
  };
  onUpdate?: () => void;
}

export default function RequestCard({
  request,
  onUpdate,
}: RequestCardProps) {
  const handleAccept = async () => {
    try {
      await acceptRequest(request.id);
      onUpdate?.();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectRequest(request.id);
      onUpdate?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Image
          src={request.sender.profileImage || "/images/avatar.png"}
          alt={request.sender.fullName}
          width={60}
          height={60}
          className="rounded-full object-cover"
        />

        <div>
          <h3 className="font-semibold">
            {request.sender.fullName}
          </h3>

          <p className="text-sm text-gray-600">
            {request.sender.headline}
          </p>

          <p className="text-xs text-gray-500">
            {request.sender.location}
          </p>

          {request.message && (
            <p className="mt-2 text-sm italic text-gray-700">
              "{request.message}"
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Accept
        </button>

        <button
          onClick={handleReject}
          className="rounded-lg border border-red-500 px-4 py-2 text-red-500 hover:bg-red-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
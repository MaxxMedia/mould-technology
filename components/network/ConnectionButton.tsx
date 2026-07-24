"use client";

import { useEffect, useState } from "react";
import {
  acceptRequest,
  getStatus,
  sendRequest,
} from "@/services/connection.service";
import { ConnectionStatusResponse } from "@/types/connection";

interface ConnectionButtonProps {
  userId: number;
}

export default function ConnectionButton({
  userId,
}: ConnectionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] =
    useState<ConnectionStatusResponse | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await getStatus(userId);
      setStatus(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [userId]);

  const handleConnect = async () => {
    try {
      setLoading(true);

      await sendRequest(userId);

      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!status?.requestId) return;

    try {
      setLoading(true);

      await acceptRequest(status.requestId);

      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  if (!status) {
    return (
      <button
        disabled
        className="rounded-lg bg-gray-200 px-4 py-2"
      >
        Loading...
      </button>
    );
  }

  switch (status.status) {
    case "CONNECTED":
      return (
        <button
          disabled
          className="rounded-lg bg-green-600 px-4 py-2 text-white"
        >
          Connected
        </button>
      );

    case "PENDING_SENT":
      return (
        <button
          disabled
          className="rounded-lg bg-yellow-500 px-4 py-2 text-white"
        >
          Pending
        </button>
      );

    case "PENDING_RECEIVED":
      return (
        <button
          onClick={handleAccept}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Accept
        </button>
      );

    case "SELF":
      return null;

    default:
      return (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="rounded-lg bg-[#0A66C2] px-4 py-2 text-white hover:bg-[#004182]"
        >
          {loading ? "Sending..." : "Connect"}
        </button>
      );
  }
}
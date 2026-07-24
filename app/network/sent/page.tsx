"use client";

import { useEffect, useState } from "react";
import {
  cancelRequest,
  getSentRequests,
} from "@/services/connection.service";

export default function SentRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await getSentRequests();

      setRequests(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (id: number) => {
    await cancelRequest(id);
    fetchRequests();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Sent Requests
      </h1>

      {requests.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          No pending requests.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request: any) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-xl border bg-white p-5"
            >
              <div>
                <h2 className="font-semibold">
                  {request.receiver.fullName}
                </h2>

                <p className="text-sm text-gray-500">
                  {request.receiver.headline}
                </p>
              </div>

              <button
                onClick={() => handleCancel(request.id)}
                className="rounded-lg border border-red-500 px-4 py-2 text-red-500"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
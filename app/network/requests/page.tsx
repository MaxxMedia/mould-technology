"use client";

import { useEffect, useState } from "react";
import { getReceivedRequests } from "@/services/connection.service";
import RequestCard from "@/components/network/RequestCard";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await getReceivedRequests();

      setRequests(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        Loading requests...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Connection Requests
      </h1>

      {requests.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="text-xl font-semibold">
            No Pending Requests
          </h2>

          <p className="mt-2 text-gray-500">
            You're all caught up.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request: any) => (
            <RequestCard
              key={request.id}
              request={request}
              onUpdate={fetchRequests}
            />
          ))}
        </div>
      )}
    </div>
  );
}
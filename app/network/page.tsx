"use client";

import { useEffect, useState } from "react";
import { getConnections } from "@/services/connection.service";
import ConnectionCard from "@/components/network/ConnectionCard";

export default function NetworkPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      setLoading(true);

      const res = await getConnections();

      setConnections(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        Loading connections...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          My Network
        </h1>

        <p className="mt-2 text-gray-600">
          {connections.length} Connections
        </p>
      </div>

      {connections.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="text-xl font-semibold">
            No Connections Yet
          </h2>

          <p className="mt-2 text-gray-500">
            Start connecting with professionals.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((connection: any) => (
            <ConnectionCard
              key={connection.id}
              user={connection}
              onRemove={fetchConnections}
            />
          ))}
        </div>
      )}
    </div>
  );
}
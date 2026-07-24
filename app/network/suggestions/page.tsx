"use client";

import { useEffect, useState } from "react";
import { getSuggestions } from "@/services/connection.service";
import SuggestionCard from "@/components/network/SuggestionCard";

interface User {
  id: number;
  fullName: string;
  profileImage?: string | null;
  headline?: string | null;
  location?: string | null;
  mutualCount?: number;
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);

      const res = await getSuggestions();

      setSuggestions(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        Loading suggestions...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        People You May Know
      </h1>

      {suggestions.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="text-xl font-semibold">
            No Suggestions Available
          </h2>

          <p className="mt-2 text-gray-500">
            Check back later for new people to connect with.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {suggestions.map((user) => (
            <SuggestionCard
              key={user.id}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
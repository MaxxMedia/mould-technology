"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function TrendingArticlesCard() {
  const [articles, setArticles] = useState<{ id: number; title: string; slug: string; views?: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrending() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/articles/approved`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const sorted = [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
        setArticles(sorted);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadTrending();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-md overflow-hidden">
      <div className="bg-[#0F5B78] px-5 py-3.5">
        <h3 className="text-white font-bold text-base sm:text-lg tracking-wide">
          Trending Articles
        </h3>
      </div>

      {loading ? (
        <div className="p-4 text-center text-xs text-[#5A5F69]">Loading trending articles...</div>
      ) : articles.length === 0 ? (
        <div className="p-5 text-center text-xs text-[#5A5F69]">No trending articles at the moment.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {articles.slice(0, 5).map((article, index) => (
            <Link
              key={article.id}
              href={`/post/${article.slug}`}
              className="px-5 py-3.5 flex items-start gap-3.5 hover:bg-gray-50/80 transition-colors group block"
            >
              <div className="w-7 h-7 rounded-md bg-[#0F5B78] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#000000] group-hover:text-[#0F5B78] transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-xs text-[#5A5F69] mt-0.5 font-medium">
                  {(article.views ?? 0).toLocaleString()} views
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {articles.length > 0 && (
        <div className="border-t border-gray-100 bg-white">
          <Link
            href="/articles"
            className="text-center font-bold text-sm text-[#0F5B78] hover:underline py-3.5 block hover:bg-blue-50/40 transition-colors"
          >
            View all articles →
          </Link>
        </div>
      )}
    </div>
  );
}

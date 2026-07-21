"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import CreateArticleButton from "@/components/recruiter/CreateArticleButton";
import {
  fetchArticlePostingEligibility,
  type ContentLimitEligibility,
} from "@/lib/packageLimits";

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  badge?: string;
  status?: string;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20",
};

export default function RecruiterArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [eligibility, setEligibility] = useState<ContentLimitEligibility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
    loadEligibility();
  }, []);

  async function loadEligibility() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const data = await fetchArticlePostingEligibility(token);
      setEligibility(data);
    } catch (error) {
      console.error("Article eligibility error:", error);
    }
  }

  async function fetchArticles() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recruiter/articles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch articles");

      const data = await res.json();

      const articlesArray: Article[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setArticles(articlesArray);
    } catch (error) {
      console.error("Fetch articles error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = confirm("Are you sure you want to delete this article?");
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recruiter/articles/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setArticles((prev) => prev.filter((article) => article.id !== id));
    } catch (error) {
      alert("Failed to delete article");
    }
  }

  const canCreateArticles = eligibility?.canCreate !== false && eligibility?.plan !== "free";

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-56 bg-slate-200 rounded" />
          <div className="grid md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl border border-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-10">
      <div className="flex items-start justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">My Articles</h1>

          {eligibility && (
            <p className="text-sm text-slate-500 mt-1.5">
              {eligibility.isUnlimited ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Unlimited technical articles on your plan
                </span>
              ) : eligibility.canCreate ? (
                `${eligibility.remaining ?? 0} article${eligibility.remaining === 1 ? "" : "s"} remaining this year`
              ) : (
                eligibility.message || "Upgrade your plan to publish articles"
              )}
            </p>
          )}

          {!eligibility && (
            <p className="text-sm text-slate-300 mt-1.5">Loading plan information…</p>
          )}
        </div>

        <CreateArticleButton eligibility={eligibility} />
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No articles yet</p>
          {canCreateArticles && (
            <p className="text-sm text-slate-400 mt-1.5">
              Publish your first technical article to get started.
            </p>
          )}
          {!canCreateArticles && eligibility?.plan === "free" && (
            <p className="text-sm text-amber-600 mt-2">
              Technical articles are available on Basic plan and above.{" "}
              <Link href="/pricing" className="text-blue-600 hover:underline">
                Upgrade your plan
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article) => {
            const statusStyle = article.status
              ? STATUS_STYLES[article.status] ?? "bg-slate-50 text-slate-600 ring-1 ring-slate-600/10"
              : null;

            return (
              <div
                key={article.id}
                className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-200"
              >
                {/* IMAGE — full image visible, no cropping */}
                <div className="relative w-full aspect-[16/10] bg-slate-50">
                  {article.imageUrl ? (
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-contain p-3"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18-3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
                      </svg>
                    </div>
                  )}

                  {statusStyle && (
                    <span
                      className={`absolute top-3 right-3 text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur ${statusStyle}`}
                    >
                      {article.status}
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-2.5">
                  {article.badge && (
                    <span className="inline-block text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      {article.badge}
                    </span>
                  )}

                  <h2 className="font-semibold text-lg text-slate-900 leading-snug line-clamp-2">
                    {article.title}
                  </h2>

                  {article.excerpt && (
                    <p className="text-sm text-slate-500 line-clamp-2">{article.excerpt}</p>
                  )}

                  <p className="text-xs text-slate-400 pt-1">
                    {new Date(article.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  <div className="flex items-center gap-5 pt-3 mt-1 border-t border-slate-100">
                    <Link
                      href={`/recruiter/articles/${article.id}/edit`}
                      className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors"
                    >
                      Delete
                    </button>

                    {article.status === "APPROVED" && (
                      <Link
                        href={`/post/${article.slug}`}
                        target="_blank"
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors ml-auto"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye, User } from "lucide-react";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  badge?: string;
  publishedAt: string;
  views: number;
  author: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface BlogCategory {
  slug: string;
  name: string;
}

type BlogListingProps = {
  initialPosts: BlogPost[];
  initialCategories: BlogCategory[];
};

export default function BlogListing({
  initialPosts,
  initialCategories,
}: BlogListingProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [categories] = useState<BlogCategory[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (selectedCategory === "all") {
      setPosts(initialPosts);
      return;
    }

    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts?category=${selectedCategory}&limit=100`
        );
        if (res.ok) {
          const data = await res.json();
          const postsData = data.data || data || [];
          const sortedPosts = postsData.sort(
            (a: BlogPost, b: BlogPost) =>
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
          setPosts(sortedPosts);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [selectedCategory, initialPosts]);

  const getImageUrl = (post: BlogPost) => {
    if (!post.imageUrl) return "/placeholder.svg";
    return post.imageUrl.startsWith("http")
      ? post.imageUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getBadgeColor = (badge?: string) => {
    if (!badge) return "bg-gray-500";
    const colors: Record<string, string> = {
      Featured: "bg-yellow-500",
      Popular: "bg-red-500",
      New: "bg-green-500",
      Trending: "bg-orange-500",
      Exclusive: "bg-purple-500",
      Sponsored: "bg-blue-500",
    };
    return colors[badge] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#003049] to-[#005a8c] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Manufacturing & Tooling Blog
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            News, analysis, and practical insights on CNC machining, dies and moulds,
            factory automation, metrology, and Industry 4.0 for tooling professionals.
          </p>
          <nav aria-label="Breadcrumb" className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
            <Link href="/" className="px-3 py-1 bg-white/20 rounded-full hover:bg-white/30">
              Home
            </Link>
            <span className="px-3 py-1 bg-white/20 rounded-full">→</span>
            <span className="px-3 py-1 bg-white/20 rounded-full">Blog</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-[#003049] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-[#003049] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading articles…</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={getImageUrl(post)}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {post.badge && (
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${getBadgeColor(
                          post.badge
                        )}`}
                      >
                        {post.badge}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#003049] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt ||
                      post.content?.substring(0, 150) + "..." ||
                      "No description available."}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {post.author?.name || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {post.views || 0} Views
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

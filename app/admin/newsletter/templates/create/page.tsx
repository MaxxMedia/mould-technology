"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Post {
  id: number;
  title: string;
  slug: string;
  imageUrl: string;
  category: { name: string; slug: string } | string;
  author: { name: string } | null;
  views: number;
  publishedAt: string;
  badge?: string;
  excerpt?: string;
}

export default function CreateTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    content: "",
  });

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setFetchingPosts(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const postsData = data.data || data;
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setFetchingPosts(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function togglePostSelection(postId: number) {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  }

  function selectAllPosts() {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(p => p.id));
    }
  }

  function getBadgeColor(badge: string): string {
    const colors: Record<string, string> = {
      FEATURED: "#E11D48",
      WEBINAR: "#7C3AED",
      EVENT: "#0EA5E9",
      TRENDING: "#F97316",
      EXCLUSIVE: "#059669",
    };
    return colors[badge.toUpperCase()] || "#0073FF";
  }

  function getCategoryName(post: Post): string {
    if (typeof post.category === "object" && post.category) {
      return post.category.name || "";
    }
    return String(post.category || "");
  }

  function generatePreviewHTML(): string {
    const selected = posts.filter(p => selectedPosts.includes(p.id));
    
    if (selected.length === 0) {
      return `<div style="padding: 40px; text-align: center; color: #999;">
        <p>Select posts to preview the newsletter</p>
      </div>`;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${form.subject || "Newsletter"}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #0073FF; }
          .header h1 { color: #0073FF; font-size: 24px; margin: 0; }
          .header p { color: #666; margin: 5px 0 0; }
          .post { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          .post-image { width: 100%; height: 200px; object-fit: cover; border-radius: 4px; }
          .post-title { font-size: 20px; color: #121213; margin: 10px 0; }
          .post-title a { color: #121213; text-decoration: none; }
          .post-title a:hover { color: #0073FF; }
          .post-meta { color: #666; font-size: 14px; margin: 10px 0; }
          .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; color: white; font-size: 12px; background: #0073FF; margin-right: 4px; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #ddd; margin-top: 20px; font-size: 12px; color: #666; }
          .read-more { display: inline-block; background: #0073FF; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; margin-top: 10px; }
          @media only screen and (max-width: 600px) {
            .container { padding: 10px; }
            .post { padding: 10px; }
            .post-image { height: 150px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📰 Tooling Trends Newsletter</h1>
            <p>${form.subject || "Latest Industry Updates"}</p>
          </div>
    `;

    selected.forEach((post, index) => {
      const imageUrl = post.imageUrl?.startsWith("http")
        ? post.imageUrl
        : post.imageUrl
        ? `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`
        : "";

      const categoryName = getCategoryName(post);
      const authorName = post.author?.name || "rstheme";
      const date = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "";

      const bgColor = index % 2 === 0 ? "#ffffff" : "#f9f9f9";
      
      html += `
        <div class="post" style="background: ${bgColor};">
          ${post.badge ? `<span class="badge" style="background: ${getBadgeColor(post.badge)}">${post.badge}</span>` : ''}
          ${categoryName ? `<span class="badge" style="background: #6B7280;">${categoryName}</span>` : ''}
          
          ${imageUrl ? `<img src="${imageUrl}" alt="${post.title}" class="post-image" />` : ''}
          
          <h2 class="post-title">
            <a href="${appUrl}/post/${post.slug}">
              ${post.title}
            </a>
          </h2>
          
          <p style="color: #555; margin: 10px 0; line-height: 1.6;">
            ${post.excerpt || 'Read more about the latest trends in precision manufacturing and tooling industry.'}
          </p>
          
          <div class="post-meta">
            By ${authorName} • ${post.views?.toLocaleString() || 0} Views • ${date}
          </div>
          
          <a href="${appUrl}/post/${post.slug}" class="read-more">
            Read Full Story →
          </a>
        </div>
      `;
    });

    html += `
          <div class="footer">
            <p>© ${new Date().getFullYear()} Tooling Trends. All rights reserved.</p>
            <p style="margin-top: 5px;">
              <a href="${appUrl}/unsubscribe" style="color: #0073FF;">Unsubscribe</a>
              &nbsp;|&nbsp;
              <a href="${appUrl}" style="color: #0073FF;">Visit Website</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  async function createTemplate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedPosts.length === 0) {
      setError("Please select at least one post for the newsletter");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      // Generate the HTML content
      const htmlContent = generatePreviewHTML();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/templates`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            content: htmlContent,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to create template");
      }

      alert("✅ Template created successfully!");
      router.push("/admin/newsletter/templates");
    } catch (err: any) {
      setError(err.message);
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Generate preview HTML when selection changes
  const previewHtml = selectedPosts.length > 0 ? generatePreviewHTML() : null;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Create Dynamic Newsletter Template</h1>
      <p className="text-gray-500 mb-8">
        Select posts from your site to build a dynamic newsletter template
      </p>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
        <strong>📝 How it works:</strong>
        <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
          <li>Select posts from the list below to include in your newsletter</li>
          <li>The template will automatically include these posts with formatting</li>
          <li>When sending, the latest content will be fetched for each post</li>
          <li>Use the preview to see how your newsletter will look</li>
        </ol>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Form */}
        <div>
          <form onSubmit={createTemplate} className="space-y-6">
            <div>
              <label className="block mb-2 font-medium">Template Name *</label>
              <input
                name="name"
                placeholder="e.g., Weekly Industry Newsletter"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Email Subject *</label>
              <input
                name="subject"
                placeholder="e.g., Latest Industry Updates"
                value={form.subject}
                onChange={handleChange}
                className="w-full border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Select Posts to Include *
                <span className="text-sm text-gray-500 ml-2">
                  ({selectedPosts.length} selected)
                </span>
              </label>
              
              {fetchingPosts ? (
                <div className="text-gray-500 py-4">Loading posts...</div>
              ) : posts.length === 0 ? (
                <div className="text-gray-500 py-4">No posts available. Create some posts first.</div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-2 border-b flex justify-between items-center">
                    <span className="text-sm font-medium">Available Posts</span>
                    <button
                      type="button"
                      onClick={selectAllPosts}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {selectedPosts.length === posts.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {posts.map((post) => (
                      <label
                        key={post.id}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 border-b last:border-0 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={() => togglePostSelection(post.id)}
                          className="w-4 h-4 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium line-clamp-1">{post.title}</div>
                          <div className="text-xs text-gray-400 flex gap-3">
                            <span>{getCategoryName(post)}</span>
                            {post.badge && (
                              <span className="text-blue-600">{post.badge}</span>
                            )}
                            {post.views !== undefined && (
                              <span>{post.views} views</span>
                            )}
                          </div>
                        </div>
                        {post.imageUrl && (
                          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={post.imageUrl.startsWith("http") ? post.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Select at least one post to include in your newsletter
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={loading || selectedPosts.length === 0}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating..." : "Create Template"}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              {selectedPosts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT: Preview */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Email Preview</h2>
          {showPreview ? (
            <div className="border rounded-lg bg-gray-50 p-4 min-h-[400px]">
              {previewHtml ? (
                <div
                  className="bg-white rounded shadow-sm overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="text-gray-400 text-center py-12">
                  Select posts above to see preview
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg bg-gray-50 p-8 text-center text-gray-400">
              <p className="text-lg">👁️ Click "Show Preview" to see your newsletter</p>
              <p className="text-sm mt-2">Select posts and click the preview button</p>
            </div>
          )}
          
          {previewHtml && showPreview && (
            <div className="mt-4 flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const win = window.open('', '_blank', 'width=800,height=600');
                  if (win) {
                    win.document.write(previewHtml);
                    win.document.close();
                  }
                }}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                📄 Open Full Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(previewHtml)
                    .then(() => alert("HTML copied to clipboard!"))
                    .catch(() => alert("Failed to copy HTML"));
                }}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                📋 Copy HTML
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
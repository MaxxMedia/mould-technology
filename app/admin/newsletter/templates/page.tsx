"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Template {
  id: number;
  name: string;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdById?: number;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "subject" | "updatedAt" | "createdAt">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/templates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        throw new Error(data.error || "Failed to load templates");
      }

      const data = await res.json();
      // Handle different response formats
      const templatesData = Array.isArray(data) ? data : data.data || data.templates || [];
      setTemplates(templatesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTemplate(id: number) {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/templates/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      alert("✅ Template deleted successfully");
      loadTemplates();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  async function duplicateTemplate(id: number) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/templates/${id}/duplicate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Duplicate failed");
      }

      alert("✅ Template duplicated successfully!");
      loadTemplates();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.subject.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number = a[sortBy];
      let bVal: string | number = b[sortBy];
      
      // Handle string comparison for name and subject
      if (sortBy === "name" || sortBy === "subject") {
        aVal = (aVal as string).toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }
      
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [templates, search, sortBy, sortOrder]);

  function isDynamicTemplate(content: string): boolean {
    return content.includes('{{posts}}') || content.includes('{posts}');
  }

  function getPostCount(content: string): number {
    // Count how many posts are referenced in the template
    const matches = content.match(/<div class="post"/g);
    return matches ? matches.length : 0;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-gray-500 mt-1">
            {templates.length} template{templates.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Link
          href="/admin/newsletter/templates/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span> Create Template
        </Link>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
        <strong>💡 Tip:</strong> Create dynamic templates by selecting posts from your site. 
        The template will automatically fetch the latest content when sent.
        <Link 
          href="/admin/newsletter/templates/new" 
          className="ml-2 text-blue-600 hover:underline font-medium"
        >
          Create a dynamic template →
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ❌ {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates by name or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "subject" | "updatedAt" | "createdAt")}
            className="border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="updatedAt">Sort by Updated</option>
            <option value="createdAt">Sort by Created</option>
            <option value="name">Sort by Name</option>
            <option value="subject">Sort by Subject</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            className="border rounded-lg h-11 px-4 hover:bg-gray-50 transition-colors"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          {search ? (
            <>
              <p className="text-gray-500 mb-2">No templates match your search</p>
              <button
                onClick={() => setSearch("")}
                className="text-blue-600 hover:underline"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-4">No templates found</p>
              <Link
                href="/admin/newsletter/templates/new"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Your First Template
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map((template) => {
            const isDynamic = isDynamicTemplate(template.content);
            const postCount = getPostCount(template.content);
            const plainText = template.content.replace(/<[^>]*>/g, '').substring(0, 150);

            return (
              <div
                key={template.id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      {isDynamic && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <span>🔄</span> Dynamic
                          {postCount > 0 && ` (${postCount} posts)`}
                        </span>
                      )}
                      {!isDynamic && (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          <span>📄</span> Static
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mt-1">
                      <span className="font-medium">Subject:</span> {template.subject}
                    </p>
                    
                    <div className="mt-2 text-sm text-gray-400 line-clamp-2">
                      {plainText}...
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>
                        Updated: {new Date(template.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                      <span>
                        Created: {new Date(template.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <Link
                      href={`/admin/newsletter/templates/${template.id}/edit`}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm transition-colors"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => duplicateTemplate(template.id)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm transition-colors"
                    >
                      📋 Duplicate
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Stats */}
      {filteredTemplates.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 border-t pt-4">
          Showing {filteredTemplates.length} of {templates.length} templates
          {search && ` (filtered by "${search}")`}
        </div>
      )}
    </div>
  );
}
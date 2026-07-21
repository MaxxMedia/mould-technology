"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Template {
  id: number;
  name: string;
  subject: string;
  content: string;
}

export default function EditCampaignPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    previewText: "",
    content: "",
    status: "DRAFT",
    channels: {
      email: true,
      whatsapp: false,
      sms: false,
    },
    audience: "ALL",
    scheduleType: "NOW",
    scheduledAt: "",
  });

  useEffect(() => {
    if (id) {
      loadCampaign();
      fetchTemplates();
    }
  }, [id]);

  async function fetchTemplates() {
    try {
      setLoadingTemplates(true);
      const token = localStorage.getItem("token");

      if (!token) {
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
        throw new Error("Failed to load templates");
      }

      const data = await res.json();
      const templatesData = Array.isArray(data) ? data : data.data || data.templates || [];
      setTemplates(templatesData);
    } catch (err: any) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  }

  async function loadCampaign() {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/campaigns/${id}`,
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
        throw new Error(data.error || "Campaign not found");
      }

      const data = await res.json();
      console.log("📊 Campaign data:", data);

      // Handle both response formats
      const campaign = data.campaign || data;

      setForm({
        title: campaign.title || "",
        subject: campaign.subject || "",
        previewText: campaign.previewText || "",
        content: campaign.content || "",
        status: campaign.status || "DRAFT",
        channels: {
          email: campaign.emailEnabled ?? true,
          whatsapp: campaign.whatsappEnabled ?? false,
          sms: campaign.smsEnabled ?? false,
        },
        audience: campaign.audience || "ALL",
        scheduleType: campaign.scheduledAt ? "LATER" : "NOW",
        scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : "",
      });
    } catch (err: any) {
      setError(err.message);
      alert("❌ " + err.message);
      router.push("/admin/newsletter/campaigns");
    } finally {
      setLoading(false);
    }
  }

  function handleInput(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleChannel(name: string) {
    setForm({
      ...form,
      channels: {
        ...form.channels,
        [name]: !form.channels[name as keyof typeof form.channels],
      },
    });
  }

  function handleTemplateSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const templateId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedTemplate(templateId);

    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setForm(prev => ({
          ...prev,
          subject: template.subject || prev.subject,
          content: template.content || prev.content,
        }));
        alert("✅ Template loaded! Content updated.");
      }
    }
  }

  function isDynamicTemplate(content: string): boolean {
    return content.includes('{{posts}}') || content.includes('{posts}');
  }

  function getPostCount(content: string): number {
    const matches = content.match(/<div class="post"/g);
    return matches ? matches.length : 0;
  }

  async function saveCampaign(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.content.trim()) {
      setError("Campaign content is required");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const payload = {
        title: form.title,
        subject: form.subject,
        previewText: form.previewText,
        content: form.content,
        status: form.status,
        emailEnabled: form.channels.email,
        whatsappEnabled: form.channels.whatsapp,
        smsEnabled: form.channels.sms,
        audience: form.audience,
        scheduledAt: form.scheduleType === "LATER" ? form.scheduledAt : null,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/campaigns/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      alert("✅ Campaign updated successfully");
      router.push("/admin/newsletter/campaigns");
    } catch (err: any) {
      setError(err.message);
      alert("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function sendCampaign() {
    if (!confirm("Send this campaign now?")) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/campaigns/${id}/send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send campaign");
      }

      alert(`✅ Campaign sent successfully! ${data.totalRecipients || 0} recipients`);
      router.push("/admin/newsletter/campaigns");
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  async function deleteCampaign() {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/campaigns/${id}`,
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

      alert("✅ Campaign deleted successfully");
      router.push("/admin/newsletter/campaigns");
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  // Generate preview HTML
  function generatePreviewHTML(): string {
    if (!form.content) {
      return `<div style="padding: 40px; text-align: center; color: #999;">
        <p>Enter content to see preview</p>
      </div>`;
    }

    const isDynamic = isDynamicTemplate(form.content);
    const postCount = getPostCount(form.content);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${form.subject || "Campaign Preview"}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 8px; }
          .preview-badge { background: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; border-radius: 4px; margin-bottom: 20px; }
          .preview-badge strong { color: #0073FF; }
          ${isDynamic ? `
            .dynamic-note { background: #e8f5e9; padding: 10px; border-radius: 4px; margin: 10px 0; font-size: 13px; color: #2e7d32; border-left: 4px solid #4caf50; }
          ` : ''}
          .post { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          .post-image { width: 100%; height: 200px; object-fit: cover; border-radius: 4px; }
          .post-title { font-size: 20px; color: #121213; margin: 10px 0; }
          .post-meta { color: #666; font-size: 14px; }
          .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; color: white; font-size: 12px; background: #0073FF; margin-right: 4px; }
          .read-more { display: inline-block; background: #0073FF; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="preview-badge">
            📧 <strong>Email Preview</strong> — This is how your campaign will look
          </div>
          ${isDynamic ? `
            <div class="dynamic-note">
              🔄 <strong>Dynamic Template:</strong> Content will be fetched from your posts when sent
              ${postCount > 0 ? ` (${postCount} posts will be included)` : ''}
            </div>
          ` : ''}
          ${form.content}
        </div>
      </body>
      </html>
    `;
  }

  const previewHtml = form.content ? generatePreviewHTML() : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading campaign...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Edit Campaign</h1>
          <p className="text-gray-500 mt-1">
            {form.status === "SENT" ? "✅ This campaign has been sent" : "Edit your campaign details below"}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="border px-5 py-2 rounded-lg hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Form */}
        <div>
          <form onSubmit={saveCampaign} className="space-y-6">
            {/* Template Selection */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="font-medium block mb-2">
                📋 Load from Template (Optional)
              </label>
              <select
                value={selectedTemplate || ""}
                onChange={handleTemplateSelect}
                className="w-full border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={loadingTemplates}
              >
                <option value="">-- Select a template --</option>
                {templates.map((template) => {
                  const isDynamic = isDynamicTemplate(template.content);
                  return (
                    <option key={template.id} value={template.id}>
                      {template.name} {isDynamic ? '🔄' : '📄'}
                    </option>
                  );
                })}
              </select>
              {loadingTemplates && (
                <p className="text-sm text-gray-500 mt-1">Loading templates...</p>
              )}
              {templates.length === 0 && !loadingTemplates && (
                <p className="text-sm text-gray-500 mt-1">
                  No templates available. 
                  <Link href="/admin/newsletter/templates/new" className="text-blue-600 hover:underline ml-1">
                    Create one first →
                  </Link>
                </p>
              )}
            </div>

            <div>
              <label className="font-medium block mb-2">Campaign Title *</label>
              <input
                className="w-full border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="title"
                value={form.title}
                onChange={handleInput}
                required
              />
            </div>

            <div>
              <label className="font-medium block mb-2">Email Subject *</label>
              <input
                className="w-full border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="subject"
                value={form.subject}
                onChange={handleInput}
                required
              />
            </div>

            <div>
              <label className="font-medium block mb-2">Preview Text</label>
              <input
                className="w-full border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="previewText"
                value={form.previewText}
                onChange={handleInput}
                placeholder="Brief preview of the email (appears in inbox)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional: This appears next to the subject line in email clients
              </p>
            </div>

            <div>
              <label className="font-medium block mb-2">Newsletter Content *</label>
              <textarea
                rows={10}
                className="w-full border rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="content"
                value={form.content}
                onChange={handleInput}
                required
              />
              <div className="mt-2 text-sm text-gray-500 space-y-1">
                <p>💡 Use HTML tags for formatting.</p>
                {isDynamicTemplate(form.content) && (
                  <p className="text-green-600">🔄 Dynamic template detected — posts will be fetched when sending</p>
                )}
                <p className="text-xs text-gray-400">
                  Example: &lt;h2&gt;Hello&lt;/h2&gt;, &lt;p&gt;text&lt;/p&gt;, use {`{{posts}}`} for dynamic content
                </p>
              </div>
            </div>

            <div>
              <label className="font-medium block mb-3">Delivery Channels</label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.channels.email}
                    onChange={() => handleChannel("email")}
                    className="w-4 h-4"
                  />
                  <span>📧 Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.channels.whatsapp}
                    onChange={() => handleChannel("whatsapp")}
                    className="w-4 h-4"
                  />
                  <span>💬 WhatsApp</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.channels.sms}
                    onChange={() => handleChannel("sms")}
                    className="w-4 h-4"
                  />
                  <span>📱 SMS</span>
                </label>
              </div>
            </div>

            <div>
              <label className="font-medium block mb-2">Audience</label>
              <select
                className="w-full border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="audience"
                value={form.audience}
                onChange={handleInput}
              >
                <option value="ALL">All Subscribers</option>
                <option value="ACTIVE">Active Only</option>
                <option value="EMAIL">Email Subscribers</option>
                <option value="WHATSAPP">WhatsApp Subscribers</option>
                <option value="SMS">SMS Subscribers</option>
              </select>
            </div>

            <div>
              <label className="font-medium block mb-2">Schedule</label>
              <select
                className="w-full border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="scheduleType"
                value={form.scheduleType}
                onChange={handleInput}
              >
                <option value="NOW">🚀 Send Immediately</option>
                <option value="LATER">📅 Schedule</option>
              </select>
            </div>

            {form.scheduleType === "LATER" && (
              <div>
                <label className="font-medium block mb-2">Schedule Date & Time *</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="scheduledAt"
                  value={form.scheduledAt}
                  onChange={handleInput}
                  required
                />
              </div>
            )}

            <div>
              <label className="font-medium block mb-2">Status</label>
              <select
                className="w-full border rounded-lg h-11 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="status"
                value={form.status}
                onChange={handleInput}
                disabled={form.status === "SENT"}
              >
                <option value="DRAFT">📝 Draft</option>
                <option value="SCHEDULED">📅 Scheduled</option>
                <option value="SENT">✅ Sent (read-only)</option>
              </select>
              {form.status === "SENT" && (
                <p className="text-sm text-gray-500 mt-1">
                  ⚠️ Sent campaigns cannot be modified
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t">
              <button
                type="submit"
                disabled={saving || form.status === "SENT"}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "💾 Save"}
              </button>

              <button
                type="button"
                onClick={sendCampaign}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={form.status === "SENT"}
              >
                🚀 Send
              </button>

              <button
                type="button"
                onClick={deleteCampaign}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑️ Delete
              </button>

              {form.content && (
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
          <h2 className="text-xl font-semibold mb-4">📧 Email Preview</h2>
          {showPreview ? (
            <div className="border rounded-lg bg-gray-50 p-4 min-h-[400px]">
              {previewHtml ? (
                <div
                  className="bg-white rounded shadow-sm overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="text-gray-400 text-center py-12">
                  Enter content to see preview
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg bg-gray-50 p-8 text-center text-gray-400">
              <p className="text-lg">👁️ Click "Show Preview" to see your campaign</p>
              <p className="text-sm mt-2">Your campaign content will appear here</p>
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
                    .then(() => alert("✅ HTML copied to clipboard!"))
                    .catch(() => alert("Failed to copy HTML"));
                }}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                📋 Copy HTML
              </button>
              {isDynamicTemplate(form.content) && (
                <span className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded-lg flex items-center gap-1">
                  <span>🔄</span> Dynamic Template
                  {getPostCount(form.content) > 0 && ` (${getPostCount(form.content)} posts)`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
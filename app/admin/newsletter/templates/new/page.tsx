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

  // Cloudinary images for header
  const headerImages = [
    "https://res.cloudinary.com/dlkuk7rok/image/upload/v1784531824/mould-tech/images/crp6nedo6xnax5rfdykr.png",
    "https://res.cloudinary.com/dlkuk7rok/image/upload/v1784530742/mould-tech/images/motudp9c4lzxnhychnvh.webp",
    "https://res.cloudinary.com/dlkuk7rok/image/upload/v1782719608/mould-tech/wrc2ffbls9ukozfxps7t.png"
  ];

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    const currentDate = new Date().toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    // Pick a random header image
    const headerImage = headerImages[Math.floor(Math.random() * headerImages.length)];

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${form.subject || "Tooling Trends Newsletter"}</title>
        <style>
          /* RESET */
          body, h1, h2, h3, p, div, a { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
          body { background: #f4f4f4; }
          
          /* MAIN CONTAINER */
          .main-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          
          /* HEADER */
          .header { 
            background: #0A1628; 
            padding: 20px 30px; 
            text-align: center;
            border-bottom: 3px solid #0073FF;
          }
          .header-logo { 
            font-size: 28px; 
            font-weight: 700; 
            color: #ffffff;
            letter-spacing: 1px;
          }
          .header-logo span { color: #0073FF; }
          .header-sub { 
            color: #8a9bb5; 
            font-size: 12px; 
            letter-spacing: 2px;
            margin-top: 4px;
          }
          .header-line { 
            width: 60px; 
            height: 2px; 
            background: #0073FF; 
            margin: 10px auto 0;
          }
          
          /* HEADER IMAGE BANNER */
          .header-banner {
            width: 100%;
            height: auto;
            display: block;
          }
          .header-banner img {
            width: 100%;
            height: auto;
            display: block;
          }
          
          /* NEWSLETTER LABEL */
          .newsletter-label {
            background: #f0f4f8;
            padding: 12px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e0e6ed;
          }
          .newsletter-label h2 {
            font-size: 16px;
            font-weight: 700;
            color: #0A1628;
          }
          .newsletter-label span {
            font-size: 12px;
            color: #6b7a8f;
          }
          
          /* FEATURE STORY */
          .feature-story {
            padding: 25px 30px 20px;
            border-bottom: 1px solid #e0e6ed;
          }
          .feature-story .tag {
            display: inline-block;
            background: #0073FF;
            color: #fff;
            font-size: 10px;
            font-weight: 700;
            padding: 3px 12px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .feature-story h2 {
            font-size: 24px;
            font-weight: 700;
            color: #0A1628;
            line-height: 1.3;
            margin-bottom: 8px;
          }
          .feature-story p {
            color: #4a5a6f;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 12px;
          }
          .feature-story .read-link {
            color: #0073FF;
            font-weight: 600;
            font-size: 13px;
            text-decoration: none;
          }
          .feature-story .read-link:hover { text-decoration: underline; }
          
          /* SECTION HEADER */
          .section-header {
            padding: 20px 30px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .section-header h3 {
            font-size: 18px;
            font-weight: 700;
            color: #0A1628;
          }
          .section-header a {
            font-size: 12px;
            color: #0073FF;
            text-decoration: none;
            font-weight: 600;
          }
          .section-header a:hover { text-decoration: underline; }
          
          /* POST ITEMS */
          .post-item {
            padding: 15px 30px;
            border-bottom: 1px solid #f0f4f8;
            display: flex;
            gap: 16px;
            align-items: flex-start;
          }
          .post-item .thumb {
            width: 80px;
            height: 80px;
            border-radius: 4px;
            overflow: hidden;
            flex-shrink: 0;
          }
          .post-item .thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .post-item .content {
            flex: 1;
          }
          .post-item .content .badge {
            display: inline-block;
            background: #0073FF;
            color: #fff;
            font-size: 9px;
            font-weight: 700;
            padding: 2px 10px;
            border-radius: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .post-item .content h4 {
            font-size: 15px;
            font-weight: 600;
            color: #0A1628;
            line-height: 1.3;
            margin-bottom: 4px;
          }
          .post-item .content h4 a {
            color: #0A1628;
            text-decoration: none;
          }
          .post-item .content h4 a:hover { color: #0073FF; }
          .post-item .content .meta {
            font-size: 11px;
            color: #8a9bb5;
          }
          .post-item .content .meta span { margin-right: 12px; }
          
          /* INDUSTRY TRENDS */
          .trends-list {
            padding: 5px 30px 20px;
          }
          .trends-list ul {
            list-style: none;
            padding: 0;
          }
          .trends-list li {
            padding: 8px 0;
            border-bottom: 1px solid #f0f4f8;
            font-size: 13px;
            color: #2a3a4f;
          }
          .trends-list li:last-child { border-bottom: none; }
          .trends-list li::before {
            content: "▸";
            color: #0073FF;
            font-weight: 700;
            margin-right: 8px;
          }
          
          /* EXPERT VIEW */
          .expert-view {
            background: #f8faff;
            padding: 20px 30px;
            margin: 10px 30px 20px;
            border-radius: 8px;
            border-left: 4px solid #0073FF;
          }
          .expert-view .quote {
            font-size: 18px;
            font-weight: 600;
            color: #0A1628;
            line-height: 1.5;
          }
          .expert-view .quote::before {
            content: """;
            color: #0073FF;
            font-size: 30px;
            font-weight: 700;
          }
          .expert-view .quote::after {
            content: """;
            color: #0073FF;
            font-size: 30px;
            font-weight: 700;
          }
          .expert-view .author {
            margin-top: 8px;
            font-size: 13px;
            color: #4a5a6f;
          }
          .expert-view .author strong { color: #0A1628; }
          
          /* STATISTICS */
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
            padding: 10px 30px 20px;
          }
          .stat-item {
            background: #f8faff;
            padding: 15px 10px;
            text-align: center;
            border-radius: 6px;
          }
          .stat-item .number {
            font-size: 20px;
            font-weight: 700;
            color: #0073FF;
          }
          .stat-item .label {
            font-size: 10px;
            color: #4a5a6f;
            margin-top: 4px;
          }
          
          /* EVENTS */
          .events-list {
            padding: 5px 30px 20px;
          }
          .events-list .event {
            padding: 12px 0;
            border-bottom: 1px solid #f0f4f8;
          }
          .events-list .event:last-child { border-bottom: none; }
          .events-list .event .name {
            font-weight: 600;
            font-size: 14px;
            color: #0A1628;
          }
          .events-list .event .details {
            font-size: 12px;
            color: #6b7a8f;
            margin-top: 2px;
          }
          
          /* FOOTER */
          .footer {
            background: #0A1628;
            padding: 30px 30px 20px;
            text-align: center;
          }
          .footer .logo {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
          }
          .footer .logo span { color: #0073FF; }
          .footer .social {
            margin: 15px 0;
            display: flex;
            justify-content: center;
            gap: 15px;
          }
          .footer .social a {
            color: #8a9bb5;
            text-decoration: none;
            font-size: 12px;
          }
          .footer .social a:hover { color: #ffffff; }
          .footer .copyright {
            font-size: 11px;
            color: #4a5a6f;
            line-height: 1.6;
          }
          .footer .copyright a {
            color: #0073FF;
            text-decoration: none;
          }
          .footer .copyright a:hover { text-decoration: underline; }
          
          /* RESPONSIVE */
          @media only screen and (max-width: 480px) {
            .header { padding: 15px; }
            .header-logo { font-size: 22px; }
            .feature-story { padding: 20px; }
            .feature-story h2 { font-size: 20px; }
            .post-item { padding: 12px 20px; }
            .post-item .thumb { width: 60px; height: 60px; }
            .section-header { padding: 15px 20px; }
            .stats-grid { grid-template-columns: 1fr; padding: 10px 20px; }
            .expert-view { margin: 10px 20px; padding: 15px 20px; }
            .trends-list { padding: 5px 20px 15px; }
            .events-list { padding: 5px 20px 15px; }
            .footer { padding: 20px; }
            .newsletter-label { padding: 10px 20px; flex-direction: column; gap: 4px; }
          }
        </style>
      </head>
      <body>
        <div class="main-container">
          
          <!-- HEADER -->
          <div class="header">
            <div class="header-logo">TOOLING <span>TRENDS</span></div>
            <div class="header-sub">INDIA'S PREMIER PORTAL FOR TOOLING INDUSTRY</div>
            <div class="header-line"></div>
          </div>
          
          <!-- HEADER BANNER IMAGE -->
          <div class="header-banner">
            <img src="${headerImage}" alt="Tooling Trends Banner" />
          </div>
          
          <!-- NEWSLETTER LABEL -->
          <div class="newsletter-label">
            <h2>📰 NEWSLETTER</h2>
            <span>${currentDate} | Issue #${Math.floor(Math.random() * 100) + 1}</span>
          </div>
          
          <!-- FEATURE STORY -->
          <div class="feature-story">
            <div class="tag">FEATURE STORY</div>
            <h2>The Future of Precision Manufacturing in India</h2>
            <p>From smart factories to advanced metrology, India's manufacturing sector is entering a new era of precision, productivity and global competitiveness.</p>
            <a href="${appUrl}/posts" class="read-link">Read Full Story →</a>
          </div>
          
          <!-- TOP INDUSTRY INSIGHTS -->
          <div class="section-header">
            <h3>TOP INDUSTRY INSIGHTS</h3>
            <a href="${appUrl}/posts">View All Insights →</a>
          </div>
    `;

    // Add selected posts
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

      // First post gets featured treatment
      if (index === 0) {
        html += `
          <div class="post-item" style="padding: 15px 30px 20px; border-bottom: 1px solid #f0f4f8; display: block;">
            ${imageUrl ? `<div class="thumb" style="width:100%; height:180px; border-radius:4px; overflow:hidden; margin-bottom:10px;">
              <img src="${imageUrl}" alt="${post.title}" style="width:100%; height:100%; object-fit:cover;" />
            </div>` : ''}
            ${post.badge ? `<span class="badge" style="background: ${getBadgeColor(post.badge)};">${post.badge}</span>` : ''}
            ${categoryName ? `<span class="badge" style="background: #6B7280; margin-left:4px;">${categoryName}</span>` : ''}
            <h4 style="font-size:18px; margin-top:6px;"><a href="${appUrl}/post/${post.slug}">${post.title}</a></h4>
            <p style="color:#4a5a6f; font-size:13px; line-height:1.5; margin:6px 0;">${post.excerpt || 'Read more about the latest trends in precision manufacturing and tooling industry.'}</p>
            <div class="meta" style="font-size:11px; color:#8a9bb5;">
              <span>By ${authorName}</span>
              <span>${post.views?.toLocaleString() || 0} Views</span>
              <span>${date}</span>
            </div>
            <a href="${appUrl}/post/${post.slug}" style="display:inline-block; margin-top:8px; color:#0073FF; font-weight:600; font-size:13px; text-decoration:none;">Read More →</a>
          </div>
        `;
      } else {
        html += `
          <div class="post-item">
            ${imageUrl ? `<div class="thumb"><img src="${imageUrl}" alt="${post.title}" /></div>` : ''}
            <div class="content">
              ${post.badge ? `<span class="badge" style="background: ${getBadgeColor(post.badge)};">${post.badge}</span>` : ''}
              ${categoryName ? `<span class="badge" style="background: #6B7280; margin-left:2px;">${categoryName}</span>` : ''}
              <h4><a href="${appUrl}/post/${post.slug}">${post.title}</a></h4>
              <div class="meta">
                <span>By ${authorName}</span>
                <span>${post.views?.toLocaleString() || 0} Views</span>
              </div>
            </div>
          </div>
        `;
      }
    });

    html += `
          <!-- INDUSTRY TRENDS -->
          <div class="section-header">
            <h3>INDUSTRY TRENDS</h3>
            <a href="${appUrl}/posts">View All Trends →</a>
          </div>
          <div class="trends-list">
            <ul>
              <li>Additive Manufacturing in Tooling: From Prototyping to Production</li>
              <li>High-Performance Tool Materials: What's Next?</li>
              <li>Electric Vehicles & Tooling: Opportunities for Indian Manufacturers</li>
              <li>Global Supply Chain Shifts: Impact on Indian Tooling Industry</li>
              <li>Government Initiatives Supporting Advanced Manufacturing in India</li>
            </ul>
          </div>
          
          <!-- EXPERT VIEW -->
          <div class="expert-view">
            <div class="quote">The next decade will belong to manufacturers who embrace innovation, invest in skills and adopt smart technologies.</div>
            <div class="author">— <strong>Rajesh Sharma</strong> · Managing Director, Precision Tools Pvt. Ltd.</div>
            <a href="${appUrl}/expert-view" style="display:inline-block; margin-top:8px; color:#0073FF; font-weight:600; font-size:12px; text-decoration:none;">Read Expert View →</a>
          </div>
          
          <!-- INDUSTRY STATISTICS -->
          <div class="section-header">
            <h3>INDUSTRY STATISTICS</h3>
            <a href="${appUrl}/statistics">View More Stats →</a>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="number">3.1 Lakh Cr</div>
              <div class="label">Projected growth by 2030</div>
            </div>
            <div class="stat-item">
              <div class="number">8–10%</div>
              <div class="label">Estimated CAGR (2024–2030)</div>
            </div>
            <div class="stat-item">
              <div class="number">$5.6B</div>
              <div class="label">Exports by 2026</div>
            </div>
          </div>
          
          <!-- UPCOMING EVENTS -->
          <div class="section-header">
            <h3>UPCOMING INDUSTRY EVENTS</h3>
            <a href="${appUrl}/events">View All Events →</a>
          </div>
          <div class="events-list">
            <div class="event">
              <div class="name">DIE & MOULD</div>
              <div class="details">23 – 29 Jan 2025 · BIEC, Bengaluru</div>
            </div>
            <div class="event">
              <div class="name">DIE & MOULD</div>
              <div class="details">20 – 23 Feb 2025 · Chennai Trade Centre, Chennai</div>
            </div>
            <div class="event">
              <div class="name">ToolTech</div>
              <div class="details">11 – 14 Apr 2025 · Pragati Maidan, New Delhi</div>
            </div>
          </div>
          
          <!-- FEATURED RESOURCE -->
          <div style="padding: 15px 30px 20px; background: #f8faff; margin: 0 30px 20px; border-radius: 6px; text-align: center;">
            <div style="font-size:12px; color:#6b7a8f; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">FEATURED RESOURCE</div>
            <div style="font-size:18px; font-weight:700; color:#0A1628;">TOOLING INDUSTRY OUTLOOK</div>
            <div style="font-size:13px; color:#4a5a6f; margin:6px 0 10px;">An exclusive report on market trends, technology, key players and growth opportunities.</div>
            <a href="#" style="display:inline-block; background:#0073FF; color:#fff; padding:8px 24px; border-radius:4px; text-decoration:none; font-weight:600; font-size:13px;">Download Report →</a>
          </div>
          
          <!-- ADVERTISE -->
          <div style="padding: 15px 30px 20px; text-align: center; border-top: 1px solid #e0e6ed; border-bottom: 1px solid #e0e6ed;">
            <div style="font-size:16px; font-weight:600; color:#0A1628;">Showcase Your Products. Reach the Right Audience.</div>
            <a href="#" style="display:inline-block; margin-top:8px; background:#0A1628; color:#fff; padding:8px 24px; border-radius:4px; text-decoration:none; font-weight:600; font-size:13px;">Advertise Now →</a>
          </div>
          
          <!-- FOOTER -->
          <div class="footer">
            <div class="logo">TOOLING <span>TRENDS</span></div>
            <div style="color:#4a5a6f; font-size:11px; margin-top:4px;">India's Premier Portal for Tooling Industry</div>
            <div class="social">
              <a href="#">LinkedIn</a>
              <a href="#">Twitter</a>
              <a href="#">Facebook</a>
              <a href="#">Instagram</a>
            </div>
            <div class="copyright">
              <p>You are receiving this email because you are a registered user on ToolingTrends.com</p>
              <p style="margin-top:6px;">
                <a href="#">Unsubscribe</a> · <a href="#">Update Preferences</a>
              </p>
              <p style="margin-top:8px;">© ${new Date().getFullYear()} ToolingTrends.com</p>
            </div>
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
        Select posts from your site to build a dynamic newsletter template matching the Tooling Trends design
      </p>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
        <strong>📝 How it works:</strong>
        <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
          <li>Select posts from the list below to include in your newsletter</li>
          <li>The template will automatically include these posts with the Tooling Trends design</li>
          <li>Images from posts will be displayed automatically</li>
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
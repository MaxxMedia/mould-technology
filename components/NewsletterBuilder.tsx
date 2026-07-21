// components/NewsletterBuilder.tsx
"use client";

import { useState } from "react";

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

interface NewsletterBuilderProps {
  posts: Post[];
  onGenerate: (html: string) => void;
}

export function NewsletterBuilder({ posts, onGenerate }: NewsletterBuilderProps) {
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [headerText, setHeaderText] = useState("Tooling Trends Newsletter");
  const [footerText, setFooterText] = useState("© 2025 Tooling Trends. All rights reserved.");

  function togglePost(postId: number) {
    setSelectedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  }

  function generateHTML() {
    const selected = posts.filter(p => selectedPosts.includes(p.id));
    
    if (selected.length === 0) {
      alert("Please select at least one post");
      return;
    }

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${headerText}</title>
        <style>
          /* ... styles ... */
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <h1>${headerText}</h1>
        </div>
    `;

    selected.forEach(post => {
      html += `
        <div class="post">
          ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" />` : ''}
          <h2>${post.title}</h2>
          <p>${post.excerpt || "Read more about this topic..."}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/post/${post.slug}">Read Full Story →</a>
        </div>
      `;
    });

    html += `
        <div class="footer">
          <p>${footerText}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe">Unsubscribe</a></p>
        </div>
      </body>
      </html>
    `;

    onGenerate(html);
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block mb-2 font-medium">Header Text</label>
        <input
          value={headerText}
          onChange={(e) => setHeaderText(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Select Posts</label>
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
          {posts.map(post => (
            <label key={post.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPosts.includes(post.id)}
                onChange={() => togglePost(post.id)}
              />
              <span className="text-sm">{post.title}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={generateHTML}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Generate Newsletter HTML
      </button>
    </div>
  );
}
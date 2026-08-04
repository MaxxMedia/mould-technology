import type { Metadata, Viewport } from "next"
import { Inter_Tight } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "remixicon/fonts/remixicon.css"

import "./globals.css"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { SpeedInsights } from "@vercel/speed-insights/next"

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
})

// Enhanced metadata for better SEO
export const metadata: Metadata = {
  metadataBase: new URL("https://www.toolingtrends.com"),
  
  title: {
    default: "Tooling Trends - Industrial & Manufacturing Technology News",
    template: "%s | Tooling Trends",
  },
  
  description: "Latest industrial manufacturing technology news, trends, and insights. Covering smart factories, AI, automation, CNC machining, injection molding, and Industry 4.0 innovations.",
  
  keywords: [
    "manufacturing technology",
    "industrial news",
    "smart factories",
    "Industry 4.0",
    "CNC machining",
    "injection molding",
    "automation",
    "artificial intelligence manufacturing",
    "tooling trends",
    "manufacturing innovation",
    "industrial automation",
    "precision machining",
    "mold design",
    "surface engineering",
    "manufacturing events"
  ],
  
  authors: [{ name: "Tooling Trends" }],
  
  creator: "Tooling Trends",
  
  publisher: "Tooling Trends",
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.toolingtrends.com",
    siteName: "Tooling Trends",
    title: "Tooling Trends - Industrial & Manufacturing Technology News",
    description: "Latest industrial manufacturing technology news, trends, and insights. Covering smart factories, AI, automation, CNC machining, and Industry 4.0.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tooling Trends - Manufacturing Technology News",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Tooling Trends - Industrial & Manufacturing Technology News",
    description: "Latest industrial manufacturing technology news, trends, and insights.",
    images: ["/og-image.jpg"],
    creator: "@toolingtrends",
    site: "@toolingtrends",
  },
  
  alternates: {
    canonical: "https://www.toolingtrends.com",
  },
  
  category: "technology",
  
  classification: "Manufacturing Technology News",
  
  // Additional metadata
  other: {
    "revisit-after": "1 days",
    "rating": "General",
    "distribution": "global",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },

  manifest: "/site.webmanifest",
  
  verification: {
    google: "your-google-site-verification-code",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1318" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // JSON-LD Structured Data for better SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tooling Trends",
    url: "https://www.toolingtrends.com",
    description: "Latest industrial manufacturing technology news, trends, and insights.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.toolingtrends.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Tooling Trends",
      logo: {
        "@type": "ImageObject",
        url: "https://www.toolingtrends.com/logo.png",
      },
    },
    sameAs: [
      "https://twitter.com/toolingtrends",
      "https://linkedin.com/company/toolingtrends",
      "https://youtube.com/toolingtrends",
    ],
  }

  return (
    <html lang="en" className={interTight.variable}>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Additional meta tags for better SEO */}
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="Global" />
        
        {/* Dublin Core metadata */}
        <meta name="DC.title" content="Tooling Trends - Industrial & Manufacturing Technology News" />
        <meta name="DC.creator" content="Tooling Trends" />
        <meta name="DC.subject" content="Manufacturing Technology, Industrial News, Industry 4.0" />
        <meta name="DC.description" content="Latest industrial manufacturing technology news and insights" />
        <meta name="DC.language" content="en" />
        <meta name="DC.publisher" content="Tooling Trends" />
        <meta name="DC.date" content="2026" />
        <meta name="DC.type" content="News and Information" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="Tooling Trends RSS Feed" href="/feed.xml" />
        
        {/* Sitemap */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Header />

        <main className="pt-[90px] pb-24">
          {children}
        </main>

        <Analytics />
        <SpeedInsights />
        <Footer />
      </body>
    </html>
  )
}

import type { Metadata } from "next"

export const SITE_URL = "https://www.toolingtrends.com"
export const SITE_NAME = "Tooling Trends"

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

type ListingSeo = {
  title: string
  description: string
  path: string
  keywords: string[]
}

export function listingMetadata({
  title,
  description,
  path,
  keywords,
}: ListingSeo): Metadata {
  const url = absoluteUrl(path)
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: absoluteUrl("/og-image.jpg"),
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl("/og-image.jpg")],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export function collectionJsonLd({
  name,
  description,
  path,
  itemUrls = [],
}: {
  name: string
  description: string
  path: string
  itemUrls?: string[]
}) {
  const url = absoluteUrl(path)
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name, item: url },
      ],
    },
    ...(itemUrls.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: itemUrls.length,
            itemListElement: itemUrls.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: item,
            })),
          },
        }
      : {}),
  }
}

export function getBackendUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "https://api.toolingtrends.com").replace(
    /\/$/,
    ""
  )
}

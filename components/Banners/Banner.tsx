// Banner.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type BannerPlacement =
  | "HOME_TOP"
  | "HOME_MIDDLE"
  | "HOME_BOTTOM"
  | "ARTICLE_TOP"
  | "ARTICLE_MIDDLE"
  | "ARTICLE_BOTTOM"
  | "SUPPLIER_TOP"
  | "SUPPLIER_AFTER_VIDEO"
  | "SIDEBAR"
  | "FOOTER"
  | "EVENT_RIGHT"
  | "SUPPLIER_RIGHT"
  | "JOB_RIGHT"
  | "INDUSTRY_TALKS_RIGHT"
  | "MAGAZINE_RIGHT"
  | "Archive";

type BannerData = {
  id: number;
  title: string;
  imageUrl: string;
  targetUrl?: string;
  placement: string;
};

type BannerProps = {
  placement: BannerPlacement;
  /** How many ads to show for square/right-rail placements. Default 3. */
  limit?: number;
  /** Whether right-rail ads stick on scroll. Default true. */
  sticky?: boolean;
};

// ---------- placement -> layout bucket ----------

const TOP_PLACEMENTS: BannerPlacement[] = ["HOME_TOP", "ARTICLE_TOP"];

const BLOCK_PLACEMENTS: BannerPlacement[] = [
  "HOME_MIDDLE",
  "HOME_BOTTOM",
  "ARTICLE_MIDDLE",
  "ARTICLE_BOTTOM",
];

// Square 300x250 ads, possibly multiple, stacked in a rail (old SupplierAds behavior)
const RIGHT_RAIL_PLACEMENTS: BannerPlacement[] = [
  "SIDEBAR",
  "EVENT_RIGHT",
  "SUPPLIER_RIGHT",
  "JOB_RIGHT",
  "INDUSTRY_TALKS_RIGHT",
  "MAGAZINE_RIGHT",
  "Archive",
];

// everything else (SUPPLIER_TOP, SUPPLIER_AFTER_VIDEO, FOOTER) falls through
// to the default 970x250 leaderboard at the bottom of the function.

// ---------- main component ----------

export default function Banner({ placement, limit, sticky = true }: BannerProps) {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchBanners = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/banners?placement=${placement}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          if (!cancelled) setBanners([]);
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        if (!cancelled) setBanners(list);
      } catch (error) {
        console.error("Banner fetch error:", error);
        if (!cancelled) setBanners([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    fetchBanners();
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (!loaded || !banners.length) return null;

  // --- Right-rail / square slots: can render multiple stacked ads ---
  if (RIGHT_RAIL_PLACEMENTS.includes(placement)) {
    const ads = banners.slice(0, limit ?? 3);
    return (
      <div className={`space-y-6 ${sticky ? "sticky top-6" : ""}`}>
        {ads.map((ad) => (
          <SquareAd key={ad.id} ad={ad} />
        ))}
      </div>
    );
  }

  const banner = banners[0];

  // --- Slim leaderboard, 728x90 responsive ---
  if (TOP_PLACEMENTS.includes(placement)) {
    return (
      <section className="py-6">
        <div className="w-full flex justify-center px-6">
          <div
            className="relative overflow-hidden w-full"
            style={{ maxWidth: "728px", aspectRatio: "728 / 90" }}
          >
            <Link
              href={banner.targetUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                priority
                sizes="(max-width: 728px) 100vw, 728px"
                className="object-cover"
              />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // --- 970x250 leaderboard on a light background block ---
  if (BLOCK_PLACEMENTS.includes(placement)) {
    return (
      <section className="py-10 px-6" style={{ backgroundColor: "#F8F9FA" }}>
        <div className="max-w-[970px] w-full mx-auto flex justify-center">
          <Link href={banner.targetUrl || "#"} target="_blank" rel="noopener noreferrer">
            <div
              className="relative overflow-hidden"
              style={{ width: "970px", height: "250px" }}
            >
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                priority
                sizes="970px"
                className="object-cover"
              />
            </div>
          </Link>
        </div>
      </section>
    );
  }

  // --- Default: plain 970x250 leaderboard (SUPPLIER_TOP, SUPPLIER_AFTER_VIDEO, FOOTER) ---
  return (
    <section className="py-6">
      <div className="max-w-[970px] w-full mx-auto px-6 flex justify-center">
        <Link href={banner.targetUrl || "#"} target="_blank" rel="noopener noreferrer">
          <div className="relative overflow-hidden" style={{ width: "970px", height: "250px" }}>
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              priority
              sizes="970px"
              className="object-cover"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}

// ---------- sub-components ----------

function SquareAd({ ad }: { ad: BannerData }) {
  return (
    <Link
      href={ad.targetUrl || "#"}
      className="block bg-white"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="relative overflow-hidden mx-auto" style={{ width: "300px", height: "250px" }}>
        <Image src={ad.imageUrl} alt={ad.title} fill sizes="300px" className="object-cover" />
      </div>
    </Link>
  );
}

/** Static CTA card, not backed by fetched banner data. Drop into a right rail alongside <Banner />. */
export function RecruiterAd({ src }: { src: string }) {
  return (
    <Link href="/signup?role=recruiter" className="relative block group overflow-hidden">
      <div className="relative overflow-hidden mx-auto" style={{ width: "300px", height: "250px" }}>
        <Image src={src} alt="Hire Candidates" fill sizes="300px" className="object-cover" />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h3 className="text-white text-xl font-bold mb-2">Hiring Talent?</h3>
          <p className="text-white/90 text-sm mb-4">Register your company & post jobs</p>
          <span className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold group-hover:bg-indigo-700 transition">
            Hire Candidates
          </span>
        </div>
      </div>
    </Link>
  );
}
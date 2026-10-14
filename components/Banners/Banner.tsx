// Banner.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getApiUrl } from "@/lib/apiUrl";

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
    /** Optional starting index offset so multiple banners on the same page don't show identical ads */
    initialIndex?: number;
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

export default function Banner({ placement, limit, sticky = true, initialIndex = 0 }: BannerProps) {
    const [banners, setBanners] = useState<BannerData[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setCurrentIndex(initialIndex);

        const fetchBanners = async () => {
            try {
                const res = await fetch(
                    `${getApiUrl()}/api/banners?placement=${placement}`,
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
    }, [placement, initialIndex]);


    // Preload all banner images so 10s transitions are instant with zero flash/delay
    useEffect(() => {
        if (!banners.length) return;
        banners.forEach((b) => {
            if (b.imageUrl && typeof window !== "undefined") {
                const img = new window.Image();
                img.src = b.imageUrl;
            }
        });
    }, [banners]);

    // Auto-rotate banners every 10s if multiple banners exist
    useEffect(() => {
        if (banners.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [banners.length, isPaused]);

    if (!loaded || !banners.length) return null;

    const safeIndex = currentIndex % banners.length;
    const banner = banners[safeIndex];
    const bannerHref = banner.targetUrl
        ? `${getApiUrl()}/api/banners/${banner.id}/click`
        : "#";

    // --- Right-rail / square slots: 300x250 ---
    if (RIGHT_RAIL_PLACEMENTS.includes(placement)) {
        if (limit && limit > 1) {
            const count = Math.min(limit, banners.length);
            const ads = Array.from({ length: count }, (_, i) =>
                banners[(currentIndex + i) % banners.length]
            );
            return (
                <div
                    className={`space-y-6 ${sticky ? "sticky top-6" : ""}`}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {ads.map((ad) => (
                        <SquareAd key={ad.id} ad={ad} />
                    ))}
                </div>
            );
        }

        return (
            <div
                className={sticky ? "sticky top-6" : ""}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <SquareAd key={banner.id} ad={banner} />
            </div>
        );
    }

    // --- Slim leaderboard, 728x90 responsive ---
    if (TOP_PLACEMENTS.includes(placement)) {
        return (
            <section className="py-6">
                <div className="w-full flex justify-center px-6">
                    <div
                        className="relative overflow-hidden w-full"
                        style={{ maxWidth: "728px", aspectRatio: "728 / 90" }}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <Link
                            key={banner.id}
                            href={bannerHref}
                            target={banner.targetUrl ? "_blank" : undefined}
                            rel={banner.targetUrl ? "noopener noreferrer" : undefined}
                            onClick={(e) => {
                                if (!banner.targetUrl) e.preventDefault();
                            }}
                            className="block w-full h-full animate-banner-fade"
                        >
                            <Image
                                src={banner.imageUrl}
                                alt={banner.title || "Advertisement"}
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
            <section className="py-6 sm:py-10 px-4 sm:px-6 bg-[#F8F9FA] w-full">
                <div
                    className="max-w-[970px] w-full mx-auto flex justify-center"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <Link
                        key={banner.id}
                        href={bannerHref}
                        target={banner.targetUrl ? "_blank" : undefined}
                        rel={banner.targetUrl ? "noopener noreferrer" : undefined}
                        onClick={(e) => {
                            if (!banner.targetUrl) e.preventDefault();
                        }}
                        className="w-full block animate-banner-fade"
                    >
                        <div className="relative overflow-hidden w-full aspect-[970/250]">
                            <Image
                                src={banner.imageUrl}
                                alt={banner.title || "Advertisement"}
                                fill
                                priority
                                sizes="(max-width: 970px) 100vw, 970px"
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
        <section className="py-4 sm:py-6 w-full">
            <div
                className="max-w-[970px] w-full mx-auto px-4 sm:px-6 flex justify-center"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <Link
                    key={banner.id}
                    href={bannerHref}
                    target={banner.targetUrl ? "_blank" : undefined}
                    rel={banner.targetUrl ? "noopener noreferrer" : undefined}
                    onClick={(e) => {
                        if (!banner.targetUrl) e.preventDefault();
                    }}
                    className="w-full block animate-banner-fade"
                >
                    <div className="relative overflow-hidden w-full aspect-[970/250]">
                        <Image
                            src={banner.imageUrl}
                            alt={banner.title || "Advertisement"}
                            fill
                            priority
                            sizes="(max-width: 970px) 100vw, 970px"
                            className="object-cover"
                        />
                    </div>
                </Link>
            </div>
        </section>
    );
}

// ---------- sub-components ----------

// Fills the FULL WIDTH of its container (the sidebar/rail), instead of a
// fixed 300px box — that fixed width was leaving white space on either side
// whenever the container was wider than 300px. Height is derived from the
// 300:250 aspect ratio so it scales proportionally at any width.
function SquareAd({ ad }: { ad: BannerData }) {
    const bannerHref = ad.targetUrl
        ? `${getApiUrl()}/api/banners/${ad.id}/click`
        : "#";

    return (
        <Link
            key={ad.id}
            href={bannerHref}
            className="block w-[300px] h-[250px] overflow-hidden animate-banner-fade shrink-0"
            target={ad.targetUrl ? "_blank" : undefined}
            rel={ad.targetUrl ? "noopener noreferrer" : undefined}
            onClick={(e) => {
                if (!ad.targetUrl) e.preventDefault();
            }}
        >
            <Image
                src={ad.imageUrl}
                alt={ad.title || "Advertisement"}
                width={300}
                height={250}
                className="w-[300px] h-[250px] object-cover"
            />
        </Link>
    );
}

/** Static CTA card, not backed by fetched banner data. Drop into a right rail alongside <Banner />. */
export function RecruiterAd({ src }: { src: string }) {
    return (
        <Link href="/signup?role=recruiter" className="relative block group overflow-hidden">
            <div className="relative overflow-hidden w-full" style={{ aspectRatio: "300 / 250" }}>
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
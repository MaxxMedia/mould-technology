// components/SupplierPromotionBanner.tsx
"use client";

import { useState } from "react";
import {
    // BadgeCheck,
    MapPin,
    Phone,
    Mail,
    Globe,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    LucideFacebook,
    LucideLinkedin,
    LucideTwitter,
    LucideYoutube,
} from "lucide-react";
import type { PlanTier } from "@/lib/packages";
import QuoteRequestButton from "./QuteRequestForm";


type SocialLinks = {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    whatsapp?: string;
};

type Props = {
    planTier: PlanTier;
    name: string;
    location?: string;
    logoUrl?: string;
    coverImageUrl?: string[];
    tagline?: string;
    tradeNames?: string[];
    phoneNumber?: string;
    email?: string;
    website?: string;
    socialLinks?: SocialLinks;
    slug?: string;
    showQuoteButton?: boolean;
};

type TierStyles = {
    badgeBg: string;
    badgeText: string;
    accent: string;
    label: string;
    gradient: string;
};

const TIER_STYLES: Record<Exclude<PlanTier, "free">, TierStyles> = {
    basic: {
        badgeBg: "bg-white",
        badgeText: "text-gray-700",
        accent: "border-gray-300",
        label: "🥈 Verified Supplier",
        gradient: "from-gray-600 to-gray-800",
    },
    professional: {
        badgeBg: "bg-white",
        badgeText: "text-amber-700",
        accent: "border-amber-400",
        label: "🥇 Premium Supplier",
        gradient: "from-amber-600 to-amber-800",
    },
    enterprise: {
        badgeBg: "bg-white",
        badgeText: "text-slate-900",
        accent: "border-slate-700",
        label: "💎 Enterprise Partner",
        gradient: "from-slate-700 to-slate-950",
    },
};

function ContactItem({
    icon,
    children,
}: {
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <span className="flex items-center gap-1.5 text-white/90 text-xs sm:text-sm drop-shadow">
            {icon}
            <span className="truncate">{children}</span>
        </span>
    );
}

function CoverImageCarousel({ images, name }: { images: string[]; name: string }) {
    const [index, setIndex] = useState(0);

    if (images.length === 0) return null;

    if (images.length === 1) {
        return (
            <img
                src={images[0]}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover"
            />
        );
    }

    const goPrev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    const goNext = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

    return (
        <>
            <img
                src={images[index]}
                alt={`${name} cover ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            />

            <button
                type="button"
                onClick={goPrev}
                aria-label="Previous cover image"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 hover:bg-black/60 text-white p-1.5 transition"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button
                type="button"
                onClick={goNext}
                aria-label="Next cover image"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 hover:bg-black/60 text-white p-1.5 transition"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {images.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        aria-label={`Go to cover image ${i + 1}`}
                        onClick={() => setIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                            }`}
                    />
                ))}
            </div>
        </>
    );
}

export default function SupplierPromotionBanner({
    planTier,
    name,
    location,
    logoUrl,
    coverImageUrl,
    tagline,
    tradeNames,
    phoneNumber,
    email,
    website,
    socialLinks,
    slug,
    showQuoteButton = true,
}: Props) {
    const normalized = String(planTier ?? "free").trim().toLowerCase() as PlanTier;

    if (normalized === "free" || !TIER_STYLES[normalized as Exclude<PlanTier, "free">]) {
        if (normalized !== "free" && process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.warn(
                `SupplierPromotionBanner: unrecognized planTier "${planTier}" — banner hidden.`
            );
        }
        return null;
    }

    const tier = TIER_STYLES[normalized as Exclude<PlanTier, "free">];
    const social = socialLinks || {};
    const hasSocial =
        !!(social.facebook || social.linkedin || social.twitter || social.youtube);
    const hasContactInfo =
        !!(phoneNumber || email || website || social.whatsapp || (tradeNames && tradeNames.length > 0));

    const images = (coverImageUrl || []).filter(Boolean);

    return (
        <div
            className={`w-full overflow-hidden rounded-2xl border ${tier.accent} shadow-xl bg-white mb-8 md:mb-10`}
        >
            {/* ===== IMAGE / GRADIENT ZONE ===== */}
            <div className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[300px]">
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient}`} />
                <CoverImageCarousel images={images} name={name} />

                {/* Strong gradient across the WHOLE image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
                    <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold shadow-lg ${tier.badgeBg} ${tier.badgeText}`}
                    >
                        {/* <BadgeCheck className="w-4 h-4" /> */}
                        {tier.label}
                    </div>
                </div>

                {/* Logo + name + tagline + location sit ON the image, bottom-left */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6 text-white">
                    <div className="flex items-end gap-3 sm:gap-4">
                        {logoUrl && (
                            <img
                                src={logoUrl}
                                alt={`${name} logo`}
                                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg bg-white object-contain p-1.5 shadow-lg shrink-0"
                            />

                        )}
                        <div className="min-w-0">
                            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-lg truncate sm:whitespace-normal">
                                {name}
                            </h2>
                            {tagline && (
                                <p className="mt-1 text-white/90 text-xs sm:text-sm drop-shadow line-clamp-1 sm:line-clamp-2">
                                    {tagline}
                                </p>
                            )}
                            {location && (
                                <div className="flex items-center gap-1.5 mt-1 text-white/85 drop-shadow text-xs sm:text-sm">
                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== SOLID INFO PANEL ===== */}
            {(hasContactInfo || hasSocial || (showQuoteButton && slug)) && (
                <div className="bg-white border-t-2 border-gray-100 px-4 sm:px-6 py-4 sm:py-5">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-6 items-start md:items-center">
                        {/* LEFT COLUMN: contact details + social */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 min-w-0">

                            {phoneNumber && (
                                <span className="flex items-center gap-2 min-w-0">
                                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span className="truncate">{phoneNumber}</span>
                                </span>
                            )}
                            {email && (
                                <span className="flex items-center gap-2 min-w-0">
                                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span className="truncate">{email}</span>
                                </span>
                            )}
                            {website && (
                                <span className="flex items-center gap-2 min-w-0">
                                    <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <a
                                        href={website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="truncate text-blue-600 hover:underline"
                                    >
                                        {website}
                                    </a>
                                </span>
                            )}
                            {social.whatsapp && (
                                <span className="flex items-center gap-2 min-w-0">
                                    <MessageCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <a
                                        href={
                                            social.whatsapp.startsWith("http")
                                                ? social.whatsapp
                                                : `https://wa.me/${social.whatsapp.replace(/[^\d]/g, "")}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="truncate text-blue-600 hover:underline"
                                    >
                                        WhatsApp
                                    </a>
                                </span>
                            )}
                            {tradeNames && tradeNames.length > 0 && (
                                <span className="flex items-start gap-2 sm:col-span-2 min-w-0">
                                    <span className="text-gray-400 shrink-0">Trade Names:</span>
                                    <span className="truncate">{tradeNames.join(", ")}</span>
                                </span>
                            )}

                            {hasSocial && (
                                <div className="flex gap-3 sm:col-span-2 pt-1">
                                    {social.facebook && (
                                        <a href={social.facebook} target="_blank" rel="noopener noreferrer">
                                            <LucideFacebook className="w-4.5 h-4.5 text-gray-400 hover:text-[#3b5998]" />
                                        </a>
                                    )}
                                    {social.linkedin && (
                                        <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
                                            <LucideLinkedin className="w-4.5 h-4.5 text-gray-400 hover:text-[#0077b5]" />
                                        </a>
                                    )}
                                    {social.twitter && (
                                        <a href={social.twitter} target="_blank" rel="noopener noreferrer">
                                            <LucideTwitter className="w-4.5 h-4.5 text-gray-400 hover:text-black" />
                                        </a>
                                    )}
                                    {social.youtube && (
                                        <a href={social.youtube} target="_blank" rel="noopener noreferrer">
                                            <LucideYoutube className="w-4.5 h-4.5 text-gray-400 hover:text-red-600" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* ✅ QUOTE REQUEST BUTTON - IN THE SAME ROW AS CONTACT ITEMS */}
                            {showQuoteButton && slug && (
                                <div className="ml-auto shrink-0">
                                    <QuoteRequestButton
                                        supplierSlug={slug}
                                        supplierName={name}
                                    />
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: button */}
                        {showQuoteButton && slug && (
                            <div className="shrink-0 w-full md:w-auto">
                                <QuoteRequestButton
                                    supplierSlug={slug}
                                    supplierName={name}
                                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#0b3954] text-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wide hover:bg-[#092f46] transition rounded"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
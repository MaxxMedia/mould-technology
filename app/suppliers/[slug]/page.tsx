import CompanyArticlesCarousel from "@/components/CompanyArticlesCarousel"
import SocialLinksTracker from "@/components/SocialLinksTracker"
import QuoteRequestButton from "@/components/QuteRequestForm"
import {
  LucideFacebook,
  LucideLinkedin,
  LucideTwitter,
  LucideYoutube,
  Globe,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import ClaimCompanyBanner from "@/components/ClaimCompanyBanner"
import GalleryTabs from "@/components/GalleryTabs"
import SupplierPromotionBanner from "@/components/SupplierPromotionBanner"
import Link from "next/link"
import { cookies } from "next/headers"

type JwtPayload = {
  id: number
  role: string
  email: string
  companyId?: number | null
}

async function getCurrentUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.user as JwtPayload
  } catch {
    return null
  }
}

/* ================= TYPES ================= */

type Article = {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  imageUrl?: string | null
  publishedAt: string
}

type Supplier = {
  productCatalogues?: string[]
  planTier?: "free" | "basic" | "professional" | "enterprise" | string | null
  promotionBanners?: string[]

  id: number
  companyId: number
  name: string
  slug: string
  description: string
  website?: string
  logoUrl?: string
  coverImageUrl?: string | string[] | null   // <-- matches actual API field name
  phoneNumber?: string
  email?: string
  tradeNames?: string[]
  videoGallery?: string[]
  productGallery?: string[]
  companyGallery?: string[]
  factoryGallery?: string[]
  enableInquiryForm?: boolean
  views?: number
  connections?: number
  createdAt?: string
  socialLinks?: {
    facebook?: string
    linkedin?: string
    twitter?: string
    youtube?: string
    whatsapp?: string
  }
  Company?: {
    id: number
    name: string
    location?: string
    industry?: string
    website?: string
    tagline?: string
  }
}

/* ================= PAGE ================= */

export default async function SupplierShowroomPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  /* ---------- FETCH SUPPLIER ---------- */
  const supplierRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/${slug}`,
    { cache: "no-store" }
  )

  if (!supplierRes.ok) {
    return (
      <div className="p-10 text-center text-gray-600">
        Supplier not found
      </div>
    )
  }

  const supplier: Supplier = await supplierRes.json()

  const social = supplier.socialLinks || {}

  /* ---------- FETCH COMPANY ARTICLES ---------- */
  const articlesRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${supplier.companyId}/articles`,
    { cache: "no-store" }
  )

  let articles: Article[] = []
  if (articlesRes.ok) {
    articles = await articlesRes.json()
  }

  const websiteLink = supplier.website || supplier.Company?.website

  /* ---------- PLAN ---------- */
  // Defensive: trims + lowercases so "Basic", " BASIC", etc. from the API
  // still resolve correctly. If your API returns the tier under a different
  // field/path (e.g. supplier.subscription?.tier), update this line to match.
  const rawPlanTier = supplier.planTier
  const normalizedPlanTier = (
    String(rawPlanTier ?? "free").trim().toLowerCase()
  ) as "free" | "basic" | "professional" | "enterprise"

  const KNOWN_TIERS = ["free", "basic", "professional", "enterprise"]
  const isPaid =
    KNOWN_TIERS.includes(normalizedPlanTier) && normalizedPlanTier !== "free"

  if (process.env.NODE_ENV !== "production" && !KNOWN_TIERS.includes(normalizedPlanTier)) {
    // eslint-disable-next-line no-console
    console.warn(
      `SupplierShowroomPage: unexpected planTier "${rawPlanTier}" for supplier "${supplier.slug}" — treating as free.`
    )
  }

  /* ---------- INQUIRIES ---------- */
  const inquiriesEnabled = supplier.enableInquiryForm !== false

  /* ---------- OWNERSHIP CHECK ---------- */
  const currentUser = await getCurrentUser()
  const isLoggedIn = Boolean(currentUser)
  const isOwner =
    isLoggedIn && currentUser?.companyId === supplier.companyId

  const showUpsellToOwner = !isPaid && isOwner

  return (
    <div className="min-h-screen bg-gray-50">
      {/*
        HERO
        If your root layout.tsx has a `fixed` navbar, make sure this page's
        outer wrapper (or the layout itself) has top padding equal to the
        navbar height, e.g. pt-16, so this hero — and anything overlapping
        it via negative margin below — starts BELOW the navbar, not under it.
      */}
      <div className="relative bg-black h-[140px] sm:h-[170px] md:h-[200px]" />

      {/* PROMOTION BANNER - only for paid suppliers */}
      {/* PROMOTION BANNER - only for paid suppliers */}
      {isPaid && (
        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-10 md:-mt-14">
          <SupplierPromotionBanner
            planTier={normalizedPlanTier}
            name={supplier.name}
            location={supplier.Company?.location}
            logoUrl={supplier.logoUrl}
            coverImageUrl={
              Array.isArray(supplier.coverImageUrl)
                ? supplier.coverImageUrl
                : supplier.coverImageUrl
                  ? [supplier.coverImageUrl]
                  : []
            }
            tagline={supplier.Company?.tagline}
            tradeNames={supplier.tradeNames}
            phoneNumber={supplier.phoneNumber}
            email={supplier.email}
            website={websiteLink}
            socialLinks={supplier.socialLinks}
            slug={supplier.slug}
            showQuoteButton={inquiriesEnabled}
          />
        </div>
      )}

      {/* MAIN CONTENT */}
      <div
        className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 ${isPaid ? "mt-6" : "-mt-16 sm:-mt-20 md:-mt-24"
          }`}
      >
        {/* FREE PLAN: original card-with-sidebar layout */}
        {!isPaid && (
          <div className="bg-white rounded-lg shadow p-6 sm:p-10 border-t-4 border-red-700">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#0b3954]">
              {supplier.name}
            </h1>

            {supplier.Company?.location && (
              <p className="flex items-center justify-center gap-2 text-gray-500 mt-2">
                <MapPin size={16} />
                {supplier.Company.location}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-14 mt-8 md:mt-12">
              {/* LEFT SIDEBAR */}
              <aside className="space-y-6 md:space-y-8 md:col-span-1">
                {supplier.logoUrl && (
                  <img
                    src={supplier.logoUrl}
                    alt={supplier.name}
                    className="w-full max-w-[160px] object-contain"
                  />
                )}

                {/* CONTACT INFO + QUOTE BUTTON — same row, button right-aligned */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div className="text-sm space-y-3">
                    {supplier.tradeNames && supplier.tradeNames.length > 0 && (
                      <p className="text-gray-600">
                        <strong>Trade Names:</strong>{" "}
                        {supplier.tradeNames.join(", ")}
                      </p>
                    )}

                    {supplier.phoneNumber && (
                      <p className="flex items-center gap-2">
                        <Phone size={14} />
                        {supplier.phoneNumber}
                      </p>
                    )}

                    {supplier.email && (
                      <p className="flex items-center gap-2">
                        <Mail size={14} />
                        {supplier.email}
                      </p>
                    )}

                    {websiteLink && (
                      <p className="flex items-center gap-2">
                        <Globe size={14} />
                        <a
                          href={websiteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {websiteLink}
                        </a>
                      </p>
                    )}
                </div>

                {inquiriesEnabled && (
                  <div className="shrink-0">
                    <QuoteRequestButton
                      supplierSlug={supplier.slug}
                      supplierName={supplier.name}
                    />
                  </div>
                )}
            </div>

            {/* SOCIAL LINKS */}
            {(social.facebook ||
              social.linkedin ||
              social.twitter ||
              social.youtube) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">
                    Connect
                  </h4>

                  <SocialLinksTracker supplierId={supplier.id}>
                    <div className="flex gap-4">
                      {social.facebook && (
                        <a href={social.facebook} target="_blank">
                          <LucideFacebook className="w-5 h-5 text-[#3b5998]" />
                        </a>
                      )}
                      {social.linkedin && (
                        <a href={social.linkedin} target="_blank">
                          <LucideLinkedin className="w-5 h-5 text-[#0077b5]" />
                        </a>
                      )}
                      {social.twitter && (
                        <a href={social.twitter} target="_blank">
                          <LucideTwitter className="w-5 h-5" />
                        </a>
                      )}
                      {social.youtube && (
                        <a href={social.youtube} target="_blank">
                          <LucideYoutube className="w-5 h-5 text-red-600" />
                        </a>
                      )}
                    </div>
                  </SocialLinksTracker>
                </div>
              )}
          </aside>

              {/* RIGHT CONTENT */}
        <section className="md:col-span-2">
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: supplier.description }}
          />
        </section>
      </div>
    </div>
  )
}

{/* PAID PLANS: banner already carries logo/contact/social */ }
{
  isPaid && (
    <div
      className="prose prose-sm max-w-none text-gray-700"
      dangerouslySetInnerHTML={{ __html: supplier.description }}
    />
  )
}

{/* Update Your Listing - free plan only, owner-only */ }
{ showUpsellToOwner && <ClaimCompanyBanner /> }

<hr className="my-10 md:my-12" />

{/* Upsell banner - free plan only, owner-only */ }
{
  showUpsellToOwner && (
    <div className="text-center py-8 px-6 mb-8 bg-white border border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-700 font-semibold">
        Want to upload your own photos and videos?
      </p>
      <p className="text-gray-500 text-sm mt-1">
        Upgrade your plan to add and manage your own gallery content.
      </p>
      <Link
        href="/login"
        className="inline-block mt-4 bg-[#0b3954] text-white px-6 py-2 text-sm font-semibold uppercase hover:bg-[#092f46] transition"
      >
        Purchase a Plan
      </Link>
    </div>
  )
}

{/* GALLERY TABS */ }
<GalleryTabs
  videoGallery={supplier.videoGallery}
  productGallery={supplier.productGallery}
  companyGallery={supplier.companyGallery}
  factoryGallery={supplier.factoryGallery}
  productCatalogues={supplier.productCatalogues}
  isPaid={isPaid}
/>

{/* ARTICLES */ }
{
  articles.length > 0 && (
    <>
      <hr className="my-10 md:my-12" />
      <CompanyArticlesCarousel articles={articles} />
    </>
  )
}
      </div >
    </div >
  )
}
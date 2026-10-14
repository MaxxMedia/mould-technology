"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Calendar, Clock, Eye, Mail } from "lucide-react"

import ShareSection from "@/components/share-section"
import RelatedPostsCarousel from "@/components/related-posts-carousel"
import ContentGateModal from "@/components/content-gate-modal"
import PostViewCounter from "@/components/PostViewCounter"
import Loader from "@/components/Loader"
import SupplierAds from "@/components/SupplierAds"
import Banner from "@/components/Banners/Banner"

/* ================= TYPES ================= */
type Author = {
  id: number
  name: string
  bio?: string
  avatarUrl?: string
  role?: string
  company?: string
  companySlug?: string
  profileUrl?: string
}

type Category = {
  id: number
  name: string
  slug?: string
}

type Post = {
  id: number
  title: string
  slug: string
  excerpt?: string
  content?: string
  imageUrl?: string
  publishedAt?: string
  author?: Author
  category?: Category
  youtubeUrl?: string
  views?: number
  shares?: number
  readTime?: string
  videoCaption?: string
  qa?: {
    question: string
    answer: string
    videoTimestamp?: string
    highlightQuote?: string
  }[]
}

/* ================= YOUTUBE HELPERS ================= */
function getYoutubeEmbed(url?: string) {
  if (!url) return null

  if (url.includes("youtube.com/embed")) return url

  const watchMatch = url.match(/[?&]v=([^&]+)/)
  if (watchMatch?.[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`
  }

  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0]
    return `https://www.youtube.com/embed/${id}`
  }

  return null
}

/* ================= PAGE ================= */
/* ================= TALK MAPPING HELPER ================= */
function stripHtml(html?: string | null): string {
  if (!html) return ""
  return html
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
}

function mapTalkToPost(inputData: any): Post {
  const data = inputData?.data && typeof inputData.data === "object" && (inputData.data.id || inputData.data.title)
    ? inputData.data
    : inputData

  const authorName = data.guestName || data.author?.name || "Industry Leader"
  const companyStr = data.companyName || (data.author as any)?.company || ""
  const designationStr = data.designation || ""
  const fullRole = designationStr
    ? `${designationStr}${companyStr ? ` at ${companyStr}` : ""}`
    : companyStr

  const supplierDirectorySlug = Array.isArray(data.Company?.SupplierDirectory)
    ? data.Company.SupplierDirectory[0]?.slug
    : data.Company?.SupplierDirectory?.slug

  let rawSlug = supplierDirectorySlug || data.Company?.slug || (data.companyId ? String(data.companyId) : "")

  if (!rawSlug && data.companyProfileUrl) {
    const cleaned = data.companyProfileUrl
      .replace(/^https?:\/\/[^\/]+/, "")
      .replace(/^\/(?:suppliers|company)\//, "")
      .replace(/\/$/, "")
      .trim()
    if (cleaned) rawSlug = cleaned
  }

  if (!rawSlug && data.companyName) {
    rawSlug = data.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }

  const profileUrl = rawSlug ? `/suppliers/${rawSlug}` : "/suppliers"

  const rawBio = data.shortBio || data.author?.bio || ""
  const cleanBio = stripHtml(rawBio)

  const rawIntro = data.introduction || data.content || ""
  const cleanExcerpt = stripHtml(data.excerpt || rawIntro || "")

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: cleanExcerpt,
    content: rawIntro,
    imageUrl: data.bannerImage || data.thumbnailUrl || data.profileImage || data.imageUrl,
    publishedAt: data.publishedAt || data.interviewDate || data.createdAt,
    views: data.views || 0,
    shares: data.shares || 0,
    readTime: data.readingTime ? `${data.readingTime} min read` : data.readTime || "",
    youtubeUrl: data.videoUrl || data.uploadedVideo || data.youtubeUrl || "",
    category: {
      id: data.categoryId || 999,
      name: "Industry Talks",
      slug: "industry-talks",
    },
    author: {
      id: data.id,
      name: authorName,
      role: fullRole,
      company: companyStr,
      companySlug: rawSlug,
      avatarUrl: data.guestPhoto || data.profileImage || data.author?.avatarUrl,
      bio: cleanBio,
      profileUrl: profileUrl,
    },
    qa: Array.isArray(data.questions)
      ? data.questions
      : typeof data.questions === "string"
        ? JSON.parse(data.questions)
        : data.qa || [],
  }
}

export default function PostDetailsPage() {
  const { slug } = useParams()
  const slugValue = Array.isArray(slug) ? slug[0] : slug

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGate, setShowGate] = useState(false)
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])

  /* ================= CHECK PREMIUM ACCESS ================= */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasAccess = localStorage.getItem("premiumAccess") === "true"
        setHasPremiumAccess(hasAccess)
      } catch (e) {
        setHasPremiumAccess(false)
      }
    }
  }, [])

  /* ================= FETCH POST BY SLUG ================= */
  useEffect(() => {
    async function fetchPost() {
      if (!slugValue) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        let talkRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/industry-talks/slug/${encodeURIComponent(slugValue)}`,
          {
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
          }
        )

        if (!talkRes.ok) {
          talkRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/industry-talks/${encodeURIComponent(slugValue)}`,
            {
              cache: "no-store",
              headers: { "Content-Type": "application/json" },
            }
          )
        }

        if (talkRes.ok) {
          const resJson = await talkRes.json()
          const talkData = resJson.data || resJson
          if (talkData && typeof talkData === "object" && (talkData.id || talkData.title)) {
            setPost(mapTalkToPost(talkData))
            return
          }
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts/slug/${encodeURIComponent(slugValue)}`,
          {
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
          }
        )

        if (res.ok) {
          const data = await res.json()
          if (data && typeof data === "object" && data.id) {
            setPost(mapTalkToPost(data))
            return
          }
        }

        const listRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/industry-talks?limit=100`,
          { cache: "no-store" }
        )

        if (listRes.ok) {
          const listData = await listRes.json()
          const items = Array.isArray(listData?.items)
            ? listData.items
            : Array.isArray(listData?.data)
              ? listData.data
              : Array.isArray(listData)
                ? listData
                : []

          const decodedSlug = decodeURIComponent(slugValue)
          const found = items.find(
            (t: any) =>
              t.slug === slugValue ||
              t.slug === decodedSlug ||
              String(t.id) === slugValue
          )

          if (found) {
            setPost(mapTalkToPost(found))
            return
          }
        }

        throw new Error(`Post with slug "${slugValue}" not found`)
      } catch (err) {
        console.error("Failed to load post:", err)
        setError(err instanceof Error ? err.message : "Failed to load post")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slugValue])

  /* ================= FETCH RELATED INDUSTRY TALKS (same source as admin) ================= */
  useEffect(() => {
    async function fetchRelated() {
      if (!post || post.category?.slug !== "industry-talks") return
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/industry-talks?page=1&limit=5`,
          { cache: "no-store" }
        )
        if (!res.ok) return
        const data = await res.json()
        const rawList: any[] = Array.isArray(data) ? data : data.items || data.data || []
        const list: Post[] = rawList.map((item) => mapTalkToPost(item))
        setRelatedPosts(list.filter((p) => p.id !== post.id).slice(0, 4))
      } catch (err) {
        console.error("Failed to load related interviews:", err)
      }
    }
    fetchRelated()
  }, [post])

  /* ================= CONTENT GATE ================= */
  useEffect(() => {
    // Only show gate if user doesn't have premium access and post is loaded
    if (hasPremiumAccess || !post || loading) return
    const timer = setTimeout(() => setShowGate(true), 9000)
    return () => clearTimeout(timer)
  }, [hasPremiumAccess, post, loading])

  /* ================= HANDLE REGISTRATION SUCCESS ================= */
  const handleRegistrationSuccess = () => {
    // Store premium access in localStorage
    localStorage.setItem("premiumAccess", "true")
    setHasPremiumAccess(true)
    setShowGate(false)
  }

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#003B5C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  /* ================= ERROR STATE ================= */
  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📄</div>
          <h2 className="text-2xl font-bold text-[#003B5C] mb-3">Post Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The post you're looking for doesn't exist or has been removed."}
          </p>
          <a
            href="/"
            className="inline-block bg-[#003B5C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#002d47] transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    )
  }

  const embedUrl = getYoutubeEmbed(post.youtubeUrl)

  const isIndustryTalk = post.category?.slug === "industry-talks"

  const allowYoutube =
    post.category?.slug === "video" || post.category?.slug === "industry-talks"

  const imageUrl = post.imageUrl?.startsWith("http")
    ? post.imageUrl
    : post.imageUrl
      ? `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`
      : "/placeholder.svg"

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "Today"

  /* ================= INDUSTRY TALK LAYOUT ================= */
  if (isIndustryTalk) {
    return (
      <>
        <ContentGateModal
          isOpen={showGate}
          onClose={() => setShowGate(false)}
          onSuccess={handleRegistrationSuccess}
          contentTitle="Industry Talks Content"
        />

        <main className="bg-white overflow-x-hidden">
          {slugValue && <PostViewCounter slug={slugValue} />}

          <section className="max-w-[1320px] mx-auto px-4 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-[8fr_4fr] gap-10">
              {/* CONTENT */}
              <article className="w-full min-w-0">
                {post.category?.name && (
                  <span className="inline-block text-[11px] font-bold tracking-wide uppercase text-[#0F5B78] mb-3">
                    {post.category.name}
                  </span>
                )}

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>

                {post.content ? (
                  <div
                    className="prose prose-sm md:prose-base max-w-none text-gray-600 mb-5 leading-relaxed text-justify [&_p]:mb-3 [&_*]:!text-inherit"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                ) : post.excerpt ? (
                  <p className="text-gray-600 text-base mb-5 leading-relaxed text-justify">{post.excerpt}</p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-gray-100">
                  <div className="flex items-center gap-5 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {date}
                    </span>
                    {post.readTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {post.readTime}
                      </span>
                    )}
                    {typeof post.views === "number" && (
                      <span className="flex items-center gap-1.5">
                        <Eye size={13} />
                        {post.views.toLocaleString()} Views
                      </span>
                    )}
                  </div>
                  <div className="[&>*]:!border-0 [&>*]:!mt-0 [&>*]:!pt-0 [&>*]:flex [&>*]:items-center [&>*]:gap-2 shrink-0">
                    <ShareSection post={post} />
                  </div>
                </div>

                {allowYoutube && post.youtubeUrl ? (
                  <div className="mb-8">
                    <h3 className="text-xs font-bold tracking-wide uppercase text-gray-500 mb-3">
                      Watch the Interview
                    </h3>
                    {embedUrl ? (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <iframe
                          src={embedUrl}
                          title={post.title}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="w-full rounded-xl border border-gray-800 bg-black text-white flex flex-col items-center justify-center py-16 px-6 text-center">
                        <p className="text-lg font-semibold mb-4">Watch on YouTube</p>
                        <a
                          href={post.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#B30F24] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-colors"
                        >
                          Open YouTube →
                        </a>
                      </div>
                    )}
                    {post.videoCaption && (
                      <p className="text-sm text-gray-600 leading-relaxed mt-4 text-justify">
                        {post.videoCaption}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden border border-gray-100 mb-8">
                    <Image
                      src={imageUrl}
                      alt={post.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 900px"
                      priority
                    />
                  </div>
                )}

                <div className="border-t border-gray-200 pt-8 mt-8">
                  <div className="flex items-center gap-2.5 mb-8">
                    <span className="w-1.5 h-6 bg-[#0F5B78] rounded-full" />
                    <h2 className="text-sm font-extrabold tracking-wider uppercase text-gray-900">
                      INTERVIEW TRANSCRIPT
                    </h2>
                  </div>

                  {post.qa && post.qa.length > 0 ? (
                    <div className="space-y-6">
                      {post.qa.map((item, idx) => {
                        const cleanedAnswer = stripHtml(item.answer || "") !== item.answer
                          ? (item.answer || "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ")
                          : item.answer || ""

                        return (
                          <div
                            key={idx}
                            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4"
                          >
                            {/* QUESTION HEADER */}
                            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                              <h3 className="text-base md:text-lg font-bold text-[#0F5B78] leading-snug text-left flex-1">
                                Q{idx + 1}. {item.question}
                              </h3>
                              {item.videoTimestamp && (
                                <span className="shrink-0 text-xs font-semibold text-[#0F5B78] bg-[#0F5B78]/10 px-2.5 py-1 rounded-full border border-[#0F5B78]/20 flex items-center gap-1 whitespace-nowrap">
                                  ⏱ {item.videoTimestamp}
                                </span>
                              )}
                            </div>

                            {/* ANSWER BODY DIRECTLY IN SAME DIV */}
                            <div className="text-gray-700 text-sm md:text-base leading-relaxed text-left space-y-2">
                              <div className="text-sm font-bold text-gray-900 text-left flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#0F5B78] shrink-0" />
                                <span>{post.author?.name ? `${post.author.name}:` : "Answer:"}</span>
                              </div>

                              <div
                                className="text-gray-700 text-left leading-relaxed text-sm md:text-base [&_p]:!text-left [&_p]:!leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:text-gray-900"
                                dangerouslySetInnerHTML={{ __html: cleanedAnswer }}
                              />

                              {item.highlightQuote && (
                                <blockquote className="mt-3 p-4 bg-[#0F5B78]/5 border-l-4 border-[#0F5B78] rounded-r-xl text-sm italic text-gray-800 font-medium text-left">
                                  "{item.highlightQuote}"
                                </blockquote>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div
                      className="prose prose-lg max-w-none break-words text-left prose-p:text-left prose-headings:text-[#0F5B78] prose-h3:text-base prose-h3:font-bold prose-h3:mb-2 prose-h3:mt-6 prose-strong:text-gray-900 prose-a:text-[#0F5B78] prose-img:rounded-xl prose-p:text-gray-700 [&_*]:!bg-transparent [&_*]:!text-inherit [&_strong]:!text-gray-900 [&_a]:!text-[#0F5B78]"
                      dangerouslySetInnerHTML={{ __html: post.content || "" }}
                    />
                  )}
                </div>
              </article>

              {/* SIDEBAR */}
              <div className="w-full overflow-hidden">
                <div className="lg:sticky lg:top-6 space-y-6">
                  {/* ABOUT THE GUEST */}
                  {post.author && (
                    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
                      <h3 className="text-xs font-extrabold tracking-wider uppercase text-gray-900 mb-6">
                        ABOUT THE GUEST
                      </h3>

                      <div className="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                        <Image
                          src={post.author.avatarUrl || "/avatar-placeholder.png"}
                          alt={post.author.name}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </div>

                      <h4 className="text-base font-bold text-gray-900 text-center mb-1">
                        {post.author.name}
                      </h4>

                      {(post.author.role || post.author.company) && (
                        <p className="text-xs font-medium text-gray-500 text-center mb-4">
                          {post.author.role}
                          {post.author.role &&
                            post.author.company &&
                            !post.author.role.includes(post.author.company)
                            ? `, ${post.author.company}`
                            : ""}
                        </p>
                      )}

                      {post.author.bio && (
                        <p className="text-sm text-gray-600 leading-relaxed mb-6 text-left line-clamp-6">
                          {post.author.bio}
                        </p>
                      )}

                      <a
                        href={post.author.profileUrl || (post.author.companySlug ? `/suppliers/${post.author.companySlug}` : "/suppliers")}
                        className="inline-flex items-center justify-center gap-2 w-full bg-[#0F5B78] hover:bg-[#0A4359] text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors shadow-xs"
                      >
                        View Company Profile →
                      </a>
                    </div>
                  )}

                  {/* RELATED INTERVIEWS */}
                  {relatedPosts.length > 0 && (
                    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
                      <h3 className="text-xs font-extrabold tracking-wider uppercase text-gray-900 mb-5">
                        RELATED INTERVIEWS
                      </h3>
                      <div className="space-y-4">
                        {relatedPosts.map((rp) => {
                          const rpImage = rp.imageUrl?.startsWith("http")
                            ? rp.imageUrl
                            : rp.imageUrl
                              ? `${process.env.NEXT_PUBLIC_API_URL}${rp.imageUrl}`
                              : "/placeholder.svg"
                          const rpDate = rp.publishedAt
                            ? new Date(rp.publishedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                            : ""
                          return (
                            <a
                              key={rp.id}
                              href={`/industry-talks/${rp.slug}`}
                              className="flex items-start gap-3.5 group"
                            >
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                                <Image
                                  src={rp.author?.avatarUrl || rpImage}
                                  alt={rp.title}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#0F5B78] transition-colors">
                                  {rp.title}
                                </p>
                                {rp.author?.name && (
                                  <p className="text-xs font-gray-500 mt-1 font-medium">{rp.author.name}</p>
                                )}
                                {rpDate && (
                                  <p className="text-[11px] text-gray-400 mt-0.5">{rpDate}</p>
                                )}
                              </div>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* NEWSLETTER */}
                  <div className="bg-[#0F5B78]/5 border border-[#0F5B78]/10 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">
                      Stay Updated with Industry Insights
                    </h3>
                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                      Subscribe to our newsletter and never miss an update from the manufacturing world.
                    </p>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#0F5B78]"
                    />
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 bg-[#0F5B78] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-colors"
                    >
                      <Mail size={14} />
                      Subscribe
                    </button>
                  </div>

                  <Banner placement="INDUSTRY_TALKS_RIGHT" />
                  <SupplierAds />
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    )
  }

  /* ================= DEFAULT LAYOUT ================= */
  return (
    <>
      <ContentGateModal
        isOpen={showGate}
        onClose={() => setShowGate(false)}
        onSuccess={handleRegistrationSuccess}
        contentTitle={post.category?.name || "premium content"}
      />

      <main className="bg-[#f9f9f9] overflow-x-hidden">
        {slugValue && <PostViewCounter slug={slugValue} />}

        <section className="bg-white border-b border-gray-200">
          <div className="max-w-[1320px] mx-auto px-4 py-10">
            {post.category?.name && (
              <span className="inline-block text-[11px] font-semibold tracking-wide uppercase text-[#003049] bg-[#003049]/5 px-3 py-1 rounded-full mb-4">
                {post.category.name}
              </span>
            )}

            <p className="text-gray-500 text-sm mb-3">Published {date}</p>

            <h1 className="text-3xl md:text-4xl font-bold text-[#003049] mb-4 leading-tight max-w-4xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-gray-600 text-lg max-w-3xl mb-8 leading-relaxed text-justify">{post.excerpt}</p>
            )}

            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
            </div>

            {post.author && (
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                <div className="relative w-11 h-11 shrink-0">
                  <Image
                    src={post.author.avatarUrl || "/avatar-placeholder.png"}
                    alt={post.author.name}
                    fill
                    className="rounded-full border border-gray-200 object-cover"
                    sizes="44px"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#003049]">{post.author.name}</p>
                  {post.author.bio && (
                    <p className="text-xs text-gray-500 mt-0.5 text-justify">{post.author.bio}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="max-w-[1320px] mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[8fr_4fr] gap-10">
            <article className="w-full min-w-0">
              <div
                className="prose prose-lg max-w-none break-words overflow-hidden text-justify prose-p:text-justify prose-headings:text-[#003049] prose-a:text-[#003049] prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
              />

              <div className="mt-10 pt-6 border-t border-gray-100">
                <ShareSection post={post} />
              </div>

              {allowYoutube && post.youtubeUrl && (
                <div className="mt-12">
                  {embedUrl ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <iframe
                        src={embedUrl}
                        title={post.title}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="w-full rounded-xl border border-gray-800 bg-black text-white flex flex-col items-center justify-center py-16 px-6 text-center">
                      <p className="text-lg font-semibold mb-4">Watch on YouTube</p>
                      <a
                        href={post.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      >
                        Open YouTube →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </article>

            <div className="w-full overflow-hidden">
              <div className="lg:sticky lg:top-6">
                <SupplierAds />
              </div>
            </div>
          </div>
        </section>

        <RelatedPostsCarousel />
      </main>
    </>
  )
}
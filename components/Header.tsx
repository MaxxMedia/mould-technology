"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import type { Post } from "@/types/Post"
import { ARTICLE_TOPICS as TOPICS, RESOURCE_TOPICS as RESOURCES } from "@/lib/topic"

/* ================= TYPES ================= */
type MegaType = "topics" | "resources" | null

type User = {
  companyName: string
  id: number
  email: string
  role: "admin" | "recruiter" | "candidate"
  avatarUrl?: string
  username?: string
}



export default function Header() {
  const [openMega, setOpenMega] = useState<MegaType>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [openUserMenu, setOpenUserMenu] = useState(false)

  const [events, setEvents] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])

  const [postsCache, setPostsCache] = useState<Record<string, Post[]>>({})
  const [postsLoading, setPostsLoading] = useState(false)

  const [activeSlug, setActiveSlug] = useState("machine") // 👈 updated
  const [showHighlight, setShowHighlight] = useState(true)

  const container = "max-w-[1320px] mx-auto px-4 md:px-6 lg:px-[15px]"

  // ✅ CHANGED: one generic slider ref/handler shared by events, suppliers, and articles
  const contentScrollRef = useRef<HTMLDivElement>(null)

  function scrollContent(direction: "left" | "right") {
    const el = contentScrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.9
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" })
  }

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem("user")
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        setUser(null)
      }
    }

    loadUser()
    window.addEventListener("userChanged", loadUser)

    return () => {
      window.removeEventListener("userChanged", loadUser)
    }
  }, [])

  async function fetchPostsForSlug(slug: string) {
    if (["events", "suppliers"].includes(slug)) return
    if (postsCache[slug]) return

    setPostsLoading(true)
    try {
      // ✅ FIXED: limit=4 -> limit=6
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts?category=${encodeURIComponent(slug)}&limit=6`
      )
      const data = await res.json()
      const posts: Post[] = Array.isArray(data?.data) ? data.data : []
      setPostsCache(prev => ({ ...prev, [slug]: posts }))
    } catch (err) {
      console.error("Posts fetch error for slug:", slug, err)
      setPostsCache(prev => ({ ...prev, [slug]: [] }))
    } finally {
      setPostsLoading(false)
    }
  }

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`)
      .then(res => res.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : [])
      })
      .catch(err => console.error("Events fetch error:", err))
  }, [])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers?limit=6`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSuppliers(data)
        } else {
          setSuppliers(data.data ?? [])
        }
      })
      .catch(err => console.error("Suppliers fetch error:", err))
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset"
  }, [isMenuOpen])

  // ✅ ADDED: snap the slider back to the start whenever the topic/category changes
  useEffect(() => {
    contentScrollRef.current?.scrollTo({ left: 0 })
  }, [activeSlug, openMega])

  const slugOf = (post: Post) =>
    typeof post.category === "object"
      ? post.category?.slug?.toLowerCase()
      : ""

  const activePosts = postsCache[activeSlug] ?? []

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.dispatchEvent(new Event("userChanged"))
    window.location.href = "/login"
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowHighlight(false)
      } else {
        setShowHighlight(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* ✅ ADDED: hides the scrollbar on the suppliers slider (webkit) */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ================= TOP BAR ================= */}
      <div className="flex h-[90px] w-full">

        <div className="bg-white flex items-center px-[45px] shrink-0 border-r border-gray-200">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/tooling new34 (1).png"
              alt="Tooling Technology Logo"
              width={300}
              height={127}
              priority
              className="h-[75px] w-auto"
            />
          </Link>
        </div>

        <div className="relative flex-1 bg-[#0F5B78]">

          <div className="absolute left-0 top-0 h-full w-12 bg-[#0F5B78] -translate-x-6 skew-x-[-20deg]" />

          <div className={`${container} h-full flex items-center justify-between relative`}>

            <nav className="hidden lg:flex items-center ml-16 gap-8 text-white font-semibold text-sm tracking-wide uppercase">

              <button
                onMouseEnter={() => {
                  setOpenMega("topics")
                  setActiveSlug("machine") // 👈 updated
                  fetchPostsForSlug("machine") // ✅ load default tab's data immediately
                }}
                className="group relative flex items-center gap-1 uppercase"
              >
                Topics <ChevronDown size={14} />
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#B30F24] transition-all group-hover:w-full" />
              </button>

              <button
                onMouseEnter={() => {
                  setOpenMega("resources")
                  setActiveSlug("webinars")
                  fetchPostsForSlug("webinars") // ✅ load default tab's data immediately
                }}
                className="group relative flex items-center gap-1 uppercase"
              >
                Resources <ChevronDown size={14} />
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#B30F24] transition-all group-hover:w-full" />
              </button>

              <Link href="/magazines" className="group relative">
                Magazine
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#B30F24] transition-all group-hover:w-full" />
              </Link>

              <Link href="/suppliers" className="group relative">
                Directory
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#B30F24] transition-all group-hover:w-full" />
              </Link>

              <Link href="/industry-talks" className="group relative">
                Industry Talks
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#B30F24] transition-all group-hover:w-full" />
              </Link>

              <Link href="/events" className="group relative">
                Events
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#B30F24] transition-all group-hover:w-full" />
              </Link>

              <Link href="/feed" className="group relative">
                Jobs
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#B30F24] transition-all group-hover:w-full" />
              </Link>

            </nav>

            <div className="flex items-center gap-3 relative">

              {!user && (
                <Link
                  href="/login"
                  className="hidden md:flex h-10 px-5 bg-[#B30F24] text-white rounded-md font-semibold items-center hover:bg-[#C41524] transition-colors shadow-md"
                >
                  Login
                </Link>
              )}

              {user && (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setOpenUserMenu(!openUserMenu)}
                    className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-md text-white hover:bg-white/20 transition border border-white/20"
                  >
                    <div className="relative w-8 h-8">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt="User avatar"
                          fill
                          className="rounded-full object-cover border-2 border-white/30"
                          sizes="32px"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white/30">
                          {user.email
                            .split("@")[0]
                            .replace(/[^a-zA-Z]/g, "")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-semibold">
                        {user.companyName || user.email.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-300 uppercase">
                        {user.role === "recruiter"
                          ? "COMPANY"
                          : user.role === "candidate"
                            ? "CANDIDATE"
                            : "ADMIN"}
                      </p>
                    </div>

                    <ChevronDown size={14} />
                  </button>

                  {openUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenUserMenu(false)}
                      />

                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-2xl border border-gray-200 text-black z-50 overflow-hidden">
                        <Link
                          href={
                            user.role === "admin"
                              ? "/admin/dashboard"
                              : user.role === "recruiter"
                                ? "/recruiter/dashboard"
                                : `/candidate/${user.username || user.email?.split("@")[0] || "gopinath2322002"}`
                          }
                          className="block px-4 py-3 hover:bg-gray-100 text-sm transition border-b font-semibold text-[#0a66c2]"
                          onClick={() => setOpenUserMenu(false)}
                        >
                          {user.role === "candidate" ? "My Candidate Profile" : "Dashboard"}
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden h-10 w-10 border border-white/30 rounded-md flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

            </div>

          </div>
        </div>

      </div>

      {showHighlight && !openMega && (
        <div className="relative w-full h-7">

          <div className="absolute left-0 top-0 h-6 bg-[#B30F24] flex items-center px-6 pr-12">

            <span className="text-white text-xs sm:text-sm font-semibold whitespace-nowrap">
              Driving Manufacturing Excellence
            </span>

            <div className="absolute right-[-20px] top-0 h-6 w-10 bg-[#B30F24] skew-x-[-20deg]" />
          </div>

        </div>
      )}

      {openMega && (
        <div
          onMouseLeave={() => setOpenMega(null)}
          className="hidden lg:block bg-[#0F5B78] border-t border-white/10 relative z-20"
        >
          <div className={`${container} py-10 grid grid-cols-[260px_1fr] gap-10 items-stretch`}>

            <aside className="bg-[#083A54] rounded-lg overflow-hidden shadow-xl h-full">
              {(openMega === "topics" ? TOPICS : RESOURCES).map(item => (
                <button
                  key={item.slug}
                  onMouseEnter={() => {
                    setActiveSlug(item.slug)
                    fetchPostsForSlug(item.slug)
                  }}
                  className={`w-full px-5 py-4 text-left  font-medium transition-colors ${activeSlug === item.slug
                    ? "bg-[#062E45] text-white"
                    : "text-white hover:bg-[#0F5D86]"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </aside>

            {/* ✅ CHANGED: one unified horizontal slider for events, suppliers,
                and articles — same row-of-6 layout for every nav item, with
                the prev/next arrows anchored to the top-right corner */}
            <div className="relative h-full">

              <div className="flex items-center justify-end gap-3 mb-3">
                <button
                  onClick={() => scrollContent("left")}
                  aria-label="Scroll left"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={() => scrollContent("right")}
                  aria-label="Scroll right"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <ChevronRight size={22} />
                </button>
              </div>

              <div
                ref={contentScrollRef}
                className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: "none" }}
              >

                {openMega === "resources" && activeSlug === "events" ? (

                  events.length === 0 ? (
                    <p className="text-white">No upcoming events available.</p>
                  ) : (
                    events.slice(0, 6).map(event => (
                      <div
                        key={event.id}
                        className="text-white flex flex-col shrink-0 snap-start"
                        style={{ width: "calc((100% - 5 * 1.5rem) / 6)", minWidth: "160px" }}
                      >
                        <Link href={`/events/${event.slug}`} className="block">
                          <div className="relative w-full h-40 mb-3 bg-white rounded overflow-hidden">
                            {event.logoUrl ? (
                              <Image
                                src={event.logoUrl}
                                alt={event.title}
                                fill
                                className="object-contain p-2"
                                sizes="200px"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                        </Link>

                        <p className="text-xs text-gray-300 mb-1">
                          {new Date(event.startDate).toLocaleDateString()} &ndash;{" "}
                          {new Date(event.endDate).toLocaleDateString()}
                        </p>

                        <h4 className="text-sm font-semibold hover:text-[#B30F24] line-clamp-2">
                          <Link href={`/events/${event.slug}`}>{event.title}</Link>
                        </h4>

                        {event.location && (
                          <p className="text-xs text-gray-400 mt-1">📍 {event.location}</p>
                        )}
                      </div>
                    ))
                  )

                ) : openMega === "resources" && activeSlug === "suppliers" ? (

                  // ⏸ package filter removed for now — showing all suppliers.
                  // add back later: suppliers.filter((s: any) => s.package && s.package !== "free")
                  suppliers.length === 0 ? (
                    <p className="text-white">No suppliers available.</p>
                  ) : (
                    suppliers
                      .slice(0, 6)
                      .map(supplier => (
                        <div
                          key={supplier.id}
                          className="text-white flex flex-col shrink-0 snap-start"
                          style={{ width: "calc((100% - 5 * 1.5rem) / 6)", minWidth: "160px" }}
                        >
                          <Link href={`/suppliers/${supplier.slug}`} className="block">
                            <div className="relative w-full h-40 mb-3 bg-white rounded overflow-hidden">
                              {supplier.logoUrl ? (
                                <Image
                                  src={supplier.logoUrl}
                                  alt={supplier.name}
                                  fill
                                  className="object-contain p-2"
                                  sizes="200px"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                          </Link>

                          <h4 className="text-sm font-semibold hover:text-[#B30F24] line-clamp-2">
                            <Link href={`/suppliers/${supplier.slug}`}>{supplier.name}</Link>
                          </h4>

                          <p className="text-xs text-gray-300 mt-2 line-clamp-2">{supplier.description}</p>
                        </div>
                      ))
                  )

                ) : (

                  postsLoading ? (
                    <div className="w-full flex items-center justify-center py-10">
                      <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : activePosts.length === 0 ? (
                    <p className="text-white/60 text-sm">No articles found for this topic.</p>
                  ) : (
                    activePosts.slice(0, 6).map(post => (
                      <article
                        key={post.id}
                        className="shrink-0 snap-start"
                        style={{ width: "calc((100% - 5 * 1.5rem) / 6)", minWidth: "160px" }}
                      >
                        <Link
                          href={
                            activeSlug === "webinars"
                              ? `/Webinar/${post.slug}`
                              : `/post/${post.slug}`
                          }
                        >
                          <div className="relative w-full h-40 mb-3">
                            <Image
                              src={post.imageUrl || "/placeholder.svg"}
                              alt={post.title}
                              fill
                              className="object-cover rounded hover:opacity-90 transition-opacity"
                            />
                          </div>
                        </Link>

                        <h5 className="text-[10px] uppercase text-red-500 font-bold tracking-wide mb-1">
                          {post.badge}
                        </h5>

                        <h4 className="text-sm font-semibold text-white leading-snug hover:text-[#B30F24]">
                          <Link
                            href={
                              activeSlug === "webinars"
                                ? `/Webinar/${post.slug}`
                                : `/post/${post.slug}`
                            }
                          >
                            {post.title}
                          </Link>
                        </h4>

                        <p className="text-xs text-gray-300 mt-2 leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      </article>
                    ))
                  )

                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          <div className="fixed top-[90px] left-0 right-0 bottom-0 bg-[#0F5B78] lg:hidden z-50 overflow-y-auto">
            <nav className="py-4 text-white font-semibold">

              <Link href="/magazines" className="block px-6 py-4 border-b border-white/10 hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Magazine</Link>
              <Link href="/suppliers" className="block px-6 py-4 border-b border-white/10 hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Directory</Link>
              <Link href="/mmtchats" className="block px-6 py-4 border-b border-white/10 hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Industry Talks</Link>
              <Link href="/events" className="block px-6 py-4 border-b border-white/10 hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Events</Link>
              <Link href="/feed" className="block px-6 py-4 border-b border-white/10 hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Jobs</Link>

              {!user && (
                <div className="px-6 py-5">
                  <Link
                    href="/login"
                    className="block w-full py-3 bg-[#B30F24] text-white rounded-md text-center font-semibold hover:bg-[#C41524]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              )}

            </nav>
          </div>
        </>
      )}

    </header>
  )
}
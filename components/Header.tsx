"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import type { Post } from "@/types/Post"

/* ================= TYPES ================= */
type MegaType = "topics" | "resources" | null

type User = {
  id: number
  email: string
  role: "admin" | "recruiter" | "candidate"
  avatarUrl?: string
}

/* ================= MENUS ================= */
const TOPICS = [
  { label: "Machining", slug: "machining" },
  { label: "Cutting Tools ", slug: "cuttingtools" },
  { label: "Surface Engineering", slug: "surfaceengineering" },
  { label: "Smart Manufacturing", slug: "smartmanufacturing" },
  { label: "Advanced Manufacturing", slug: "advancedmanufacturing" },
  { label: "Maintenance & Operations", slug: "maintenance&operations" },
]

const RESOURCES = [
  { label: "Webinars", slug: "webinars" },
  { label: "Videos", slug: "video" },
  { label: "Events", slug: "events" },
  { label: "Suppliers", slug: "suppliers" },
  // { label: "Basics", slug: "basics" },
  { label: "ToolingDesign & Optimization", slug: "molddesign&optimization" },
]

export default function Header() {
  const [openMega, setOpenMega] = useState<MegaType>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [openUserMenu, setOpenUserMenu] = useState(false)

  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  

  const [activeSlug, setActiveSlug] = useState("machining")
  const [showHighlight, setShowHighlight] = useState(true)

  const container = "max-w-[1320px] mx-auto px-4 md:px-6 lg:px-[15px]"

  /* ================= INIT ================= */
  useEffect(() => {
  const loadUser = () => {
    const stored = localStorage.getItem("user")
    if (stored) {
      setUser(JSON.parse(stored))
    } else {
      setUser(null)
    }
  }

  // Load initially
  loadUser()

  // Listen for login/logout changes
  window.addEventListener("userChanged", loadUser)

  return () => {
    window.removeEventListener("userChanged", loadUser)
  }
}, [])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`)
      .then(res => res.json())
      .then(data => {
        const posts = Array.isArray(data?.data) ? data.data : []
        setAllPosts(posts)
      })
  }, [])

  useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`)
    .then(res => res.json())
    .then(data => {
      setEvents(Array.isArray(data) ? data : [])
    })
    .catch(err => console.error("Events fetch error:", err))
}, [])

useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers?limit=4`)
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

  const slugOf = (post: Post) =>
    typeof post.category === "object"
      ? post.category?.slug?.toLowerCase()
      : ""

  const filteredPosts = allPosts
    .filter(p => slugOf(p).includes(activeSlug))
    .slice(0, 4)

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
      // 🔥 Notify header
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

      {/* ================= TOP BAR ================= */}
      <div className="flex h-[90px] w-full">

        {/* LEFT WHITE LOGO SECTION */}
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

    {/* RIGHT BLUE NAV SECTION */}
<div className="relative flex-1 bg-[#0F5B78]">

  {/* Slanted Left Edge */}
  <div className="absolute left-0 top-0 h-full w-12 bg-[#0F5B78] -translate-x-6 skew-x-[-20deg]" />

  <div className={`${container} h-full flex items-center justify-between relative`}>

    {/* DESKTOP NAV */}
    <nav className="hidden lg:flex items-center ml-16 gap-8 text-white font-semibold text-sm tracking-wide">

      <button
        onMouseEnter={() => {
          setOpenMega("topics")
          setActiveSlug("machining")
        }}
        className="group relative flex items-center gap-1"
      >
        Topics <ChevronDown size={14} />
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
      </button>

      <button
        onMouseEnter={() => {
          setOpenMega("resources")
          setActiveSlug("webinars")
        }}
        className="group relative flex items-center gap-1"
      >
        Resources <ChevronDown size={14} />
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
      </button>

      <Link href="/magazines" className="group relative">
        Magazine
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
      </Link>

      <Link href="/suppliers" className="group relative">
        Directory
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
      </Link>

      <Link href="/industry-talks" className="group relative">
        Industry Talks
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
      </Link>

      <Link href="/events" className="group relative">
        Events
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
      </Link>

      <Link href="/feed" className="group relative">
        Jobs
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
      </Link>

    </nav>

    {/* RIGHT SIDE */}
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
              <p className="text-sm font-semibold leading-tight">
                {user.email.split("@")[0]}
              </p>
              <p className="text-xs text-gray-300 capitalize">
                {user.role}
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
                      : "/candidate/feed"
                  }
                  className="block px-4 py-3 hover:bg-gray-100 text-sm transition border-b"
                  onClick={() => setOpenUserMenu(false)}
                >
                  Dashboard
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

      {/* MOBILE BUTTON */}
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
{/* ================= RED HIGHLIGHT STRIP ================= */}
{showHighlight && !openMega && (
  <div className="relative w-full h-7">

    {/* RED STRIP */}
    <div className="absolute left-0 top-0 h-6 bg-[#B30F24] flex items-center px-6 pr-12">

      <span className="text-white text-xs sm:text-sm font-semibold whitespace-nowrap">
        Driving Manufacturing Excellence
      </span>

      {/* RIGHT SLANT */}
      <div className="absolute right-[-20px] top-0 h-6 w-10 bg-[#B30F24] skew-x-[-20deg]" />
    </div>

  </div>
)}

{/* Screen	Width
Mobile	80%
Small	60%
Medium	45%
Large	28%
XL	22% */}

      {/* ================= DESKTOP MEGA MENU ================= */}
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
                  onMouseEnter={() => setActiveSlug(item.slug)}
                  className={`w-full px-5 py-4 text-left  font-medium transition-colors ${
                    activeSlug === item.slug
                      ? "bg-[#062E45] text-white"
                      : "text-white hover:bg-[#0F5D86]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </aside>

           <div className="grid grid-cols-4 gap-6 h-full content-start">

{openMega === "resources" && activeSlug === "events" ? (

  events.length === 0 ? (
    <p className="text-white col-span-4">
      No upcoming events available.
    </p>
  ) : (
    events.slice(0, 4).map(event => (
      <div key={event.id} className="text-white">

        <Link href={`/events/${event.slug}`}>
          <div className="bg-white rounded p-4 mb-3">
            {event.logoUrl ? (
              <Image
                src={event.logoUrl}
                alt={event.title}
                width={200}
                height={120}
                className="object-contain mx-auto"
              />
            ) : (
              <div className="h-24 bg-gray-100 flex items-center justify-center text-black">
                No Image
              </div>
            )}
          </div>
        </Link>

        <p className="text-xs text-gray-300 mb-1">
          {new Date(event.startDate).toLocaleDateString()} –{" "}
          {new Date(event.endDate).toLocaleDateString()}
        </p>

        <h4 className="text-sm font-semibold hover:text-[#B30F24]">
          <Link href={`/events/${event.slug}`}>
            {event.title}
          </Link>
        </h4>

        {event.location && (
          <p className="text-xs text-gray-400 mt-1">
            📍 {event.location}
          </p>
        )}

      </div>
    ))
  )

) : openMega === "resources" && activeSlug === "suppliers" ? (

  suppliers.length === 0 ? (
    <p className="text-white col-span-4">
      No suppliers available.
    </p>
  ) : (
    suppliers.slice(0, 4).map(supplier => (
      <div key={supplier.id} className="text-white">

        <Link href={`/suppliers/${supplier.slug}`}>
          <div className="bg-white rounded p-4 mb-3">
            {supplier.logoUrl ? (
              <Image
                src={supplier.logoUrl}
                alt={supplier.name}
                width={200}
                height={120}
                className="object-contain mx-auto"
              />
            ) : (
              <div className="h-24 bg-gray-100 flex items-center justify-center text-black">
                No Image
              </div>
            )}
          </div>
        </Link>

        <h4 className="text-sm font-semibold hover:text-[#B30F24]">
          <Link href={`/suppliers/${supplier.slug}`}>
            {supplier.name}
          </Link>
        </h4>

        <p className="text-xs text-gray-300 mt-2 line-clamp-2">
          {supplier.description}
        </p>

      </div>
    ))
  )

) : (

  filteredPosts.map(post => (
    <article key={post.id}>
      <Link href={`/post/${post.slug}`}>
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
        <Link href={`/post/${post.slug}`}>
          {post.title}
        </Link>
      </h4>

      <p className="text-xs text-gray-300 mt-2 leading-relaxed line-clamp-2">
        {post.excerpt}
      </p>
    </article>
  ))

)}

</div>

          </div>
        </div>
      )}

      {/* ================= MOBILE MENU ================= */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          <div className="fixed top-[90px] left-0 right-0 bottom-0 bg-[#0F5B78] lg:hidden z-50 overflow-y-auto">
            <nav className="py-4 text-white font-semibold">

              <Link href="/articles" className="block px-6 py-4 border-b border-white/10 hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Magazine</Link>
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

// app/admin/layout.tsx
"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  FileText,
  Folder,
  LogOut,
  Mail,
  Users,
  UserPlus,
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [articlesOpen, setArticlesOpen] = useState(
    pathname.startsWith("/admin/posts") ||
    pathname.startsWith("/admin/articles")
  )

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAllowed(true)
      setChecking(false)
      return
    }

    const token = localStorage.getItem("token")
    const userRaw = localStorage.getItem("user")

    if (!token || !userRaw) {
      router.replace("/admin/login")
      return
    }

    if (!token || !userRaw || userRaw === "undefined") {
      localStorage.clear()
      router.replace("/admin/login")
      return
    }

    let user = null

    try {
      user = JSON.parse(userRaw)
    } catch {
      console.error("Invalid admin JSON")
      localStorage.clear()
      router.replace("/admin/login")
      return
    }

    if (user?.role !== "admin") {
      router.replace("/unauthorized")
      return
    }

    setAllowed(true)
    setChecking(false)
  }, [pathname, router])

  if (checking) return null

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex bg-[#F4F6FA]">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#0F5B78] text-white flex flex-col shadow-xl">
        {/* BRAND */}
        <div className="px-6 py-5 border-b border-white/20">
          <h1 className="text-lg font-semibold tracking-wide">
            Admin Panel
          </h1>
          <p className="text-xs text-white/70 mt-1">
            Tooling Trends
          </p>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <SidebarLink
            href="/admin/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard size={18} />}
            active={pathname === "/admin/dashboard"}
          />

          {/* ================= TECH ARTICLES DROPDOWN ================= */}
          <div>
            <button
              onClick={() => setArticlesOpen(!articlesOpen)}
              className={`flex items-center justify-between w-full px-4 py-2.5 rounded-md text-sm font-medium transition-all
                ${pathname.startsWith("/admin/posts") ||
                  pathname.startsWith("/admin/articles")
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Folder size={18} />
                <span>Tech Articles</span>
              </div>
              <span className="text-xs">
                {articlesOpen ? "▾" : "▸"}
              </span>
            </button>

            {articlesOpen && (
              <div className="ml-6 mt-1 space-y-1">
                <SidebarLink
                  href="/admin/posts"
                  label="All Posts"
                  icon={<FileText size={16} />}
                  active={pathname === "/admin/posts"}
                />

                <SidebarLink
                  href="/admin/articles"
                  label="Article Moderation"
                  icon={<Folder size={16} />}
                  active={pathname === "/admin/articles"}
                />
              </div>
            )}
          </div>

          <SidebarLink
            href="/admin/packages"
            label="Packages"
            icon={<Folder size={18} />}
            active={pathname === "/admin/packages"}
          />

          <SidebarLink
            href="/admin/banners"
            label="Banners"
            icon={<Folder size={18} />}
            active={pathname === "/admin/banners"}
          />

          <SidebarLink
            href="/admin/events"
            label="Events"
            icon={<Folder size={18} />}
            active={pathname === "/admin/events"}
          />

          {/* ✅ LEADS Menu Item */}
          <SidebarLink
            href="/admin/leads"
            label="Leads"
            icon={<Users size={18} />}
            active={pathname === "/admin/leads" || pathname.startsWith("/admin/leads/")}
          />

          {/* ✅ CONTACT Menu Item */}
          <SidebarLink
            href="/admin/contact"
            label="Contact"
            icon={<Mail size={18} />}
            active={pathname === "/admin/contact" || pathname.startsWith("/admin/contact/")}
          />

          <SidebarLink
            href="/admin/jobs"
            label="Jobs"
            icon={<Folder size={18} />}
            active={pathname === "/admin/jobs"}
          />

          <SidebarLink
            href="/admin/directories"
            label="Supplier Listing"
            icon={<Folder size={18} />}
            active={pathname === "/admin/directories"}
          />

          <SidebarLink
            href="/admin/magazines"
            label="Magazine"
            icon={<Folder size={18} />}
            active={pathname === "/admin/magazines"}
          />

          <SidebarLink
            href="/admin/industry-talks"
            label="Industry Talks"
            icon={<Folder size={18} />}
            active={pathname === "/admin/mmt-chats"}
          />

          <SidebarLink
            href="/admin/newsletter"
            label="Newsletter"
            icon={<Mail size={18} />}
            active={pathname.startsWith("/admin/newsletter")}
          />
        </nav>

        {/* FOOTER */}
        <div className="px-5 py-4 border-t border-white/20">
          <button
            onClick={() => {
              localStorage.removeItem("token")
              localStorage.removeItem("user")
              router.push("/admin/login")
            }}
            className="flex items-center gap-3 text-sm font-medium text-white/90 hover:text-red-300 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

/* ================= SIDEBAR LINK ================= */

function SidebarLink({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all
        ${active
          ? "bg-white/20 text-white"
          : "text-white/80 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
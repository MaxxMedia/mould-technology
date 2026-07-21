"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function RecruiterOnboardingPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [headline, setHeadline] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (!user || user.role !== "recruiter") {
      router.push("/login")
    }

    // If already onboarded, skip
    if (user?.isOnboarded && user?.companyId) {
      router.push("/recruiter/dashboard")
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      // 1️⃣ Create company
      // ✅ Server-side, createCompany() now also backfills any PAID
      // PackagePurchase rows that were made before this Company existed
      // and syncs Company.subscriptionPlan from them (see
      // companyController.js). So by the time this request resolves,
      // the correct plan is already sitting on the Company row.
      const companyRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/companies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: companyName,
            website,
            location,
          }),
        }
      )

      const company = await companyRes.json()

      if (!companyRes.ok) {
        setError(company.error || "Failed to create company")
        return
      }

      // 2️⃣ Update recruiter profile (company is already linked on create)
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName,
            headline,
            companyId: company.id,
          }),
        }
      )

      const profileData = await profileRes.json().catch(() => ({}))

      if (!profileRes.ok) {
        setError(profileData.error || "Failed to update recruiter profile")
        return
      }

      // 3️⃣ Refresh user from the server instead of hand-assembling it.
      // ✅ FIX: the old code only patched companyId/isOnboarded/fullName
      // onto the stale cached user, so packageSelected and
      // subscriptionPlan stayed at whatever they were at login time
      // (usually "false" / "free" — before the plan was purchased).
      // Pulling /api/auth/me here guarantees the dashboard sees the
      // real, just-synced plan on its very first render.
      const meRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const cachedUser = JSON.parse(localStorage.getItem("user") || "{}")

      if (meRes.ok) {
        const freshUser = await meRes.json()
        localStorage.setItem(
          "user",
          JSON.stringify({ ...cachedUser, ...freshUser })
        )
      } else {
        // Fallback if /me is unreachable — at least keep what we know
        // locally so the app doesn't break, though the plan may lag
        // until the next refresh triggers RecruiterLayout's own /me call.
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...cachedUser,
            companyId: company.id,
            isOnboarded: true,
            fullName: profileData.fullName || fullName,
          })
        )
      }

      window.dispatchEvent(new Event("userChanged"))

      router.push("/recruiter/dashboard")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center px-4">
      <div className="bg-white max-w-xl w-full rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-2">
          Let’s set up your Company profile
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          This helps candidates trust you and your company
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            required
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-12 px-4 border rounded"
          />

          <input
            placeholder="Your headline (e.g. Senior Recruiter)"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full h-12 px-4 border rounded"
          />

          <hr />

          <input
            required
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full h-12 px-4 border rounded"
          />

          <input
            placeholder="Company website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full h-12 px-4 border rounded"
          />

          <input
            placeholder="Company location "
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-12 px-4 border rounded"
          />

          <button
            disabled={loading}
            className="w-full h-12 bg-[#0073FF] text-white rounded font-medium disabled:opacity-60"
          >
            {loading ? "Setting up..." : "Finish setup"}
          </button>
        </form>
      </div>
    </div>
  )
}
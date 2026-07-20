"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import RecruiterSubscriptionTerms from "@/components/RecruiterSubscriptionTerms"


type Role = "candidate" | "recruiter"

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlRole = searchParams.get("role")

  const allowedRoles = useMemo<Role[]>(() => {
    if (urlRole === "recruiter") return ["recruiter"]
    if (urlRole === "candidate") return ["candidate"]
    return ["candidate", "recruiter"]
  }, [urlRole])

  const [role, setRole] = useState<Role>(allowedRoles[0])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"form" | "otp">("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedRecruiterTerms, setAcceptedRecruiterTerms] = useState(false)


  useEffect(() => {
    setRole(allowedRoles[0])
  }, [allowedRoles])

  useEffect(() => {
    if (role !== "recruiter") {
      setAcceptedRecruiterTerms(false)
    }
  }, [role])

  /* ================= REGISTER ================= */

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (role === "recruiter" && !acceptedRecruiterTerms) {
      setError("Please review and accept the company subscription terms.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Signup failed")
        return
      }

      setStep("otp")
      setSuccess("Verification code sent to your email.")
    } catch {
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  /* ================= VERIFY OTP ================= */

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid OTP")
        return
      }

      // Redirect to packages with from=signup for recruiters
      // Check if user selected recruiter role during signup
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role === "recruiter") {
          router.push("/packages?from=signup")
          return
        }
      }

      router.push("/login?verified=true")
    } catch {
      setError("Verification failed")
    } finally {
      setLoading(false)
    }
  }

  /* ================= RESEND OTP ================= */

  async function handleResendOtp() {
    setError("")
    setSuccess("")

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to resend OTP")
        return
      }

      setSuccess("New verification code sent.")
    } catch {
      setError("Failed to resend OTP")
    }
  }

  return (
    <div className="w-full max-w-md">

      {/* ================= STEP 1 — REGISTER ================= */}
      {step === "form" && (
        <>
          {/* ROLE BADGE */}
          <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-wide text-[#0073FF] bg-blue-50 px-3 py-1 rounded-full">
            {role === "recruiter"
              ? "Employer Registration"
              : "Job Seeker Registration"}
          </span>

          {/* Dynamic Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {role === "recruiter"
              ? "Register Your Company"
              : "Create Your Candidate Account"}
          </h2>

          {/* Dynamic Description */}
          <p className="text-gray-600 mb-8">
            {role === "recruiter"
              ? "Start posting jobs and manage applicants."
              : "Find jobs and apply in minutes."}
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>

            {/* Role Tabs */}
            {allowedRoles.length > 1 && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`flex-1 h-[42px] rounded-md border text-sm font-medium transition ${
                    role === "candidate"
                      ? "bg-[#0073FF] text-white border-[#0073FF]"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Candidate
                </button>

                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={`flex-1 h-[42px] rounded-md border text-sm font-medium transition ${
                    role === "recruiter"
                      ? "bg-[#0073FF] text-white border-[#0073FF]"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Company
                </button>
              </div>
            )}

            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[50px] px-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0073FF]"
            />

            <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full h-[50px] px-4 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0073FF]"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute inset-y-0 right-4 flex items-center text-gray-500"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>

            {role === "recruiter" && (
              <RecruiterSubscriptionTerms
                checked={acceptedRecruiterTerms}
                onCheckedChange={setAcceptedRecruiterTerms}
              />
            )}


            <button
              type="submit"
              disabled={loading || (role === "recruiter" && !acceptedRecruiterTerms)}
              className="w-full h-[52px] bg-[#0073FF] text-white rounded-md font-semibold hover:bg-[#005fe0] transition disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Create Account"}
            </button>
          </form>
        </>
      )}

      {/* ================= STEP 2 — OTP ================= */}
      {step === "otp" && (
        <>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Verify Your Email
          </h2>

          <p className="text-gray-600 mb-6">
            Enter the 6-digit code sent to <b>{email}</b>
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded">
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full h-[50px] px-4 border rounded-md text-center tracking-widest text-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#0073FF] text-white rounded-md font-semibold hover:bg-[#005fe0]"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <button
            onClick={handleResendOtp}
            className="mt-4 text-sm text-[#0073FF] hover:underline"
          >
            Resend OTP
          </button>
        </>
      )}

      {/* Footer */}
      <p className="text-center text-sm mt-6 text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-[#0073FF] font-medium">
          Login
        </Link>
      </p>
    </div>
  )
}

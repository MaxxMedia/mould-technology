"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import UploadBox from "@/components/UploadBox"

type Industry = {
  id: number
  name: string
}

type CompanyProfileLimits = {
  descriptionLimit: number | null
  coverBanner: boolean
  website: boolean
  googleMap: boolean
  whatsapp: boolean
  galleryImages: number | null
  factoryImages: number | null
  productCategories: number | null
  productListings: number | null
  productImages: number | null
  productVideos: number | null
  brochures: boolean
  certifications: boolean
}

export default function EditRecruiterProfile() {
  const router = useRouter()

  const [industries, setIndustries] = useState<Industry[]>([])
  const [profileLimits, setProfileLimits] =
  useState<CompanyProfileLimits | null>(null)

  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    about: "",
    location: "",
    websiteUrl: "",
    avatarUrl: "",

    companyName: "",
    companyTagline: "",
    companyDescription: "",
    companyIndustryId: "",
    companyLocation: "",
    companyAddress: "",
    companySize: "",
    companyWebsite: "",
    companyLogoUrl: "",
    companyCoverImageUrl: "",
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // NEW: field-level validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token")

      console.log("TOKEN:", token)

      const [profileRes, industryRes, limitsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/industries`),

        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/company-profile-eligibility`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ])

      console.log("PROFILE STATUS:", profileRes.status)

      const profile = await profileRes.json()

      console.log("PROFILE DATA:", profile)

      const industryData = await industryRes.json()

      if (limitsRes.ok) {
        const limits = await limitsRes.json()
        setProfileLimits(limits)
      }

      setIndustries(industryData || [])

      setForm({
        fullName: profile.fullName || "",
        headline: profile.headline || "",
        about: profile.about || "",
        location: profile.location || "",
        websiteUrl: profile.websiteUrl || "",
        avatarUrl: profile.avatarUrl || "",

        companyName: profile.Company?.name || "",
        companyTagline: profile.Company?.tagline || "",
        companyDescription: profile.Company?.description || "",
        companyIndustryId: profile.Company?.industryId?.toString() || "",
        companyLocation: profile.Company?.location || "",
        companyAddress: profile.Company?.address || "",
        companySize: profile.Company?.companySize || "",
        companyWebsite: profile.Company?.website || "",
        companyLogoUrl: profile.Company?.logoUrl || "",
        companyCoverImageUrl: profile.Company?.coverImageUrl || "",
      })
    }

    loadData()
  }, [])

  /* ================= HANDLE INPUT ================= */

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target

    if (
      name === "companyDescription" &&
      profileLimits?.descriptionLimit &&
      value.length > profileLimits.descriptionLimit
    ) {
      return
    }

    setForm({
      ...form,
      [name]: value,
    })

    // clear the field's error as soon as the user edits it
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  /* ================= HANDLE IMAGE UPLOAD ================= */

  async function handleImageUpload(file: File, field: string) {
    try {
      if (
        field === "companyCoverImageUrl" &&
        !profileLimits?.coverBanner
      ) {
        alert("Upgrade to Basic or above to upload a Company Cover Banner.");
        return;
      }
      setUploading(true)
      const token = localStorage.getItem("token")

      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error()

      setForm(prev => ({
        ...prev,
        [field]: data.imageUrl,
      }))
    } catch {
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  /* ================= VALIDATION ================= */

  function validateForm() {
    const newErrors: Record<string, string> = {}

    // ---- Recruiter Information ----

    if (!form.fullName.trim())
      newErrors.fullName = "Full name is required."
    else if (form.fullName.trim().length < 3 || form.fullName.trim().length > 60)
      newErrors.fullName = "Full name must be between 3 and 60 characters."

    if (!form.headline.trim())
      newErrors.headline = "Headline is required."
    else if (form.headline.trim().length < 10 || form.headline.trim().length > 120)
      newErrors.headline = "Headline must be between 10 and 120 characters."

    if (!form.about.trim())
      newErrors.about = "About is required."
    else if (form.about.trim().length < 30 || form.about.trim().length > 1000)
      newErrors.about = "About must be between 30 and 1000 characters."

    if (!form.location.trim())
      newErrors.location = "Location is required."

    // ---- Company Information ----
    // Company Logo is optional — availability/requirement is package-based,
    // not enforced client-side as mandatory.

    if (!form.companyName.trim())
      newErrors.companyName = "Company name is required."
    else if (form.companyName.trim().length < 3 || form.companyName.trim().length > 100)
      newErrors.companyName = "Company name must be between 3 and 100 characters."

    if (!form.companyTagline.trim())
      newErrors.companyTagline = "Company tagline is required."
    else if (form.companyTagline.trim().length < 5 || form.companyTagline.trim().length > 120)
      newErrors.companyTagline = "Tagline must be between 5 and 120 characters."

    if (!form.companyDescription.trim()) {
      newErrors.companyDescription = "Description is required."
    } else if (
      profileLimits?.descriptionLimit &&
      form.companyDescription.length > profileLimits.descriptionLimit
    ) {
      newErrors.companyDescription = `Maximum ${profileLimits.descriptionLimit} characters allowed.`
    }

    if (!form.companyIndustryId)
      newErrors.companyIndustryId = "Select an industry."

    if (!form.companyLocation.trim())
      newErrors.companyLocation = "Company location is required."

    if (!form.companyAddress.trim())
      newErrors.companyAddress = "Full address is required."

    if (!form.companySize.trim())
      newErrors.companySize = "Company size is required."

    // ---- URL validations (optional fields) ----

    const urlRegex = /^https?:\/\/.+/i

    if (form.websiteUrl && !urlRegex.test(form.websiteUrl)) {
      newErrors.websiteUrl = "Enter a valid URL (must start with http:// or https://)."
    }

    if (form.companyWebsite && !urlRegex.test(form.companyWebsite)) {
      newErrors.companyWebsite = "Enter a valid URL (must start with http:// or https://)."
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      setError("Please fix the highlighted fields before submitting.")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      )

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to update")
        return
      }

      setSuccess("Profile & Company updated successfully 🎉")

      setTimeout(() => {
        router.push("/recruiter/dashboard")
      }, 1200)
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Edit Profile & Company
        </h1>

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

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* ================= RECRUITER SECTION ================= */}
          <SectionTitle title="Company Owner Information" />

          <UploadBox
            label={uploading ? "Uploading..." : "Profile Avatar"}
            value={form.avatarUrl}
            onUpload={(file) => handleImageUpload(file, "avatarUrl")}
            height="h-40"
            accept="image/*"
          />

          <Input
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />
          <Input
            label="Headline"
            name="headline"
            value={form.headline}
            onChange={handleChange}
            error={errors.headline}
          />
          <Input
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            error={errors.location}
          />
          <Input
            label="Website URL"
            name="websiteUrl"
            value={form.websiteUrl}
            onChange={handleChange}
            error={errors.websiteUrl}
          />

          <Textarea
            label="About"
            name="about"
            value={form.about}
            onChange={handleChange}
            error={errors.about}
          />

          {/* ================= COMPANY SECTION ================= */}
          <SectionTitle title="Company Information" />

          <UploadBox
            label="Company Logo"
            value={form.companyLogoUrl}
            onUpload={(file) => handleImageUpload(file, "companyLogoUrl")}
            height="h-32"
            accept="image/*"
          />

          {profileLimits?.coverBanner ? (
            <UploadBox
              label="Company Cover Image"
              value={form.companyCoverImageUrl}
              onUpload={(file) =>
                handleImageUpload(file, "companyCoverImageUrl")
              }
              height="h-40"
              accept="image/*"
            />
          ) : (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                Company Cover Banner is available on the Basic plan and above.
              </p>
            </div>
          )}

          <Input
            label="Company Name"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            error={errors.companyName}
          />
          <Input
            label="Tagline"
            name="companyTagline"
            value={form.companyTagline}
            onChange={handleChange}
            error={errors.companyTagline}
          />
          <Textarea
            label={`Company Description ${
              profileLimits?.descriptionLimit
                ? `(Max ${profileLimits.descriptionLimit} characters)`
                : ""
            }`}
            name="companyDescription"
            value={form.companyDescription}
            onChange={handleChange}
            maxLength={profileLimits?.descriptionLimit ?? undefined}
            error={errors.companyDescription}
          />
          {profileLimits?.descriptionLimit && (
            <p className="text-xs text-gray-500 mt-1">
              {form.companyDescription.length}/{profileLimits.descriptionLimit}
            </p>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Industry</label>
            <select
              name="companyIndustryId"
              value={form.companyIndustryId}
              onChange={handleChange}
              className={`w-full h-[48px] px-4 mt-1 rounded-md border ${
                errors.companyIndustryId ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Industry</option>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
            {errors.companyIndustryId && (
              <p className="mt-1 text-xs text-red-500">{errors.companyIndustryId}</p>
            )}
          </div>

          <Input
            label="Company Location"
            name="companyLocation"
            value={form.companyLocation}
            onChange={handleChange}
            error={errors.companyLocation}
          />
          <Input
            label="Full Address"
            name="companyAddress"
            value={form.companyAddress}
            onChange={handleChange}
            error={errors.companyAddress}
          />
          <Input
            label="Company Size"
            name="companySize"
            value={form.companySize}
            onChange={handleChange}
            error={errors.companySize}
          />
          <Input
            label="Company Website"
            name="companyWebsite"
            value={form.companyWebsite}
            onChange={handleChange}
            error={errors.companyWebsite}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
      {title}
    </h2>
  )
}

function Input({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string
  name: string
  value: string
  onChange: any
  error?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full h-[48px] px-4 mt-1 rounded-md border focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-600"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

function Textarea({
  label,
  name,
  value,
  onChange,
  maxLength,
  error,
}: {
  label: string
  name: string
  value: string
  onChange: any
  maxLength?: number
  error?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        maxLength={maxLength}
        className={`w-full mt-1 px-4 py-3 rounded-md border focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-600"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
// app/(dashboard)/recruiter/events/edit/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik"
import * as Yup from "yup"
import UploadBox from "@/components/UploadBox"
import EventMediaFields from "@/components/events/EventMediaFields"
import { Facebook, Twitter, Linkedin, Youtube, Trash2 } from "lucide-react"

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/

// ============================================================
// EXACT SAME VALIDATION AS CREATE PAGE
// ============================================================
const EventSchema = Yup.object({
  title: Yup.string().required("Event name is required"),
  eventType: Yup.string().required("Event type is required"),
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date()
    .min(Yup.ref("startDate"), "End date must be after start date")
    .required("End date is required"),
  timings: Yup.string().required("Timings are required"),
  venue: Yup.string().required("Venue is required"),
  city: Yup.string().required("City is required"),
  country: Yup.string().required("Country is required"),
  shortDescription: Yup.string()
    .max(250, "Max 250 characters")
    .required("Short description is required"),
  description: Yup.string().required("Full description is required"),
  highlights: Yup.array().of(Yup.string()),
  organizationName: Yup.string().required("Organization name is required"),
  contactPerson: Yup.string().required("Contact person is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  mobileNumber: Yup.string().required("Mobile number is required"),
  address: Yup.string().required("Address is required"),
  videoGallery: Yup.array().of(
    Yup.string().test(
      "is-youtube-url",
      "Enter a valid YouTube URL",
      value => !value || YOUTUBE_REGEX.test(value)
    )
  ),
  agreeTerms: Yup.boolean().oneOf([true], "You must agree to continue"),
})

// ============================================================
// EXACT SAME OPTIONS AS CREATE PAGE
// ============================================================
const EVENT_TYPES = [
  { value: "CONFERENCE", label: "Conference" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "WEBINAR", label: "Webinar" },
  { value: "EXHIBITION", label: "Exhibition" },
  { value: "NETWORKING", label: "Networking" },
]

const COUNTRIES = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "AE", label: "UAE" },
]

// ============================================================
// EXACT SAME INITIAL VALUES AS CREATE PAGE
// ============================================================
const initialValues = {
  title: "",
  eventType: "",
  startDate: "",
  endDate: "",
  timings: "",
  venue: "",
  city: "",
  country: "",
  websiteUrl: "",
  logoUrl: "",
  bannerUrl: "",
  shortDescription: "",
  description: "",
  highlights: ["", "", ""],
  organizationName: "",
  contactPerson: "",
  email: "",
  mobileNumber: "",
  phoneNumber: "",
  organizationWebsite: "",
  address: "",
  brochureUrl: "",
  otherImages: [] as string[],
  videoGallery: [] as string[],
  facebookUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  agreeTerms: false,
}

export default function EditEventPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [eventData, setEventData] = useState<any>(null)
  const [submitAction, setSubmitAction] = useState<"submit" | "draft">("draft")
  const [userRole, setUserRole] = useState<string>("recruiter")

  // ============================================================
  // FETCH EVENT DATA
  // ============================================================
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        try {
          const userData = JSON.parse(localStorage.getItem("user") || "{}")
          setUserRole(userData.role || "recruiter")
        } catch (e) {
          setUserRole("recruiter")
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/events/id/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!res.ok) {
          if (res.status === 403) {
            alert("You don't have permission to edit this event")
            router.push("/recruiter/events")
            return
          }
          throw new Error("Failed to fetch event")
        }

        const data = await res.json()
        if (data.success && data.event) {
          const highlights = data.event.highlights || ["", "", ""]
          while (highlights.length < 3) {
            highlights.push("")
          }

          setEventData({
            ...data.event,
            highlights,
            otherImages: data.event.otherImages || [],
            videoGallery: data.event.videoGallery || [],
          })
        } else {
          alert("Event not found")
          router.push("/recruiter/events")
        }
      } catch (error) {
        console.error("Failed to fetch event:", error)
        alert("Failed to load event data")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id, router])

  // ============================================================
  // EXACT SAME UPLOAD LOGIC AS CREATE PAGE
  // ============================================================
  const uploadFile = async (
    file: File,
    setFieldValue: any,
    fieldName: string,
    fileType: "image" | "document" = "image"
  ) => {
    const formData = new FormData()
    const endpoint =
      fileType === "document"
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/upload/document`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/upload`
    formData.append(fileType === "document" ? "document" : "image", file)

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("Upload failed:", text)
      alert("Upload failed. Please check the file type/size and try again.")
      return
    }

    const data = await res.json()
    setFieldValue(fieldName, fileType === "document" ? data.documentUrl : data.imageUrl)
  }

  // ============================================================
  // EXACT SAME SUBMIT LOGIC AS CREATE PAGE
  // ============================================================
  const handleSubmit = async (values: typeof initialValues) => {
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...values,
            action: submitAction,
          }),
        }
      )

      const data = await res.json()

      if (res.ok) {
        if (userRole === "admin") {
          router.push("/admin/events")
        } else {
          router.push("/recruiter/events")
        }
      } else {
        alert(data.message || "Failed to update event")
      }
    } catch (err) {
      console.error("Update event failed:", err)
      alert("Something went wrong. Please check your connection and try again.")
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-gray-600">Loading event data...</p>
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-red-600">Event not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">Edit Event</h1>
      <p className="text-sm text-gray-500 mb-6">
        Update your event listing details.
      </p>

      <Formik
        initialValues={eventData}
        validationSchema={EventSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ setFieldValue, values, isSubmitting }) => (
          <Form className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">

            {/* 1. Event Information */}
            <section>
              <h2 className="text-sm font-semibold text-blue-600 mb-4">
                1. Event Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="title"
                    placeholder="Enter event name"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                  <ErrorMessage name="title" component="p" className="text-xs text-red-500 mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    name="eventType"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                  >
                    <option value="">Select event type</option>
                    {EVENT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="eventType" component="p" className="text-xs text-red-500 mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Field type="date" name="startDate" className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm" />
                  <ErrorMessage name="startDate" component="p" className="text-xs text-red-500 mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <Field type="date" name="endDate" className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm" />
                  <ErrorMessage name="endDate" component="p" className="text-xs text-red-500 mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Timings <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="timings"
                    placeholder="e.g. 10:00 AM - 06:00 PM"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                  <ErrorMessage name="timings" component="p" className="text-xs text-red-500 mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Venue / Location <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="venue"
                    placeholder="Enter venue name"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                  <ErrorMessage name="venue" component="p" className="text-xs text-red-500 mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="city"
                    placeholder="Enter city"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                  <ErrorMessage name="city" component="p" className="text-xs text-red-500 mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    name="country"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="country" component="p" className="text-xs text-red-500 mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Website</label>
                  <Field
                    name="websiteUrl"
                    placeholder="https://www.example.com"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Event Logo</label>
                  <UploadBox
                    label="PNG, JPG, WEBP (Max. 2MB)"
                    value={values.logoUrl}
                    onUpload={file => uploadFile(file, setFieldValue, "logoUrl", "image")}
                  />
                </div>
              </div>

              {/* Event Banner - Full size like Create page */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Event Banner (hero image on the event page)
                </label>
                <UploadBox
                  label="PNG, JPG, WEBP (Max. 2MB, wide image recommended)"
                  value={values.bannerUrl}
                  onUpload={file => uploadFile(file, setFieldValue, "bannerUrl", "image")}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  Write a short description about your event (Max. 250 characters)
                </p>
                <Field
                  as="textarea"
                  name="shortDescription"
                  rows={3}
                  maxLength={250}
                  className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-y"
                />
                <p className="text-right text-xs text-gray-400 mt-1">
                  {values.shortDescription.length}/250
                </p>
                <ErrorMessage name="shortDescription" component="p" className="text-xs text-red-500" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Description <span className="text-red-500">*</span>
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows={6}
                  placeholder="Provide detailed information about your event..."
                  className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-y"
                />
                <ErrorMessage name="description" component="p" className="text-xs text-red-500 mt-1" />
              </div>
            </section>

            {/* 2. Event Highlights */}
            <section>
              <h2 className="text-sm font-semibold text-blue-600 mb-1">
                2. Event Highlights
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Add key highlights or features of your event (min. 3)
              </p>

              <FieldArray name="highlights">
                {({ push, remove }) => (
                  <div className="space-y-3">
                    {values.highlights.map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Field
                          name={`highlights.${index}`}
                          placeholder="Enter highlight"
                          className="input flex-1 border border-gray-300 rounded-lg p-2.5 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => values.highlights.length > 3 && remove(index)}
                          disabled={values.highlights.length <= 3}
                          className="text-red-500 border border-red-200 rounded-lg p-2.5 hover:bg-red-50 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => push("")}
                      className="text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50"
                    >
                      + Add More Highlight
                    </button>
                  </div>
                )}
              </FieldArray>
            </section>

            {/* 3. Organizer Information */}
            <section>
              <h2 className="text-sm font-semibold text-blue-600 mb-4">
                3. Organizer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Organization / Company Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="organizationName"
                    placeholder="Enter organization name"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                  <ErrorMessage name="organizationName" component="p" className="text-xs text-red-500 mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="contactPerson"
                    placeholder="Enter contact person name"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                  <ErrorMessage name="contactPerson" component="p" className="text-xs text-red-500 mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="email"
                    placeholder="Enter email address"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                  <ErrorMessage name="email" component="p" className="text-xs text-red-500 mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="mobileNumber"
                    placeholder="Enter mobile number"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                  <ErrorMessage name="mobileNumber" component="p" className="text-xs text-red-500 mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <Field
                    name="phoneNumber"
                    placeholder="Enter phone number"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <Field
                    name="organizationWebsite"
                    placeholder="https://www.example.com"
                    className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <Field
                  as="textarea"
                  name="address"
                  rows={3}
                  placeholder="Enter complete address"
                  className="input w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-y"
                />
                <ErrorMessage name="address" component="p" className="text-xs text-red-500 mt-1" />
              </div>
            </section>

            {/* 4. Additional Information */}
            <section>
              <h2 className="text-sm font-semibold text-blue-600 mb-4">
                4. Additional Information
              </h2>

              {/* Brochure - Full size like Create page */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Brochure / Media Kit</label>
                <UploadBox
                  label="PDF (Max. 5MB)"
                  value={values.brochureUrl}
                  onUpload={file => uploadFile(file, setFieldValue, "brochureUrl", "document")}
                />
              </div>

              {/* Images Gallery + Video Gallery (YouTube), both with "add more" */}
              <div className="mb-4">
                <EventMediaFields
                  initialImages={values.otherImages}
                  initialVideos={values.videoGallery}
                  onImagesChange={urls => setFieldValue("otherImages", urls)}
                  onVideosChange={urls => setFieldValue("videoGallery", urls)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Social Media Links (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Facebook size={18} className="text-[#1877F2] shrink-0" />
                    <Field
                      name="facebookUrl"
                      placeholder="https://facebook.com/yourpage"
                      className="input flex-1 border border-gray-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter size={18} className="text-[#1DA1F2] shrink-0" />
                    <Field
                      name="twitterUrl"
                      placeholder="https://twitter.com/yourpage"
                      className="input flex-1 border border-gray-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin size={18} className="text-[#0A66C2] shrink-0" />
                    <Field
                      name="linkedinUrl"
                      placeholder="https://linkedin.com/company/yourpage"
                      className="input flex-1 border border-gray-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Youtube size={18} className="text-[#FF0000] shrink-0" />
                    <Field
                      name="youtubeUrl"
                      placeholder="https://youtube.com/yourchannel"
                      className="input flex-1 border border-gray-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <Field type="checkbox" name="agreeTerms" className="mt-1" />
              <label className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="/terms" className="text-blue-600 underline">Terms & Conditions</a>{" "}
                and{" "}
                <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a>{" "}
                of ToolingTrends.com <span className="text-red-500">*</span>
              </label>
            </div>
            <ErrorMessage name="agreeTerms" component="p" className="text-xs text-red-500 -mt-4" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                onClick={() => setSubmitAction("submit")}
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {isSubmitting && submitAction === "submit" ? "Submitting..." : "Submit Event for Review"}
              </button>
              <button
                type="submit"
                onClick={() => setSubmitAction("draft")}
                disabled={isSubmitting}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {isSubmitting && submitAction === "draft" ? "Saving..." : "Save as Draft"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Our team will review your submission and publish it after verification.
            </p>
          </Form>
        )}
      </Formik>
    </div>
  )
}
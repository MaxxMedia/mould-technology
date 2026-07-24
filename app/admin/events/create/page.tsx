"use client"

import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik"
import * as Yup from "yup"
import { useRouter } from "next/navigation"
import { useState } from "react"
import UploadBox from "@/components/UploadBox"
import { Facebook, Twitter, Linkedin, Youtube, Trash2 } from "lucide-react"

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
  agreeTerms: Yup.boolean().oneOf([true], "You must agree to continue"),
})

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
  facebookUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  agreeTerms: false,
}

export default function CreateEventPage() {
  const router = useRouter()
  const [submitAction, setSubmitAction] = useState<"REVIEW" | "DRAFT">("DRAFT")

  const uploadFile = async (
    file: File,
    setFieldValue: any,
    fieldName: string
  ) => {
    const formData = new FormData()
    formData.append("image", file)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("Upload failed:", text)
      alert("Upload failed")
      return
    }

    const data = await res.json()
    setFieldValue(fieldName, data.imageUrl)
  }

  const handleSubmit = async (values: typeof initialValues) => {
    const token = localStorage.getItem("token")

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...values,
        status: submitAction === "REVIEW" ? "PENDING_REVIEW" : "DRAFT",
      }),
    })

    const data = await res.json()

    if (res.ok) {
      router.push("/admin/events")
    } else {
      alert(data.message || "Failed to create event")
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">Add Event</h1>
      <p className="text-sm text-gray-500 mb-6">
        Create a new event listing on the platform.
      </p>

      <Formik
        initialValues={initialValues}
        validationSchema={EventSchema}
        onSubmit={handleSubmit}
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
                  <label className="block text-sm font-medium mb-1">Event Logo / Banner</label>
                  <UploadBox
                    label="PNG, JPG, WEBP (Max. 2MB)"
                    value={values.logoUrl}
                    onUpload={file => uploadFile(file, setFieldValue, "logoUrl")}
                  />
                </div>
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
                  placeholder=""
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
                          onClick={() => remove(index)}
                          className="text-red-500 border border-red-200 rounded-lg p-2.5 hover:bg-red-50 flex items-center justify-center"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Brochure / Media Kit</label>
                  <UploadBox
                    label="PDF (Max. 5MB)"
                    value={values.brochureUrl}
                    onUpload={file => uploadFile(file, setFieldValue, "brochureUrl")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Other Images (Optional)</label>
                  <UploadBox
                    label="JPG, PNG (Max. 5MB each)"
                    value={values.otherImages?.[0] || ""}
                    onUpload={file =>
                      uploadFile(file, setFieldValue, "otherImages[0]")
                    }
                  />
                </div>
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
                onClick={() => setSubmitAction("REVIEW")}
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit Event for Review"}
              </button>
              <button
                type="submit"
                onClick={() => setSubmitAction("DRAFT")}
                disabled={isSubmitting}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save as Draft"}
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
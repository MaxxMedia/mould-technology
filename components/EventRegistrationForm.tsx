"use client"

import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import axios from "axios"
import { useState, useRef } from "react"
import { Turnstile } from "@marsidev/react-turnstile"
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
} from "lucide-react"

interface Props {
  slug: string
}

const validationSchema = Yup.object({
  fullName: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  companyName: Yup.string().required("Company Name is required"),
  jobTitle: Yup.string().required("Job Title is required"),
  country: Yup.string().required("Country is required"),
  agree: Yup.boolean().oneOf([true], "You must accept Terms"),
})

/* ================= TERMS & CONDITIONS CONTENT ================= */

const TERMS_SECTIONS = [
  {
    title: "1. Role of ToolingTrends",
    body: "ToolingTrends acts only as a registration and promotional platform. Event organizers are solely responsible for conducting, modifying, postponing or cancelling events.",
  },
  {
    title: "2. Registration",
    body: "Information must be accurate. Registration does not guarantee admission and may require organizer approval.",
  },
  {
    title: "3. Information Sharing",
    body: "You authorize ToolingTrends to share your registration details with the respective organizer for event management and communications.",
  },
  {
    title: "4. Communications",
    body: "You consent to receive event updates, reminders and related promotional communications.",
  },
  {
    title: "5. Event Changes",
    body: "Organizers may change dates, venues or schedules. ToolingTrends is not liable for resulting losses.",
  },
  {
    title: "6. Refunds",
    body: "Refunds, where applicable, are governed solely by the organizer.",
  },
  {
    title: "7. Badges",
    body: "Badges are non-transferable and may be cancelled if misused.",
  },
  {
    title: "8. Media Consent",
    body: "Attendance constitutes consent to photography and video recording for promotional purposes.",
  },
  {
    title: "9. Code of Conduct",
    body: "Attendees must behave professionally and follow venue rules.",
  },
  {
    title: "10. Intellectual Property",
    body: "All trademarks and content belong to their respective owners.",
  },
  {
    title: "11. Privacy",
    body: "Personal data is processed according to the ToolingTrends Privacy Policy.",
  },
  {
    title: "12. Disclaimer",
    body: "ToolingTrends is not liable for organizer actions, cancellations, travel losses or technical issues.",
  },
  {
    title: "13. Force Majeure",
    body: "Neither ToolingTrends nor organizers are liable for events beyond reasonable control.",
  },
  {
    title: "14. Governing Law",
    body: "Governed by the laws of India. Jurisdiction: Bengaluru, Karnataka.",
  },
  {
    title: "15. Acceptance",
    body: "Submitting the form signifies acceptance of these Terms.",
  },
]

function TermsModal({
  onClose,
  onAccept,
}: {
  onClose: () => void
  onAccept: () => void
}) {
  const [hasReachedEnd, setHasReachedEnd] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = bodyRef.current
    if (!el) return
    // 24px tolerance so it still triggers if the last fraction of a pixel is short
    const reachedBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 24
    if (reachedBottom) setHasReachedEnd(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#0A2B57]">
              Terms &amp; Conditions
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Third-Party Exhibition Registration · Effective Date: July 20,
              2026
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          onScroll={handleScroll}
          className="overflow-y-auto px-6 py-5 space-y-4"
        >
          <p className="text-sm text-gray-600 leading-relaxed">
            These Terms govern registrations through ToolingTrends.com
            operated by Maxx Business Media Private Limited for third-party
            events.
          </p>

          {TERMS_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-[#0A2B57] mb-1">
                {section.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}

          <p className="text-xs text-gray-400 text-center pt-2 pb-1">
            — End of Terms &amp; Conditions —
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 space-y-2">
          {!hasReachedEnd && (
            <p className="text-xs text-gray-400 text-center">
              Please scroll down to read the full terms before accepting.
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-gray-500 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAccept}
              disabled={!hasReachedEnd}
              className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors ${
                hasReachedEnd
                  ? "bg-[#0A2B57] text-white hover:bg-[#061D3D]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              I Agree &amp; Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= MAIN COMPONENT ================= */

export default function EventRegistrationForm({ slug }: Props) {
  const [success, setSuccess] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const turnstileRef = useRef<any>(null)

  const inputBase =
    "w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A2B57] focus:border-[#0A2B57]"

  return (
    <div className="w-full bg-white rounded-2xl p-8">

      <h2 className="text-2xl font-bold text-[#0A2B57] mb-8 text-center">
        Event Registration
      </h2>

      <Formik
        initialValues={{
          fullName: "",
          email: "",
          phone: "",
          companyName: "",
          jobTitle: "",
          country: "",
          specialRequirements: "",
          agree: false,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          setErrorMsg("")
          setSuccess("")

          if (!captchaToken) {
            setErrorMsg("Please verify you are human.")
            return
          }

          try {
            setLoading(true)

            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/events/${slug}/register`,
              { ...values, captchaToken }
            )

            if (res.data.success) {
              setSuccess("Registration Successful 🎉")

              resetForm()
              setCaptchaToken(null)

              // 🔄 Reset Turnstile widget properly
              turnstileRef.current?.reset()
            }

          } catch (err: any) {
            setErrorMsg(
              err?.response?.data?.message || "Registration failed"
            )

            // 🔄 Reset token if backend rejected
            setCaptchaToken(null)
            turnstileRef.current?.reset()
          } finally {
            setLoading(false)
          }
        }}
      >
        {({ isSubmitting, errors, touched, setFieldValue, values }) => (
          <Form className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {[
                { name: "fullName", label: "Full Name", icon: User },
                { name: "email", label: "Email", icon: Mail, type: "email" },
                { name: "phone", label: "Phone", icon: Phone },
                { name: "companyName", label: "Company", icon: Building2 },
                { name: "jobTitle", label: "Job Title", icon: Briefcase },
                { name: "country", label: "Country", icon: Globe },
              ].map((field) => {
                const Icon = field.icon
                return (
                  <div key={field.name}>
                    <label className="text-sm font-semibold text-[#0A2B57]">
                      {field.label} *
                    </label>
                    <div className="relative mt-1">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Field
                        name={field.name}
                        type={field.type || "text"}
                        className={`${inputBase} ${
                          errors[field.name as keyof typeof errors] &&
                          touched[field.name as keyof typeof touched]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    <ErrorMessage
                      name={field.name}
                      component="div"
                      className="text-red-600 text-xs mt-1"
                    />
                  </div>
                )
              })}
            </div>

            {/* Special Requirements */}
            <div>
              <label className="text-sm font-semibold text-[#0A2B57]">
                Special Requirements (Optional)
              </label>
              <Field
                as="textarea"
                name="specialRequirements"
                rows={2}
                className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0A2B57] resize-none"
              />
            </div>

            {/* Terms */}
            <div>
              <div
                className="flex items-center gap-2 text-sm text-[#0A2B57] cursor-pointer select-none"
                onClick={() => {
                  if (!values.agree) setShowTerms(true)
                }}
              >
                <span
                  className={`w-4.5 h-4.5 shrink-0 rounded flex items-center justify-center border-2 transition-colors ${
                    values.agree
                      ? "bg-[#0A2B57] border-[#0A2B57]"
                      : "bg-white border-gray-300"
                  }`}
                  style={{ width: 18, height: 18 }}
                  aria-hidden="true"
                >
                  {values.agree && (
                    <Check size={13} strokeWidth={3} className="text-white" />
                  )}
                </span>
                <span>
                  I agree to{" "}
                  <span className="underline font-medium">
                    Terms &amp; Conditions
                  </span>{" "}
                  *
                </span>
              </div>
              <ErrorMessage
                name="agree"
                component="div"
                className="text-red-600 text-xs mt-1"
              />
              {!values.agree && (
                <p className="text-xs text-gray-400 mt-1">
                  You must read the full terms before you can check this box.
                </p>
              )}
              {values.agree && (
                <p className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <CheckCircle2 size={13} />
                  Terms accepted — you're ready to register.
                </p>
              )}
            </div>

            {/* 🔐 Turnstile */}
            <div className="flex justify-center">
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token: string) => {
                  console.log("Turnstile token:", token)
                  setCaptchaToken(token)
                }}
                onExpire={() => {
                  setCaptchaToken(null)
                }}
                onError={() => {
                  setCaptchaToken(null)
                }}
                options={{
                  theme: "light",
                  appearance: "always",
                }}
              />
            </div>

            {success && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 size={18} />
                {success}
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={18} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2B57] text-white py-3 rounded-lg font-semibold hover:bg-[#061D3D] transition shadow-md"
            >
              {loading ? "Processing..." : "Register Now"}
            </button>

            {showTerms && (
              <TermsModal
                onClose={() => setShowTerms(false)}
                onAccept={() => {
                  setFieldValue("agree", true)
                  setShowTerms(false)
                }}
              />
            )}
          </Form>
        )}
      </Formik>
    </div>
  )
}
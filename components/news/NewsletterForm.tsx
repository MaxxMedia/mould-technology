"use client"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

// Step 1: Personal Info Validation
const Step1Schema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  company: Yup.string().required("Company is required"),
})

// Step 2: Email Validation
const Step2Schema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
})

// Full Schema for final validation
const FullSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  company: Yup.string().required("Company is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
})

interface NewsletterFormProps {
  hasNewsletterContent?: boolean // Prop to determine if newsletter content exists
}

export default function NewsletterForm({ hasNewsletterContent = true }: NewsletterFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
  })

  const handleNext = (values: typeof formData) => {
    setFormData(values)
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (values: typeof formData, { setSubmitting, resetForm }: any) => {
    try {
      // Prepare data for API
      const subscriberData = {
        fullName: `${values.firstName} ${values.lastName}`,
        email: values.email,
        companyName: values.company,
        frequency: "MONTHLY",
        emailSubscribed: true,
        whatsappSubscribed: false,
        smsSubscribed: false,
      }

      // Call the subscribe API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscriberData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Subscription failed")
      }

      // Check if user is admin (has token and admin role)
      const token = localStorage.getItem("token")
      const userRole = localStorage.getItem("userRole")

      if (token && userRole === "admin") {
        // Redirect to admin subscribers page with success message
        router.push("/admin/newsletter/subscribers?subscribed=true")
        return
      }

      // For regular users, show success message
      setIsSubmitted(true)

      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        resetForm()
        setStep(1)
        setFormData({
          firstName: "",
          lastName: "",
          company: "",
          email: "",
        })
      }, 5000)

    } catch (error: any) {
      console.error("Submission error:", error)
      alert(error.message || "Failed to subscribe. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Success Message
  if (isSubmitted) {
    return (
      <section className="max-w-[1320px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-16 items-center">
          <div>
            <div className="relative w-full h-[420px]">
              <Image
                src="/images/moldnews.png"
                alt="TOOLING Newsletter"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 360px"
                priority
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Successfully Subscribed!
            </h3>
            <p className="text-green-700">
              Thank you for subscribing to Tooling Newsletters.
            </p>
            <p className="text-sm text-green-600 mt-2">
              You'll receive the latest updates from the Toolmaking industry.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-[1320px] mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-16 items-center">

        {/* LEFT IMAGE */}
        <div>
          <div className="relative w-full h-[420px]">
            <Image
              src="/images/moldnews.png"
              alt="TOOLING Newsletter"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 360px"
              priority
            />
          </div>
        </div>

        {/* FORM */}
        <div>
          <h2 className="text-[32px] font-bold text-[#003B5C] mb-4">
            Subscribe to Tooling Newsletters
          </h2>

          <p className="text-gray-600 mb-8">
            Tooling Technology magazine is devoted to the Toolmaking industry.
            Find out the processes and strategies shops around the world use to
            become more effective and efficient.
          </p>

          {/* ============ CONDITIONAL PAGINATION ============ */}
          {hasNewsletterContent ? (
            // SHOW MULTI-STEP FORM WITH PAGINATION
            <>
              {/* Step Indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center gap-2`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === 1 ? 'bg-[#C8102E] text-white' : 'bg-green-500 text-white'
                    }`}>
                    {step === 1 ? '1' : '✓'}
                  </div>
                  <span className={`text-sm ${step === 1 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                    Personal Info
                  </span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300" />
                <div className={`flex items-center gap-2`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === 2 ? 'bg-[#C8102E] text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                    2
                  </div>
                  <span className={`text-sm ${step === 2 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                    Email
                  </span>
                </div>
              </div>

              <Formik
                initialValues={formData}
                validationSchema={step === 1 ? Step1Schema : Step2Schema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, isSubmitting, validateForm, setTouched }) => (
                  <Form>
                    {step === 1 && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Field
                              name="firstName"
                              placeholder="First Name"
                              className="w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                            />
                            <ErrorMessage
                              name="firstName"
                              component="p"
                              className="text-red-600 text-xs mt-1"
                            />
                          </div>

                          <div>
                            <Field
                              name="lastName"
                              placeholder="Last Name"
                              className="w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                            />
                            <ErrorMessage
                              name="lastName"
                              component="p"
                              className="text-red-600 text-xs mt-1"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Field
                              name="company"
                              placeholder="Company"
                              className="w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                            />
                            <ErrorMessage
                              name="company"
                              component="p"
                              className="text-red-600 text-xs mt-1"
                            />
                          </div>
                        </div>

                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={async () => {
                              const errors = await validateForm()
                              if (Object.keys(errors).length === 0) {
                                handleNext(values)
                              } else {
                                setTouched({
                                  firstName: true,
                                  lastName: true,
                                  company: true,
                                })
                              }
                            }}
                            className="bg-[#C8102E] text-white px-10 py-3 font-bold rounded-md hover:bg-[#a00d24] transition"
                          >
                            Next Step →
                          </button>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <div className="space-y-6">
                          {/* Show summary of step 1 */}
                          <div className="bg-gray-50 p-4 rounded-md text-sm">
                            <p><strong>Name:</strong> {values.firstName} {values.lastName}</p>
                            <p><strong>Company:</strong> {values.company}</p>
                          </div>

                          <div>
                            <Field
                              name="email"
                              type="email"
                              placeholder="Email Address"
                              className="w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                            />
                            <ErrorMessage
                              name="email"
                              component="p"
                              className="text-red-600 text-xs mt-1"
                            />
                          </div>
                        </div>

                        <div className="mt-6 flex gap-4">
                          <button
                            type="button"
                            onClick={handleBack}
                            className="bg-gray-300 text-gray-700 px-8 py-3 font-bold rounded-md hover:bg-gray-400 transition"
                          >
                            ← Back
                          </button>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#C8102E] text-white px-10 py-3 font-bold rounded-md hover:bg-[#a00d24] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                              </>
                            ) : (
                              'Submit'
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </Form>
                )}
              </Formik>
            </>
          ) : (
            // SHOW SINGLE PAGE FORM (NO PAGINATION)
            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                company: "",
                email: "",
              }}
              validationSchema={FullSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <Field
                      name="firstName"
                      placeholder="First Name"
                      className="w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                    />
                    <ErrorMessage
                      name="firstName"
                      component="p"
                      className="text-red-600 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Field
                      name="lastName"
                      placeholder="Last Name"
                      className="w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                    />
                    <ErrorMessage
                      name="lastName"
                      component="p"
                      className="text-red-600 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Field
                      name="company"
                      placeholder="Company"
                      className="w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                    />
                    <ErrorMessage
                      name="company"
                      component="p"
                      className="text-red-600 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      className="w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-red-600 text-xs mt-1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#C8102E] text-white px-10 py-3 font-bold rounded-md hover:bg-[#a00d24] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>

                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </section>
  )
}
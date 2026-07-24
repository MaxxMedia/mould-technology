// app/components/events/EventEnquireForm.tsx
"use client"

import { useState } from "react"

export default function EventEnquireForm({ slug }: { slug: string }) {
  const [values, setValues] = useState({ name: "", email: "", mobile: "", message: "" })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (key: keyof typeof values, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${slug}/enquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit enquiry")
      }

      setSubmitted(true)
      setValues({ name: "", email: "", mobile: "", message: "" })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <p className="text-sm text-green-600">
        Thanks! Your enquiry has been sent. We'll get back to you soon.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Name"
        required
        value={values.name}
        onChange={e => update("name", e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="email"
        placeholder="Email"
        required
        value={values.email}
        onChange={e => update("email", e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="tel"
        placeholder="Mobile"
        value={values.mobile}
        onChange={e => update("mobile", e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <textarea
        placeholder="Message / Query"
        rows={4}
        required
        value={values.message}
        onChange={e => update("message", e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-red-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-700 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "SUBMIT"}
      </button>
    </form>
  )
}
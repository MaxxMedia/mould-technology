"use client"

import { useState } from "react"
import { X, Send, CheckCircle2 } from "lucide-react"

type QuoteRequestButtonProps = {
    supplierSlug: string
    supplierName: string
    className?: string
}

type FormState = {
    fullName: string
    email: string
    phone: string
    companyName: string
    message: string
}

const initialForm: FormState = {
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    message: "",
}

export default function QuoteRequestButton({
    supplierSlug,
    supplierName,
    className,
}: QuoteRequestButtonProps) {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<FormState>(initialForm)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    function updateField(field: keyof FormState, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    function closeModal() {
        setOpen(false)
        setError("")
        if (success) {
            setSuccess(false)
            setForm(initialForm)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")

        if (!form.fullName.trim() || !form.email.trim() || !form.message.trim()) {
            setError("Please fill in your name, email and requirement.")
            return
        }

        try {
            setSubmitting(true)
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/${supplierSlug}/inquiries`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                }
            )

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || "Failed to send your request. Please try again.")
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || "Failed to send your request. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={
                    className ||
                    "inline-flex items-center justify-center gap-2 bg-[#0b3954] text-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wide hover:bg-[#092f46] transition rounded"
                }
            >
                Request a Quote
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white w-full max-w-md rounded-lg shadow-xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-6">
                            {success ? (
                                <div className="text-center py-6">
                                    <CheckCircle2 className="mx-auto text-green-600" size={40} />
                                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                        Request sent
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {supplierName} will get back to you directly at the email
                                        you provided.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="mt-6 bg-[#0b3954] text-white px-6 py-2 text-sm font-semibold uppercase rounded hover:bg-[#092f46] transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Request a Quote
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Send your requirement to {supplierName}. They&apos;ll reply
                                        directly to your email.
                                    </p>

                                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600 uppercase">
                                                Full Name
                                            </label>
                                            <input
                                                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                                value={form.fullName}
                                                onChange={(e) => updateField("fullName", e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-600 uppercase">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                                    value={form.email}
                                                    onChange={(e) => updateField("email", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-600 uppercase">
                                                    Phone
                                                </label>
                                                <input
                                                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                                    value={form.phone}
                                                    onChange={(e) => updateField("phone", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-600 uppercase">
                                                Company Name
                                            </label>
                                            <input
                                                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                                value={form.companyName}
                                                onChange={(e) => updateField("companyName", e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-600 uppercase">
                                                What do you need?
                                            </label>
                                            <textarea
                                                rows={4}
                                                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                                value={form.message}
                                                onChange={(e) => updateField("message", e.target.value)}
                                                required
                                            />
                                        </div>

                                        {error && <p className="text-sm text-red-600">{error}</p>}

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full inline-flex items-center justify-center gap-2 bg-[#0b3954] text-white px-6 py-2.5 text-sm font-semibold uppercase rounded hover:bg-[#092f46] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={16} />
                                            {submitting ? "Sending..." : "Send Request"}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
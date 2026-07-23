// app/unauthorized/page.tsx
"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA] px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                    <ShieldAlert size={28} className="text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Access denied</h1>
                <p className="text-sm text-gray-500 mb-8">
                    You don&apos;t have permission to view this page. If you think this is a
                    mistake, contact your administrator.
                </p>
                <Link
                    href="/admin/login"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#0F5B78] hover:bg-[#0c4a61] text-white text-sm font-semibold transition"
                >
                    Back to login
                </Link>
            </div>
        </div>
    )
}
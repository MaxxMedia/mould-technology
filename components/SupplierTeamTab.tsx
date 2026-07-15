// components/SupplierTeamTab.tsx
"use client"

import { useState, useEffect } from "react"
import { Users, Loader2, Mail, MapPin, Briefcase, User } from "lucide-react"

type TeamMember = {
    id: number
    userId: number
    designation: string
    department?: string
    employmentType?: string
    startDate?: string
    user: {
        id: number
        fullName: string
        email: string
        avatarUrl?: string
        headline?: string
        location?: string
    }
}

type SupplierTeamTabProps = {
    companySlug?: string
}

export default function SupplierTeamTab({ companySlug }: SupplierTeamTabProps) {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!companySlug) {
            setError("Company information not available")
            setLoading(false)
            return
        }

        const fetchTeamMembers = async () => {
            try {
                setLoading(true)
                setError(null)

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${companySlug}/team`,
                    {
                        cache: "no-store",
                    }
                )

                if (!res.ok) {
                    if (res.status === 404) {
                        setTeamMembers([])
                        return
                    }
                    throw new Error(`Failed to fetch team members: ${res.status}`)
                }

                const data = await res.json()
                // Handle different response formats
                const members = data.data || data || []
                setTeamMembers(members)
            } catch (err: any) {
                console.error("Error fetching team members:", err)
                setError(err.message || "Failed to load team members")
            } finally {
                setLoading(false)
            }
        }

        fetchTeamMembers()
    }, [companySlug])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <span className="ml-2 text-gray-600">Loading team members...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-3">😕</div>
                <p className="text-gray-500">Unable to load team members</p>
                <p className="text-sm text-gray-400 mt-1">{error}</p>
            </div>
        )
    }

    if (teamMembers.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-500">No team members listed</p>
                <p className="text-sm text-gray-400 mt-1">This company hasn't added any team members yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
                <Users className="text-gray-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">
                    Team Members ({teamMembers.length})
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                    <div
                        key={member.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                    >
                        <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {member.user.fullName?.charAt(0) || member.user.email?.charAt(0) || 'U'}
                            </div>

                            {/* Member Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                    {member.user.fullName || 'Unknown'}
                                </h4>
                                <p className="text-sm text-gray-600 truncate">{member.designation}</p>

                                {member.department && (
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Briefcase size={12} />
                                        {member.department}
                                    </p>
                                )}

                                {member.user.email && (
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate">
                                        <Mail size={12} className="flex-shrink-0" />
                                        <span className="truncate">{member.user.email}</span>
                                    </p>
                                )}

                                {member.user.location && (
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <MapPin size={12} />
                                        {member.user.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
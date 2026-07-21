// app/companies/[slug]/team/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getCompanyTeam } from '@/lib/teamService';
import { TeamMember } from '@/types/team';
import { Users, Calendar, Briefcase, Building2, Mail } from 'lucide-react';

export default function CompanyTeamPage() {
    const { slug } = useParams();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        loadTeam();
    }, [slug]);

    async function loadTeam() {
        try {
            setLoading(true);
            setError(null);
            const data = await getCompanyTeam(slug as string);
            setMembers(data);
            if (data.length > 0 && data[0].company) {
                setCompanyName(data[0].company.name);
            }
        } catch (err: any) {
            console.error('Error loading team:', err);
            setError(err.message || 'Failed to load team');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (members.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h1 className="text-2xl font-bold text-gray-900">Our Team</h1>
                <p className="text-gray-500 mt-2">No team members to display yet</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Building2 className="text-blue-600" size={28} />
                    {companyName || 'Our Team'}
                </h1>
                <p className="text-gray-500 mt-2 flex items-center gap-2">
                    <Users size={18} />
                    {members.length} team member{members.length > 1 ? 's' : ''}
                </p>
            </div>

            <div className="grid gap-4">
                {members.map((member) => (
                    <div key={member.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition">
                        <div className="flex items-start gap-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                                {member.user.avatarUrl ? (
                                    <Image
                                        src={member.user.avatarUrl}
                                        alt={member.user.fullName || 'Team Member'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {member.user.fullName?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg text-gray-900">
                                    {member.user.fullName || 'Unknown'}
                                </h3>
                                <p className="text-gray-600">{member.designation}</p>

                                <div className="flex flex-wrap gap-2 mt-2">
                                    {member.department && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {member.department}
                                        </span>
                                    )}
                                    {member.employmentType && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            <Briefcase size={12} className="mr-1" />
                                            {member.employmentType.replace('_', ' ')}
                                        </span>
                                    )}
                                    {member.startDate && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            <Calendar size={12} className="mr-1" />
                                            Joined {new Date(member.startDate).getFullYear()}
                                        </span>
                                    )}
                                </div>

                                {member.user.email && (
                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                        <Mail size={12} />
                                        {member.user.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
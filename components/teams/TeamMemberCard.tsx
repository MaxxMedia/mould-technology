// components/team/TeamMemberCard.tsx

import Image from 'next/image';
import { TeamMember } from '@/types/team';

interface Props {
    member: TeamMember;
    showCompany?: boolean;
}

export default function TeamMemberCard({ member, showCompany = false }: Props) {
    return (
        <div className="bg-white rounded-xl border p-6 hover:shadow-md transition">
            <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    {member.user.avatarUrl ? (
                        <Image
                            src={member.user.avatarUrl}
                            alt={member.user.fullName}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                            {member.user.fullName.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900">
                        {member.user.fullName}
                    </h3>
                    <p className="text-gray-600 text-sm">{member.designation}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {member.department}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {member.employmentType}
                        </span>
                        {member.startDate && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Joined {new Date(member.startDate).getFullYear()}
                            </span>
                        )}
                    </div>
                    {showCompany && member.company && (
                        <div className="mt-2 flex items-center gap-2">
                            {member.company.logoUrl && (
                                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                    <Image
                                        src={member.company.logoUrl}
                                        alt={member.company.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <span className="text-sm text-gray-500">
                                {member.company.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
// types/team.ts

export interface TeamMember {
    id: number;
    companyId: number;
    userId: number;
    designation: string;
    department?: string;
    employmentType?: string;
    startDate?: string;
    endDate?: string;
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'FORMER';
    approvedById?: number;
    approvedAt?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        fullName: string;
        email: string;
        avatarUrl?: string;
        headline?: string;
        location?: string;
    };
    company: {
        id: number;
        name: string;
        slug: string;
        logoUrl?: string;
        tagline?: string;
        isVerified?: boolean;
    };
    approvedBy?: {
        id: number;
        fullName: string;
    };
}

export interface CompanySearchResult {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string;
    tagline?: string;
    industry?: {
        id: number;
        name: string;
    };
}
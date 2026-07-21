// lib/teamService.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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
    };
    company: {
        id: number;
        name: string;
        slug: string;
        logoUrl?: string;
    };
    approvedBy?: {
        id: number;
        fullName: string;
    };
}

export interface TeamRequest {
    companyId: number;
    designation: string;
    department?: string;
    employmentType?: string;
    startDate?: string;
}

export async function requestToJoinCompany(data: TeamRequest) {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/team/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to submit request');
    }

    return res.json();
}

export async function getMyTeamStatus(companyId?: number) {
    const token = localStorage.getItem('token');
    const url = companyId
        ? `${API_BASE}/api/team/me?companyId=${companyId}`
        : `${API_BASE}/api/team/me`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (res.status === 404) {
        return null;
    }

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch team status');
    }

    const result = await res.json();
    return result.data || result;
}

export async function getPendingRequests(companyId?: number) {
    const token = localStorage.getItem('token');
    const url = companyId
        ? `${API_BASE}/api/team/pending?companyId=${companyId}`
        : `${API_BASE}/api/team/pending`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch pending requests');
    }

    const result = await res.json();

    // Handle both array and object responses
    if (Array.isArray(result)) return result;
    if (result?.data && Array.isArray(result.data)) return result.data;
    if (result?.requests && Array.isArray(result.requests)) return result.requests;
    if (result?.pending && Array.isArray(result.pending)) return result.pending;
    if (result?.members && Array.isArray(result.members)) return result.members;

    return [];
}

export async function getTeamMembers(companyId?: number) {
    const token = localStorage.getItem('token');
    const url = companyId
        ? `${API_BASE}/api/team/members?companyId=${companyId}`
        : `${API_BASE}/api/team/members`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch team members');
    }

    const result = await res.json();

    if (Array.isArray(result)) return result;
    if (result?.data && Array.isArray(result.data)) return result.data;
    if (result?.members && Array.isArray(result.members)) return result.members;
    if (result?.team && Array.isArray(result.team)) return result.team;

    return [];
}

export async function approveTeamMember(teamId: number) {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/team/${teamId}/approve`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to approve member');
    }

    return res.json();
}

export async function rejectTeamMember(teamId: number, rejectionReason: string) {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/team/${teamId}/reject`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to reject member');
    }

    return res.json();
}

export async function getCompanyTeam(slug: string) {
    const res = await fetch(`${API_BASE}/api/companies/${slug}/team`);

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch company team');
    }

    const result = await res.json();

    if (Array.isArray(result)) return result;
    if (result?.data && Array.isArray(result.data)) return result.data;
    if (result?.members && Array.isArray(result.members)) return result.members;
    if (result?.team && Array.isArray(result.team)) return result.team;

    return [];
}

export async function searchCompanies(query: string) {
    const res = await fetch(
        `${API_BASE}/api/companies/search?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to search companies');
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.data || [];
}
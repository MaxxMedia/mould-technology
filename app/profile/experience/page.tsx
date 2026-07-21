// app/profile/experience/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { requestToJoinCompany, getMyTeamStatus, TeamMember } from '@/lib/teamService';
import { Search, Briefcase, Building2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ExperiencePage() {
    const router = useRouter();
    const [step, setStep] = useState<'search' | 'form' | 'status'>('search');
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [teamStatus, setTeamStatus] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const [formData, setFormData] = useState({
        designation: '',
        department: '',
        employmentType: 'FULL_TIME',
        startDate: '',
    });

    useEffect(() => {
        loadTeamStatus();
    }, []);

    async function loadTeamStatus() {
        try {
            const data = await getMyTeamStatus();
            if (data) {
                setTeamStatus(data);
                setStep('status');
            }
        } catch (error) {
            console.error('Failed to load team status:', error);
        } finally {
            setLoading(false);
        }
    }

    async function searchCompanies(query: string) {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/companies/search?q=${encodeURIComponent(query)}`
            );
            const data = await res.json();
            setSearchResults(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    }

    const handleCompanySelect = (company: any) => {
        setSelectedCompany(company);
        setStep('form');
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompany) return;

        setSubmitting(true);
        try {
            await requestToJoinCompany({
                companyId: selectedCompany.id,
                ...formData,
            });
            alert('✅ Request submitted successfully!');
            await loadTeamStatus();
            setStep('status');
        } catch (error: any) {
            alert(error.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Status View
    if (step === 'status' && teamStatus) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Your Team Status</h1>

                <div className="bg-white rounded-xl border p-6">
                    <div className="flex items-center gap-4 mb-4">
                        {teamStatus.company.logoUrl ? (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                <Image
                                    src={teamStatus.company.logoUrl}
                                    alt={teamStatus.company.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-gray-500" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-semibold">{teamStatus.company.name}</h2>
                            <p className="text-gray-600">{teamStatus.designation}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-gray-600">Status</span>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                ${teamStatus.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    teamStatus.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        teamStatus.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'}`}
                            >
                                {teamStatus.status === 'PENDING' && <Clock size={14} />}
                                {teamStatus.status === 'ACTIVE' && <CheckCircle size={14} />}
                                {teamStatus.status === 'REJECTED' && <XCircle size={14} />}
                                {teamStatus.status}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-gray-600">Department</span>
                            <span className="font-medium">{teamStatus.department || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-gray-600">Employment Type</span>
                            <span className="font-medium">{teamStatus.employmentType?.replace('_', ' ') || 'N/A'}</span>
                        </div>
                        {teamStatus.startDate && (
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600">Start Date</span>
                                <span className="font-medium">
                                    {new Date(teamStatus.startDate).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {teamStatus.rejectionReason && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">
                                    <strong>Rejection Reason:</strong> {teamStatus.rejectionReason}
                                </p>
                            </div>
                        )}
                    </div>

                    {teamStatus.status === 'REJECTED' && (
                        <button
                            onClick={() => setStep('search')}
                            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Submit New Request
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Search View
    if (step === 'search') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">Company Experience</h1>
                <p className="text-gray-600 mb-8">
                    Search for your company to request verification of your employment.
                </p>

                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            searchCompanies(e.target.value);
                        }}
                        placeholder="Search for your company..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    {searching && (
                        <div className="absolute right-3 top-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>

                {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {searchResults.map((company) => (
                            <button
                                key={company.id}
                                onClick={() => handleCompanySelect(company)}
                                className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition flex items-center gap-4"
                            >
                                {company.logoUrl ? (
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                            src={company.logoUrl}
                                            alt={company.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-6 h-6 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{company.name}</p>
                                    {company.tagline && (
                                        <p className="text-sm text-gray-500">{company.tagline}</p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                    <div className="mt-4 p-8 text-center bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No companies found</p>
                        <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                    </div>
                )}
            </div>
        );
    }

    // Form View
    if (step === 'form' && selectedCompany) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <button
                    onClick={() => setStep('search')}
                    className="text-blue-600 hover:underline mb-6 flex items-center gap-2"
                >
                    ← Back to search
                </button>

                <div className="bg-white rounded-xl border p-6">
                    <div className="flex items-center gap-4 mb-6">
                        {selectedCompany.logoUrl ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                <Image
                                    src={selectedCompany.logoUrl}
                                    alt={selectedCompany.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-gray-500" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-semibold">{selectedCompany.name}</h2>
                            {selectedCompany.tagline && (
                                <p className="text-gray-500 text-sm">{selectedCompany.tagline}</p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Designation <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                placeholder="e.g., Senior Software Engineer"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                placeholder="e.g., Engineering"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Employment Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.employmentType}
                                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="INTERNSHIP">Internship</option>
                                <option value="FREELANCE">Freelance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return null;
}
// components/recruiter/SearchCandidates.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, UserPlus, Loader2, X, CheckCircle } from 'lucide-react';
import debounce from 'lodash/debounce';

interface Candidate {
    id: number;
    fullName: string;
    email: string;
    username: string;
    avatarUrl?: string;
    headline?: string;
    about?: string;
    location?: string;
}

interface SearchCandidatesProps {
    onSelect: (candidate: Candidate) => void;
    onClose: () => void;
    loading?: boolean;
    addedUserId?: number | null; // Track which user was just added
}

export default function SearchCandidates({ onSelect, onClose, loading, addedUserId }: SearchCandidatesProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const [addingId, setAddingId] = useState<number | null>(null);

    const searchCandidates = useCallback(
        debounce(async (query: string, offset: number = 0) => {
            if (!query || query.trim().length < 2) {
                setCandidates([]);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const token = localStorage.getItem('token');
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/team/candidates/search?q=${encodeURIComponent(query)}&limit=20&offset=${offset}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error('Failed to search candidates');
                }

                const data = await res.json();

                if (offset === 0) {
                    setCandidates(data.data || []);
                } else {
                    setCandidates(prev => [...prev, ...(data.data || [])]);
                }

                setHasMore(data.pagination?.hasMore || false);
                setPage(offset / 20 + 1);
            } catch (err: any) {
                setError(err.message || 'Failed to search');
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim().length >= 2) {
            searchCandidates(value, 0);
        } else {
            setCandidates([]);
        }
    };

    const loadMore = () => {
        if (hasMore && !isLoading) {
            searchCandidates(searchTerm, (page) * 20);
        }
    };

    const handleAdd = async (candidate: Candidate) => {
        setAddingId(candidate.id);
        await onSelect(candidate);
        // The parent component will handle the actual API call
        // and close the modal on success
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-2xl w-full my-8 relative">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">Search Candidates</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            disabled={loading}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    {loading && (
                        <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} />
                            Adding team member...
                        </div>
                    )}
                </div>

                {/* Search Input */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search by name, email, or username..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                            disabled={loading}
                        />
                    </div>
                    {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
                        <p className="text-xs text-gray-500 mt-2">Enter at least 2 characters to search</p>
                    )}
                </div>

                {/* Results */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                            ❌ {error}
                        </div>
                    )}

                    {isLoading && candidates.length === 0 && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                            <span className="ml-2 text-gray-600">Searching...</span>
                        </div>
                    )}

                    {!isLoading && candidates.length === 0 && searchTerm.trim().length >= 2 && (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3">🔍</div>
                            <p className="text-gray-500">No candidates found</p>
                            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                        </div>
                    )}

                    {!isLoading && candidates.length === 0 && searchTerm.trim().length < 2 && searchTerm.trim().length > 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">Type at least 2 characters to search</p>
                        </div>
                    )}

                    {candidates.length > 0 && (
                        <>
                            <div className="space-y-3">
                                {candidates.map((candidate) => {
                                    const isAdding = addingId === candidate.id;
                                    const isAdded = addedUserId === candidate.id;

                                    return (
                                        <div
                                            key={candidate.id}
                                            className={`flex items-center justify-between p-4 border rounded-lg transition ${isAdded
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {candidate.fullName?.charAt(0) || candidate.username?.charAt(0) || 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {candidate.fullName || candidate.username}
                                                    </p>
                                                    {candidate.headline && (
                                                        <p className="text-sm text-gray-600 truncate">{candidate.headline}</p>
                                                    )}
                                                    {candidate.email && (
                                                        <p className="text-xs text-gray-400 truncate">{candidate.email}</p>
                                                    )}
                                                    {candidate.location && (
                                                        <p className="text-xs text-gray-400">{candidate.location}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {isAdded ? (
                                                <span className="flex-shrink-0 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-1">
                                                    <CheckCircle size={16} />
                                                    Added
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleAdd(candidate)}
                                                    disabled={loading || isAdding}
                                                    className="flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    {isAdding ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={16} />
                                                            Adding...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus size={16} />
                                                            Add
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {hasMore && !loading && (
                                <button
                                    onClick={loadMore}
                                    disabled={isLoading}
                                    className="w-full mt-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                                >
                                    {isLoading ? 'Loading more...' : 'Load more'}
                                </button>
                            )}

                            <p className="text-xs text-gray-400 mt-4 text-center">
                                Showing {candidates.length} candidates
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
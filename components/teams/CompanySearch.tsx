// components/team/CompanySearch.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as teamService from '@/lib/teamService';
import { CompanySearchResult } from '@/types/team';

interface Props {
    onSelect: (company: CompanySearchResult) => void;
}

export default function CompanySearch({ onSelect }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CompanySearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (query.length >= 2) {
                const searchFunction =
                    (teamService as any).searchCompanies ??
                    (teamService as any).default;

                if (!searchFunction) {
                    console.error('searchCompanies not found in teamService module');
                    setResults([]);
                    setLoading(false);
                    return;
                }

                Promise.resolve(searchFunction(query))
                    .then(setResults)
                    .catch(console.error)
                    .finally(() => setLoading(false));
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const handleSelect = (company: CompanySearchResult) => {
        onSelect(company);
        setShowResults(false);
        setQuery('');
    };

    return (
        <div className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setLoading(true);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search for your company..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {loading && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto">
                    {results.map((company) => (
                        <button
                            key={company.id}
                            onClick={() => handleSelect(company)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 border-b last:border-0"
                        >
                            {company.logoUrl && (
                                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                    <Image
                                        src={company.logoUrl}
                                        alt={company.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-900">{company.name}</p>
                                {company.tagline && (
                                    <p className="text-sm text-gray-500">{company.tagline}</p>
                                )}
                                {company.industry && (
                                    <p className="text-xs text-gray-400">{company.industry.name}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {showResults && query.length >= 2 && results.length === 0 && !loading && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    No companies found. Try a different search.
                </div>
            )}
        </div>
    );
}
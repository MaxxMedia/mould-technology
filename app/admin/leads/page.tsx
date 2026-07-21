// app/admin/leads/page.tsx
"use client";

import { useState, useEffect } from 'react';
import {
    Package,
    User,
    Building2,
    Calendar,
    Filter,
    RefreshCw,
    TrendingUp,
    Search,
    X,
    Eye,
    Mail,
    Phone,
    Clock,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Download,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

type Lead = {
    id: number;
    source: 'CONTACT' | 'QUOTE';
    fullName: string;
    email: string;
    phoneNumber?: string;
    companyName?: string;
    message: string;
    status: 'NEW' | 'IN_PROGRESS' | 'QUALIFIED' | 'CLOSED';
    hasPackage: boolean;
    planName?: string;
    packageType?: string;
    createdAt: string;
    userId?: number;
    companyId?: number;
    supplierId?: number;
    packageDetails?: {
        plan: string;
        planLabel: string;
        expiresAt: string;
        isActive: boolean;
        type?: string;
        name?: string;
        amount?: number;
    };
};

type Summary = {
    total: number;
    withPackage: number;
    withoutPackage: number;
    byPlan: Record<string, number>;
};

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'with-package' | 'without-package'>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [summary, setSummary] = useState<Summary>({
        total: 0,
        withPackage: 0,
        withoutPackage: 0,
        byPlan: {}
    });
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchLeads();
    }, [filter, statusFilter]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            setError(null);

            let url = `${process.env.NEXT_PUBLIC_API_URL}/api/leads`;
            const params = new URLSearchParams();

            if (filter === 'with-package') params.append('packageFilter', 'with-package');
            else if (filter === 'without-package') params.append('packageFilter', 'without-package');

            if (statusFilter !== 'all') params.append('status', statusFilter);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const token = localStorage.getItem('token');
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch leads');
            }

            const data = await res.json();
            setLeads(data.data || []);
            setSummary(data.summary || { total: 0, withPackage: 0, withoutPackage: 0, byPlan: {} });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                throw new Error('Failed to update status');
            }

            await fetchLeads();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const deleteLead = async (id: number) => {
        if (!confirm('Are you sure you want to delete this lead?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to delete lead');
            }

            await fetchLeads();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'QUALIFIED': return 'bg-green-100 text-green-700 border-green-200';
            case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'NEW': return <Clock size={14} />;
            case 'IN_PROGRESS': return <AlertCircle size={14} />;
            case 'QUALIFIED': return <CheckCircle size={14} />;
            case 'CLOSED': return <X size={14} />;
            default: return <AlertCircle size={14} />;
        }
    };

    const getPackageBadge = (lead: Lead) => {
        if (lead.hasPackage) {
            return (
                <div className="flex flex-col">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <Package size={12} />
                        {lead.planName || 'Package'}
                    </span>
                    {lead.packageDetails?.isActive === false && (
                        <span className="text-xs text-red-500 mt-1">(Expired)</span>
                    )}
                    {lead.packageType && (
                        <span className="text-xs text-gray-400 mt-0.5">{lead.packageType}</span>
                    )}
                </div>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                No Package
            </span>
        );
    };

    const filteredLeads = leads.filter(lead => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            lead.fullName?.toLowerCase().includes(search) ||
            lead.email?.toLowerCase().includes(search) ||
            lead.companyName?.toLowerCase().includes(search) ||
            lead.phoneNumber?.includes(search)
        );
    });

    const toggleRow = (id: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all leads from quote requests and contact forms</p>
                </div>
                <button
                    onClick={fetchLeads}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500">Total Leads</p>
                    <p className="text-2xl font-bold">{summary.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <p className="text-sm text-gray-500">With Package</p>
                    <p className="text-2xl font-bold text-green-600">{summary.withPackage}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
                    <p className="text-sm text-gray-500">Without Package</p>
                    <p className="text-2xl font-bold text-gray-600">{summary.withoutPackage}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                    <p className="text-sm text-gray-500">Conversion Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {summary.total > 0 ? Math.round((summary.withPackage / summary.total) * 100) : 0}%
                    </p>
                </div>
            </div>

            {/* Package Breakdown */}
            {Object.keys(summary.byPlan).length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <TrendingUp size={16} />
                        Leads by Package Plan
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(summary.byPlan).map(([plan, count]) => (
                            <span key={plan} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                                <Package size={14} className="text-gray-600" />
                                {plan}: {count}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-500" />
                    <span className="text-sm font-medium">Package:</span>
                </div>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('with-package')}
                    className={`px-3 py-1 rounded-full text-sm ${filter === 'with-package' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                    With Package
                </button>
                <button
                    onClick={() => setFilter('without-package')}
                    className={`px-3 py-1 rounded-full text-sm ${filter === 'without-package' ? 'bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                    Without Package
                </button>

                <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-medium">Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All</option>
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="QUALIFIED">Qualified</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search leads..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <button
                    onClick={() => {
                        setSearchTerm('');
                        setFilter('all');
                        setStatusFilter('all');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Clear Filters
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                    ❌ {error}
                </div>
            )}

            {/* Leads Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lead
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Package
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Source
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLeads.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    No leads found
                                </td>
                            </tr>
                        ) : (
                            filteredLeads.map((lead) => (
                                <>
                                    <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow(lead.id)}>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{lead.fullName}</p>
                                                {lead.companyName && (
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Building2 size={12} />
                                                        {lead.companyName}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <Mail size={12} />
                                                {lead.email}
                                            </p>
                                            {lead.phoneNumber && (
                                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                                    <Phone size={12} />
                                                    {lead.phoneNumber}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getPackageBadge(lead)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateStatus(lead.id, e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}
                                            >
                                                <option value="NEW">New</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="QUALIFIED">Qualified</option>
                                                <option value="CLOSED">Closed</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">
                                                {lead.source === 'QUOTE' ? 'Quote Request' : 'Contact Form'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedLead(lead);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteLead(lead.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <button
                                                    onClick={() => toggleRow(lead.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                    title="Expand"
                                                >
                                                    {expandedRows.has(lead.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRows.has(lead.id) && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-700">Message:</p>
                                                    <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                                                        {lead.message}
                                                    </p>
                                                    {lead.packageDetails && (
                                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Package Details</p>
                                                                <p className="text-sm font-medium">{lead.packageDetails.planLabel}</p>
                                                                <p className="text-xs text-gray-500">Type: {lead.packageDetails.type || 'Subscription'}</p>
                                                                {lead.packageDetails.amount && (
                                                                    <p className="text-xs text-gray-500">Amount: ₹{lead.packageDetails.amount}</p>
                                                                )}
                                                                {lead.packageDetails.expiresAt && (
                                                                    <p className="text-xs text-gray-500">
                                                                        Expires: {new Date(lead.packageDetails.expiresAt).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Lead Info</p>
                                                                <p className="text-sm">Source: {lead.source}</p>
                                                                <p className="text-sm">ID: #{lead.id}</p>
                                                                <p className="text-sm">Created: {new Date(lead.createdAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Lead Details Modal */}
            {showDetailsModal && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Lead Details</h3>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedLead(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="font-medium">{selectedLead.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{selectedLead.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{selectedLead.phoneNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Company</p>
                                    <p className="font-medium">{selectedLead.companyName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Source</p>
                                    <p className="font-medium">{selectedLead.source}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                                        {selectedLead.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Package</p>
                                    {getPackageBadge(selectedLead)}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created</p>
                                    <p className="font-medium">{new Date(selectedLead.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Message</p>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-1">
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedLead.message}</p>
                                </div>
                            </div>
                            {selectedLead.packageDetails && (
                                <div>
                                    <p className="text-sm text-gray-500">Package Details</p>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-1 space-y-1">
                                        <p><span className="font-medium">Plan:</span> {selectedLead.packageDetails.planLabel}</p>
                                        <p><span className="font-medium">Type:</span> {selectedLead.packageDetails.type || 'Subscription'}</p>
                                        {selectedLead.packageDetails.amount && (
                                            <p><span className="font-medium">Amount:</span> ₹{selectedLead.packageDetails.amount}</p>
                                        )}
                                        {selectedLead.packageDetails.expiresAt && (
                                            <p><span className="font-medium">Expires:</span> {new Date(selectedLead.packageDetails.expiresAt).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedLead(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedLead) {
                                        const statuses = ['NEW', 'IN_PROGRESS', 'QUALIFIED', 'CLOSED'];
                                        const currentIndex = statuses.indexOf(selectedLead.status);
                                        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                        updateStatus(selectedLead.id, nextStatus);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
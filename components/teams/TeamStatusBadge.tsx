// components/teams/TeamStatusBadge.tsx

'use client';

interface Props {
    status: string;
    className?: string;
}

const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
    PENDING: {
        label: 'Pending Approval',
        className: 'bg-yellow-100 text-yellow-800',
        icon: '⏳',
    },
    ACTIVE: {
        label: 'Verified',
        className: 'bg-green-100 text-green-800',
        icon: '✅',
    },
    REJECTED: {
        label: 'Rejected',
        className: 'bg-red-100 text-red-800',
        icon: '❌',
    },
    FORMER: {
        label: 'Former',
        className: 'bg-gray-100 text-gray-800',
        icon: '📤',
    },
};

export default function TeamStatusBadge({ status, className = '' }: Props) {
    const normalizedStatus = status?.toUpperCase() || 'PENDING';
    const config = statusConfig[normalizedStatus] || statusConfig.PENDING;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.className} ${className}`}>
            <span>{config.icon}</span>
            {config.label}
        </span>
    );
}
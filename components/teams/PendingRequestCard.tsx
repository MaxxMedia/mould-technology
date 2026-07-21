// components/team/PendingRequestCard.tsx

import { useState } from 'react';
import Image from 'next/image';
import { TeamMember } from '@/types/team';

interface Props {
    request: TeamMember;
    onApprove: (id: number) => void;
    onReject: (id: number, reason: string) => void;
}

export default function PendingRequestCard({ request, onApprove, onReject }: Props) {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await onApprove(request.id);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        setIsProcessing(true);
        try {
            await onReject(request.id, rejectionReason);
            setShowRejectModal(false);
            setRejectionReason('');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl border p-6 hover:shadow-md transition">
                <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        {request.user.avatarUrl ? (
                            <Image
                                src={request.user.avatarUrl}
                                alt={request.user.fullName}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                {request.user.fullName.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                    {request.user.fullName}
                                </h3>
                                <p className="text-gray-600 text-sm">{request.designation}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {request.department}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {request.employmentType}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        ⏳ Pending
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ✅ Approve
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        </div>

                        {request.user.headline && (
                            <p className="text-sm text-gray-500 mt-1">{request.user.headline}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                            Requested on {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Reject Request</h3>
                        <p className="text-gray-600 mb-4">
                            Please provide a reason for rejecting {request.user.fullName}'s request.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleReject}
                                disabled={isProcessing}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
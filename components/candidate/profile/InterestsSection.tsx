"use client";

import { Heart, Pencil } from "lucide-react";

type Interest = {
    id: number;
    name: string;
    category?: string;
    followersCount?: number;
    imageUrl?: string;
};

interface Props {
    editable?: boolean;
    interests: Interest[];
    onEditClick?: () => void; // Add this
}

export default function InterestsSection({
    editable = false,
    interests,
    onEditClick, // Add this
}: Props) {
    return (
        <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm relative">
            {/* Show edit button when not editable */}
            {!editable && onEditClick && (
                <button
                    onClick={onEditClick}
                    className="absolute top-4 right-4"
                >
                    <Pencil size={16} className="text-gray-400 hover:text-gray-700" />
                </button>
            )}

            {editable && (
                <button className="absolute top-4 right-4">
                    <Pencil size={16} className="text-gray-400 hover:text-gray-700" />
                </button>
            )}

            <h2 className="text-lg font-semibold mb-5">Interests</h2>

            {interests.length === 0 ? (
                <p className="text-sm text-gray-500">No interests added.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {interests.map((interest) => (
                        <div
                            key={interest.id}
                            className="flex items-center gap-3 border rounded-lg p-4 hover:shadow-sm transition"
                        >
                            {interest.imageUrl ? (
                                <img
                                    src={interest.imageUrl}
                                    className="w-12 h-12 rounded-lg object-cover"
                                    alt={interest.name}
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                                    <Heart className="text-pink-600" size={20} />
                                </div>
                            )}

                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">{interest.name}</h3>
                                {interest.category && (
                                    <p className="text-xs text-gray-500">{interest.category}</p>
                                )}
                                {interest.followersCount !== undefined && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {interest.followersCount.toLocaleString()} followers
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
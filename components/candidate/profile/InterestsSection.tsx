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
                    {interests.map((interest) => {
                        const name = interest.name || (interest as any).title || (interest as any).interestName || "Interest";
                        const category = interest.category || (interest as any).type || "";

                        return (
                            <div
                                key={interest.id || Math.random()}
                                className="flex items-center gap-3 border border-[#e0e0e0] rounded-xl p-4 hover:shadow-sm transition bg-white"
                            >
                                {interest.imageUrl ? (
                                    <img
                                        src={interest.imageUrl}
                                        className="w-12 h-12 rounded-lg object-cover"
                                        alt={name}
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-[#0F5B78]/10 text-[#0F5B78] flex items-center justify-center shrink-0">
                                        <Heart size={20} />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm text-[#000000] truncate">{name}</h3>
                                    {category && (
                                        <p className="text-xs text-[#5A5F69] mt-0.5 truncate">{category}</p>
                                    )}
                                    {interest.followersCount !== undefined && (
                                        <p className="text-xs text-[#5A5F69] mt-1">
                                            {interest.followersCount.toLocaleString()} followers
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
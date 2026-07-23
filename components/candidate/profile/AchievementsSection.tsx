"use client";

import { Trophy, Pencil } from "lucide-react";

type Achievement = {
    id: number;
    title: string;
    description?: string;
    issuer?: string;
    achievementDate?: string;
};

interface Props {
    editable?: boolean;
    achievements: Achievement[];
}

export default function AchievementsSection({
    editable = false,
    achievements,
}: Props) {
    return (
        <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm relative">

            {editable && (
                <button className="absolute top-4 right-4">
                    <Pencil
                        size={16}
                        className="text-gray-400 hover:text-gray-700"
                    />
                </button>
            )}

            <h2 className="text-lg font-semibold mb-5">
                Achievements
            </h2>

            {achievements.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No achievements added.
                </p>
            ) : (
                <div className="space-y-5">

                    {achievements.map((achievement) => (

                        <div
                            key={achievement.id}
                            className="flex gap-4 border-b last:border-none pb-5"
                        >

                            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">

                                <Trophy
                                    size={22}
                                    className="text-amber-700"
                                />

                            </div>

                            <div className="flex-1">

                                <h3 className="font-semibold">
                                    {achievement.title}
                                </h3>

                                {achievement.issuer && (
                                    <p className="text-sm text-gray-600">
                                        {achievement.issuer}
                                    </p>
                                )}

                                {achievement.achievementDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(
                                            achievement.achievementDate
                                        ).getFullYear()}
                                    </p>
                                )}

                                {achievement.description && (
                                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                                        {achievement.description}
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
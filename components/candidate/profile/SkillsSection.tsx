"use client";

import { Pencil } from "lucide-react";

type Skill = {
  id: number;
  name: string;
  level?: string;
  endorsementsCount?: number;
};

interface SkillsSectionProps {
  editable?: boolean;
  skills: Skill[];
  onEditClick?: () => void;
}

export default function SkillsSection({
  editable = false,
  skills = [],
  onEditClick,
}: SkillsSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 shadow-sm relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#000000]">
          Skills {skills.length > 0 && <span className="text-[#5A5F69] font-normal">({skills.length})</span>}
        </h2>

        {(!editable && onEditClick) && (
          <button
            onClick={onEditClick}
            title="Edit Skills"
            className="text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <Pencil size={16} />
          </button>
        )}

        {editable && (
          <button
            className="text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      {/* Empty */}
      {skills.length === 0 ? (
        <p className="text-sm text-[#5A5F69] italic">No skills added yet.</p>
      ) : (
        /* Horizontal Skills Layout */
        <div className="flex flex-wrap gap-2.5">
          {skills.map((skill) => (
            <div
              key={skill.id || Math.random()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-gray-200 bg-white hover:border-[#0F5B78] hover:bg-[#0F5B78]/5 transition-all shadow-2xs group"
            >
              <span className="font-bold text-sm text-[#000000]">{skill.name}</span>
              {skill.level && (
                <span className="text-xs text-[#5A5F69] bg-gray-100 px-2.5 py-0.5 rounded-full font-medium">
                  {skill.level}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
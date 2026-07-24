"use client";

import { Pencil } from "lucide-react";

type Language = {
  id: number;
  language: string;
  proficiency?: string;
};

interface Props {
  editable?: boolean;
  languages: Language[];
  onEditClick?: () => void;
}

export default function LanguagesSection({
  editable = false,
  languages,
  onEditClick,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 shadow-sm relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#000000]">
          Languages {languages.length > 0 && <span className="text-[#5A5F69] font-normal">({languages.length})</span>}
        </h2>

        {!editable && onEditClick && (
          <button
            onClick={onEditClick}
            title="Edit Languages"
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

      {languages.length === 0 ? (
        <p className="text-sm text-[#5A5F69] italic">No languages added.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {languages.map((lang) => (
            <div key={lang.id || Math.random()} className="py-3.5 first:pt-0 last:pb-0">
              <h3 className="font-bold text-sm text-[#000000]">
                {lang.language}
              </h3>
              {lang.proficiency && (
                <p className="text-xs text-[#5A5F69] mt-0.5 font-medium">
                  {lang.proficiency}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
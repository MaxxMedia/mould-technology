"use client";

import { GraduationCap, Pencil, Calendar } from "lucide-react";

type Education = {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number | string;
  endYear?: number | string;
  grade?: string;
  description?: string;
};

interface Props {
  editable?: boolean;
  education: Education[];
  onEditClick?: () => void;
}

export default function EducationSection({
  editable = false,
  education = [],
  onEditClick,
}: Props) {
  const eduList = Array.isArray(education) ? education : [];

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 shadow-sm relative">
      {/* Show edit button when owner */}
      {(!editable && onEditClick) && (
        <button
          onClick={onEditClick}
          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          title="Edit Education"
        >
          <Pencil size={16} />
        </button>
      )}

      {editable && (
        <button className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer">
          <Pencil size={16} />
        </button>
      )}

      <h2 className="text-lg font-bold text-[#000000] mb-5">Education</h2>

      {eduList.length === 0 ? (
        <p className="text-sm text-[#5A5F69] italic">No education added yet.</p>
      ) : (
        <div className="space-y-5 divide-y divide-gray-100">
          {eduList.map((item) => {
            const start = item.startYear ? String(item.startYear) : "";
            const end = item.endYear ? String(item.endYear) : "";
            const dateRange = start && end ? `${start} - ${end}` : start || end || "";

            return (
              <div key={item.id || Math.random()} className="flex gap-4 pt-5 first:pt-0">
                <div className="w-12 h-12 rounded-lg bg-[#0F5B78]/10 text-[#0F5B78] flex items-center justify-center shrink-0 border border-[#0F5B78]/20">
                  <GraduationCap size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-[#000000] leading-snug">
                    {item.institution}
                  </h3>

                  <p className="text-sm font-medium text-[#000000] mt-0.5">
                    {item.degree}
                    {item.fieldOfStudy && ` · ${item.fieldOfStudy}`}
                  </p>

                  {dateRange && (
                    <p className="text-xs text-[#5A5F69] font-medium mt-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#0F5B78]" />
                      <span>{dateRange}</span>
                    </p>
                  )}

                  {item.grade && (
                    <p className="text-xs text-[#5A5F69] font-medium mt-1">
                      Grade / CGPA: <span className="text-[#000000] font-semibold">{item.grade}</span>
                    </p>
                  )}

                  {item.description && (
                    <p className="text-sm text-[#5A5F69] leading-relaxed mt-2.5 whitespace-pre-line">
                      {item.description}
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
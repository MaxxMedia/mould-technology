"use client";

import { Pencil, Building2 } from "lucide-react";

type Experience = {
  id: number;
  title: string;
  employmentType?: string;
  location?: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  currentlyWorking?: boolean;
  company?: {
    id: number;
    name: string;
    logo?: string;
  };
};

interface Props {
  editable?: boolean;
  experiences: Experience[];
  onEditClick?: () => void; // Add this
}

export default function ExperienceSection({
  editable = false,
  experiences,
  onEditClick, // Add this
}: Props) {
  return (
    <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm relative">
      {/* Show edit button when not editable */}
      {!editable && onEditClick && (
        <button
          onClick={onEditClick}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <Pencil size={16} />
        </button>
      )}

      {editable && (
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <Pencil size={16} />
        </button>
      )}

      <h2 className="text-lg font-semibold mb-5">Experience</h2>

      {experiences.length === 0 ? (
        <p className="text-sm text-gray-500">No experience added.</p>
      ) : (
        <div className="space-y-6 divide-y divide-gray-100">
          {experiences.map((exp) => (
            <div key={exp.id} className="flex gap-4 pt-5 first:pt-0">
              <div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center">
                <Building2 className="text-[#0a66c2]" size={22} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                <p className="text-sm text-gray-700">{exp.company?.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(exp.startDate).getFullYear()} -{" "}
                  {exp.currentlyWorking
                    ? "Present"
                    : exp.endDate
                      ? new Date(exp.endDate).getFullYear()
                      : ""}
                </p>
                {exp.location && (
                  <p className="text-xs text-gray-500">{exp.location}</p>
                )}
                {exp.description && (
                  <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                    {exp.description}
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
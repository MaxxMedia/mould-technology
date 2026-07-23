"use client";

import { GraduationCap, Pencil } from "lucide-react";

type Education = {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  grade?: string;
  description?: string;
};

interface Props {
  editable?: boolean;
  education: Education[];
}

export default function EducationSection({
  editable = false,
  education,
}: Props) {
  return (
    <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm relative">

      {editable && (
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <Pencil size={16} />
        </button>
      )}

      <h2 className="text-lg font-semibold mb-5">
        Education
      </h2>

      {education.length === 0 ? (
        <p className="text-sm text-gray-500">
          No education added.
        </p>
      ) : (
        <div className="space-y-6 divide-y divide-gray-100">

          {education.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 pt-5 first:pt-0"
            >
              <div className="w-12 h-12 rounded-md bg-green-100 flex items-center justify-center">
                <GraduationCap
                  size={22}
                  className="text-green-700"
                />
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-gray-900">
                  {item.institution}
                </h3>

                <p className="text-sm text-gray-700">
                  {item.degree}
                  {item.fieldOfStudy &&
                    ` • ${item.fieldOfStudy}`}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {item.startYear} - {item.endYear}
                </p>

                {item.grade && (
                  <p className="text-xs text-gray-500">
                    Grade: {item.grade}
                  </p>
                )}

                {item.description && (
                  <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                    {item.description}
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
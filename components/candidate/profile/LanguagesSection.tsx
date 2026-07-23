"use client";

import { Languages, Pencil } from "lucide-react";

type Language = {
  id: number;
  language: string;
  proficiency?: string;
};

interface Props {
  editable?: boolean;
  languages: Language[];
}

export default function LanguagesSection({
  editable = false,
  languages,
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
        Languages
      </h2>

      {languages.length === 0 ? (
        <p className="text-sm text-gray-500">
          No languages added.
        </p>
      ) : (
        <div className="space-y-4">

          {languages.map((lang) => (

            <div
              key={lang.id}
              className="flex items-center gap-4 border-b last:border-none pb-4"
            >

              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">

                <Languages
                  size={18}
                  className="text-[#0a66c2]"
                />

              </div>

              <div className="flex-1">

                <h3 className="font-semibold">
                  {lang.language}
                </h3>

                {lang.proficiency && (
                  <p className="text-sm text-gray-500">
                    {lang.proficiency}
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
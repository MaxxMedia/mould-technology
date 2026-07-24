"use client";

import { Pencil, Building2 } from "lucide-react";

type Experience = {
  id: number;
  title?: string;
  designation?: string;
  employmentType?: string;
  location?: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  currentlyWorking?: boolean;
  companyName?: string;
  company?: any;
};

interface Props {
  editable?: boolean;
  experiences: Experience[];
  onEditClick?: () => void;
}

function getExpTitle(exp: Experience): string {
  return exp.title || exp.designation || "Position";
}

function getExpCompanyName(exp: Experience): string {
  if (typeof exp.companyName === "string" && exp.companyName.trim()) return exp.companyName;
  if (typeof exp.company === "string" && exp.company.trim()) return exp.company;
  if (exp.company && typeof exp.company === "object") return exp.company.name || exp.company.companyName || "";
  return "";
}

function formatDuration(startDateStr: string, endDateStr?: string | null, currentlyWorking?: boolean): string {
  if (!startDateStr) return "";
  const start = new Date(startDateStr);
  const end = currentlyWorking || !endDateStr ? new Date() : new Date(endDateStr);

  if (isNaN(start.getTime())) return "";

  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  if (totalMonths <= 0) return "";

  const yrs = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;

  const parts = [];
  if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
  if (mos > 0) parts.push(`${mos} mo${mos > 1 ? "s" : ""}`);

  return parts.join(" ");
}

function formatDateRange(startDateStr: string, endDateStr?: string | null, currentlyWorking?: boolean): string {
  if (!startDateStr) return "";
  const start = new Date(startDateStr);
  const startFormatted = !isNaN(start.getTime())
    ? start.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : startDateStr;

  if (currentlyWorking) {
    return `${startFormatted} - Present`;
  }
  if (!endDateStr) {
    return startFormatted;
  }
  const end = new Date(endDateStr);
  const endFormatted = !isNaN(end.getTime())
    ? end.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : endDateStr;

  return `${startFormatted} - ${endFormatted}`;
}

export default function ExperienceSection({
  editable = false,
  experiences,
  onEditClick,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 shadow-sm relative">
      {/* Edit button */}
      {!editable && onEditClick && (
        <button
          onClick={onEditClick}
          title="Edit Experience"
          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <Pencil size={16} />
        </button>
      )}

      {editable && (
        <button
          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <Pencil size={16} />
        </button>
      )}

      <h2 className="text-lg font-bold text-[#000000] mb-5">Experience</h2>

      {experiences.length === 0 ? (
        <p className="text-sm text-[#5A5F69] italic">No experience added.</p>
      ) : (
        <div className="space-y-6 divide-y divide-gray-100">
          {experiences.map((exp) => {
            const companyName = getExpCompanyName(exp);
            const title = getExpTitle(exp);
            const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking);
            const duration = formatDuration(exp.startDate, exp.endDate, exp.currentlyWorking);

            return (
              <div key={exp.id || Math.random()} className="flex gap-4 pt-5 first:pt-0">
                <div className="w-12 h-12 rounded-lg bg-[#0F5B78]/10 text-[#0F5B78] flex items-center justify-center shrink-0">
                  <Building2 size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Job Title / Designation */}
                  <h3 className="font-bold text-base text-[#000000] leading-snug">{title}</h3>

                  {/* Company Name & Employment Type */}
                  {companyName && (
                    <p className="text-sm font-semibold text-[#000000] mt-0.5">
                      {companyName}
                      {exp.employmentType && (
                        <span className="font-normal text-[#5A5F69]"> · {exp.employmentType}</span>
                      )}
                    </p>
                  )}

                  {/* Date Range & Duration */}
                  {(dateRange || duration) && (
                    <p className="text-xs text-[#5A5F69] mt-1 font-medium">
                      {dateRange}
                      {duration && <span> · {duration}</span>}
                    </p>
                  )}

                  {/* Location */}
                  {exp.location && (
                    <p className="text-xs text-[#5A5F69] mt-0.5">
                      {exp.location}
                    </p>
                  )}

                  {/* Description (Existing Design) */}
                  {exp.description && (
                    <p className="text-sm text-[#000000] mt-3 whitespace-pre-line leading-relaxed">
                      {exp.description}
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
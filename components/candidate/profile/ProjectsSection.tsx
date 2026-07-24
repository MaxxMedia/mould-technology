"use client";

import { Pencil, ExternalLink, FolderKanban, Calendar } from "lucide-react";

type Project = {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  projectUrl?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string;
};

interface Props {
  editable?: boolean;
  projects: Project[];
  onEditClick?: () => void;
}

export default function ProjectsSection({
  editable = false,
  projects,
  onEditClick,
}: Props) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
      const [y, m] = clean.split("-");
      if (y && m) {
        const date = new Date(parseInt(y), parseInt(m) - 1, 1);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
      return clean;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 shadow-sm relative">
      {/* Show edit button when owner */}
      {(!editable && onEditClick) && (
        <button
          onClick={onEditClick}
          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          title="Edit Projects"
        >
          <Pencil size={16} />
        </button>
      )}

      {editable && (
        <button className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer">
          <Pencil size={16} />
        </button>
      )}

      <h2 className="text-lg font-bold text-[#000000] mb-5">Projects</h2>

      {projects.length === 0 ? (
        <p className="text-sm text-[#5A5F69]">No projects added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project) => {
            const startFormatted = formatDate(project.startDate);
            const endFormatted = project.endDate ? formatDate(project.endDate) : "Present";
            const dateRange = startFormatted ? `${startFormatted} - ${endFormatted}` : "";

            return (
              <div
                key={project.id || Math.random()}
                className="border border-[#e0e0e0] rounded-xl overflow-hidden hover:shadow-md transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  {project.imageUrl ? (
                    <div className="h-44 bg-gray-100 overflow-hidden border-b border-gray-100">
                      <img
                        src={project.imageUrl}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        alt={project.title}
                      />
                    </div>
                  ) : (
                    <div className="h-44 bg-[#0F5B78]/5 border-b border-gray-100 flex flex-col items-center justify-center text-[#0F5B78]">
                      <FolderKanban size={40} className="opacity-80 mb-1" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#0F5B78]/70">Project</span>
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-[#000000] leading-snug">
                        {project.title}
                      </h3>
                    </div>

                    {dateRange && (
                      <p className="text-xs text-[#5A5F69] font-medium flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#0F5B78]" />
                        <span>{dateRange}</span>
                      </p>
                    )}

                    {project.description && (
                      <p className="text-sm text-[#5A5F69] leading-relaxed whitespace-pre-line line-clamp-4">
                        {project.description}
                      </p>
                    )}

                    {project.technologies && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.technologies.split(",").map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-[#0F5B78]/10 text-[#0F5B78] font-semibold px-2.5 py-1 rounded-full border border-[#0F5B78]/20"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {project.projectUrl && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-50">
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5B78] hover:underline bg-[#0F5B78]/5 px-4 py-2 rounded-full border border-[#0F5B78]/20 transition-colors"
                    >
                      <span>Show project</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
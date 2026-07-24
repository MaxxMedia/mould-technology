"use client";

import { Pencil, ExternalLink, FolderKanban } from "lucide-react";

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
  onEditClick?: () => void; // Add this
}

export default function ProjectsSection({
  editable = false,
  projects,
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

      <h2 className="text-lg font-semibold mb-6">Projects</h2>

      {projects.length === 0 ? (
        <p className="text-sm text-gray-500">No projects added.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition"
            >
              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  className="w-full h-44 object-cover"
                  alt={project.title}
                />
              ) : (
                <div className="h-44 bg-gray-100 flex items-center justify-center">
                  <FolderKanban size={42} className="text-gray-400" />
                </div>
              )}

              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{project.title}</h3>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                )}
                {project.technologies && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.technologies.split(",").map((tech) => (
                      <span
                        key={tech}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#0a66c2] font-medium mt-4 hover:underline"
                  >
                    View Project
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
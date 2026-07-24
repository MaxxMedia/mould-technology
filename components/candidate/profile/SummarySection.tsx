"use client";

import { useState } from "react";
import { Pencil, ExternalLink, FolderKanban } from "lucide-react";

interface Props {
  aboutText: string;
  websiteUrl?: string;
  projects?: any[];
  isOwner?: boolean;
  onEditClick?: () => void;
  onSeeAllProjects?: () => void;
}

export default function SummarySection({
  aboutText,
  websiteUrl,
  projects = [],
  isOwner = false,
  onEditClick,
  onSeeAllProjects,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = aboutText.length > 280;
  const displayText = shouldTruncate && !isExpanded ? `${aboutText.slice(0, 280)}...` : aboutText;

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 shadow-sm relative">
      {/* Edit Pencil Icon */}
      {isOwner && onEditClick && (
        <button
          onClick={onEditClick}
          title="Edit About"
          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <Pencil size={16} />
        </button>
      )}

      {/* Title */}
      <h2 className="text-lg font-bold text-[#000000] mb-3">About</h2>

      {/* About Text Body */}
      {aboutText ? (
        <div className="text-sm text-[#000000] leading-relaxed whitespace-pre-line">
          <span>{displayText}</span>
          {shouldTruncate && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-[#5A5F69] hover:text-[#0F5B78] font-bold text-sm ml-1 cursor-pointer hover:underline"
            >
              ...see more
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-[#5A5F69] italic">No description added yet.</p>
      )}

      {/* Website Link */}
      {websiteUrl && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5B78] hover:underline bg-[#0F5B78]/5 px-3.5 py-1.5 rounded-full border border-[#0F5B78]/20 transition-colors"
          >
            <ExternalLink size={13} />
            <span>{websiteUrl.replace(/^https?:\/\//, '')}</span>
          </a>
        </div>
      )}

      {/* Real Projects Attachments (LinkedIn Top Media Preview) */}
      {projects.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <h4 className="text-xs font-bold text-[#5A5F69] uppercase tracking-wider mb-3">Featured Projects</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {projects.slice(0, 3).map((proj: any) => (
              <div
                key={proj.id}
                onClick={onSeeAllProjects}
                className="group cursor-pointer border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-all"
              >
                <div className="h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {proj.imageUrl ? (
                    <img
                      src={proj.imageUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <FolderKanban className="text-[#5A5F69]" size={28} />
                  )}
                </div>
                <div className="p-2.5 bg-white">
                  <h5 className="text-xs font-bold text-[#000000] group-hover:text-[#0F5B78] transition-colors truncate">
                    {proj.title}
                  </h5>
                  {proj.description && (
                    <p className="text-[11px] text-[#5A5F69] line-clamp-1 mt-0.5">
                      {proj.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {onSeeAllProjects && projects.length > 3 && (
            <button
              onClick={onSeeAllProjects}
              className="w-full text-center text-xs font-bold text-[#0F5B78] hover:underline mt-3 pt-2 border-t border-gray-100 cursor-pointer"
            >
              See all projects →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

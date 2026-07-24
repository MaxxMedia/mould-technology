"use client";

import { Pencil, Mail, Globe } from "lucide-react";

interface ContactCardProps {
  candidate?: any;
  isOwner?: boolean;
  onEditClick?: () => void;
}

export default function ContactCard({ candidate, isOwner, onEditClick }: ContactCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 shadow-sm relative">
      {isOwner && onEditClick && (
        <button
          onClick={onEditClick}
          title="Edit Contact & Social Links"
          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <Pencil size={16} />
        </button>
      )}

      <h3 className="text-base font-bold text-[#000000] mb-4">Contact & Socials</h3>

      <div className="space-y-3.5 text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0F5B78]/10 flex items-center justify-center text-[#0F5B78] shrink-0">
            <Mail size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#5A5F69] font-medium">Email</p>
            <p className="font-semibold text-[#000000] truncate">
              {candidate?.email || "Not specified"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0F5B78]/10 flex items-center justify-center text-[#0F5B78] shrink-0">
            <Globe size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#5A5F69] font-medium">Website</p>
            {candidate?.websiteUrl ? (
              <a
                href={candidate.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#0F5B78] hover:underline truncate block"
              >
                {candidate.websiteUrl}
              </a>
            ) : (
              <p className="font-semibold text-[#5A5F69] truncate">Not specified</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

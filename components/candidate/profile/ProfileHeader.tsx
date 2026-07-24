"use client";

import { Pencil, Camera, CheckCircle, MapPin, UserPlus, MessageSquare } from "lucide-react";
import CandidateAvatar from "@/components/candidate/CandidateAvatar";

interface ProfileHeaderProps {
  displayName: string;
  displayHeadline: string;
  displayCompany: string;
  displayEducation: string;
  displayLocation: string;
  avatarUrl?: string;
  isOwner?: boolean;
  onEditIntroClick: () => void;
}

export default function ProfileHeader({
  displayName,
  displayHeadline,
  displayCompany,
  displayEducation,
  displayLocation,
  avatarUrl,
  isOwner,
  onEditIntroClick,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-sm overflow-hidden mb-4 relative">
      {/* Cover Banner using Secondary Brand Color #0F5B78 */}
      <div className="h-36 sm:h-44 bg-gradient-to-r from-[#0F5B78] via-[#0F5B78] to-[#B40F24] relative">
        {isOwner && (
          <button
            onClick={onEditIntroClick}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow text-[#5A5F69] hover:text-[#000000] transition-colors flex items-center gap-1.5 text-xs font-semibold px-3 cursor-pointer"
            title="Edit Banner & Intro"
          >
            <Pencil size={14} />
            <span>Edit Banner</span>
          </button>
        )}
      </div>

      {/* Profile Header Main */}
      <div className="px-6 pb-6 relative">
        {/* Avatar */}
        <div className="absolute -top-16 left-6 z-10">
          <div className="relative">
            <CandidateAvatar
              avatarUrl={avatarUrl}
              name={displayName}
              size="xl"
              borderClassName="border-4 border-white shadow-md"
            />
            {isOwner && (
              <button
                onClick={onEditIntroClick}
                className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Edit Photo"
              >
                <Camera size={13} className="text-[#5A5F69]" />
              </button>
            )}
          </div>
        </div>

        {/* Header Actions & Text */}
        <div className="pt-14 sm:pt-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#000000]">{displayName}</h1>
              <CheckCircle size={20} className="text-[#0F5B78] fill-[#0F5B78]/10" />
              {isOwner && (
                <button
                  onClick={onEditIntroClick}
                  className="text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer ml-1"
                  title="Edit Intro"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
            {displayHeadline && (
              <p className="text-sm sm:text-base text-[#5A5F69] font-medium mt-1 max-w-2xl leading-relaxed">
                {displayHeadline}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#5A5F69] mt-2 flex-wrap">
              {displayCompany && <span className="font-semibold text-[#000000]">{displayCompany}</span>}
              {displayCompany && displayEducation && <span>•</span>}
              {displayEducation && <span>{displayEducation}</span>}
              {(displayCompany || displayEducation) && displayLocation && <span>•</span>}
              {displayLocation && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-[#5A5F69]" />
                  {displayLocation}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons using #0F5B78 */}
          <div className="flex items-center gap-2 self-start flex-wrap mt-2 md:mt-0">
            {isOwner ? (
              <button
                onClick={onEditIntroClick}
                className="bg-[#0F5B78] hover:bg-[#0b445a] text-white px-5 py-2 rounded-full font-semibold text-sm transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            ) : (
              <>
                <button className="bg-[#0F5B78] hover:bg-[#0b445a] text-white px-5 py-2 rounded-full font-semibold text-sm transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <UserPlus size={16} />
                  Connect
                </button>
                <button className="border-2 border-[#0F5B78] text-[#0F5B78] hover:bg-[#0F5B78]/10 px-5 py-2 rounded-full font-semibold text-sm transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <MessageSquare size={16} />
                  Message
                </button>
                <button className="border border-gray-300 hover:bg-gray-100 text-[#5A5F69] px-4 py-2 rounded-full font-semibold text-sm transition-colors cursor-pointer">
                  More...
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

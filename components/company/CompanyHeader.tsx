"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, MapPin } from "lucide-react";

type Company = {
  id: number;
  name: string;
  slug: string;
  tagline?: string;
  industry?: string;
  location?: string;
  companySize?: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  followers: number;
  isVerified: boolean;
};

type CompanyHeaderProps = {
  company: Company;
  isFollowing?: boolean;
  onFollow?: () => void;
};

export default function CompanyHeader({
  company,
  isFollowing = false,
  onFollow,
}: CompanyHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">

      {/* Banner */}
      <div
        className="h-48 bg-gradient-to-r from-slate-800 to-slate-900"
        style={
          company.coverImageUrl
            ? {
                backgroundImage: `url(${company.coverImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      />

      <div className="p-6 flex gap-6">

        <div className="relative w-28 h-28 -mt-16">
          <Image
            src={
              company.logoUrl ||
              "https://ui-avatars.com/api/?name=Company"
            }
            alt={company.name}
            fill
            className="rounded-lg border bg-white object-contain"
          />
        </div>

        <div className="flex-1">

          <h1 className="text-2xl font-bold flex items-center gap-2">
            {company.name}

            {company.isVerified && (
              <CheckCircle
                size={18}
                className="text-blue-600"
              />
            )}
          </h1>

          {company.tagline && (
            <p className="mt-1 text-gray-700">
              {company.tagline}
            </p>
          )}

          <div className="mt-2 text-sm text-gray-500 space-y-1">

            {company.industry && (
              <p>{company.industry}</p>
            )}

            {company.location && (
              <p className="flex items-center gap-1">
                <MapPin size={14} />
                {company.location}
              </p>
            )}

            {company.companySize && (
              <p>{company.companySize}</p>
            )}

            <p>{company.followers} followers</p>

          </div>

          {/* ACTIONS - Follow and Visit Website */}
          <div className="flex gap-3 mt-4">
            {onFollow && (
              <button
                onClick={onFollow}
                className={`px-5 py-1.5 rounded-full text-sm font-medium ${
                  isFollowing
                    ? "border text-gray-700"
                    : "bg-blue-600 text-white"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}

            {company.website && (
              <Link
                href={company.website}
                target="_blank"
                className="border px-5 py-1.5 rounded-full text-sm"
              >
                Visit website
              </Link>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
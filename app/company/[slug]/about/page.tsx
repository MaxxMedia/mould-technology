"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Calendar,
  Target,
  Eye,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import CompanyTabs from "@/components/company/CompanyTabs";
import CompanyHeader from "@/components/company/CompanyHeader";

type Company = {
  id: number;
  name: string;
  slug: string;
  tagline?: string;
  logoUrl?: string;
  isVerified: boolean; // Changed from optional to required
  description?: string;
  industry?: string;
  location?: string;
  companySize?: string;
  website?: string;
  founded?: number;
  followers: number;
  mission?: string;
  vision?: string;
  specialties?: string[];
};

export default function AboutPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    async function loadCompany() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${slug}`
        );
        const data = await res.json();
        setCompany(data);

        // Check if user is following this company
        const token = localStorage.getItem("token");
        if (token && data.id) {
          const followStatusRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${data.id}/follow-status`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (followStatusRes.ok) {
            const statusData = await followStatusRes.json();
            setFollowing(statusData.isFollowing);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [slug]);

  async function toggleFollow() {
    if (!company) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login required");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${company.id}/follow`,
        {
          method: following ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setFollowing(!following);
        setCompany((prev) =>
          prev
            ? {
                ...prev,
                followers: following ? prev.followers - 1 : prev.followers + 1,
              }
            : prev
        );
      } else if (response.status === 409) {
        setFollowing(true);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Action failed");
      }
    } catch (error) {
      console.error("Follow toggle error:", error);
      alert("An error occurred");
    }
  }

  if (loading) return <div className="p-10">Loading...</div>;
  if (!company) return <div className="p-10">Company not found.</div>;

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-[1128px] mx-auto px-4 py-6 space-y-6">
        
        <CompanyHeader 
          company={company}
          isFollowing={following}
          onFollow={toggleFollow}
        />

        <CompanyTabs slug={company.slug} active="about" />

        <div className="space-y-6">
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-700 leading-8 whitespace-pre-line">
              {company.description || "No company description available."}
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-5">Company Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <Building2 className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Industry</p>
                  <p>{company.industry || "Not specified"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Location</p>
                  <p>{company.location || "Not specified"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Company Size</p>
                  <p>{company.companySize || "Not specified"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Founded</p>
                  <p>{company.founded || "Not specified"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Globe className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Website</p>
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    <p>Not specified</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Briefcase className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Followers</p>
                  <p>{company.followers}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
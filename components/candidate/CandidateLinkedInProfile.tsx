"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  CheckCircle,
  Pencil,
  Camera,
  Search,
  Mail,
  Globe,
  Building2,
  Users,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
  UserPlus,
  MessageSquare,
  MoreHorizontal,
  ExternalLink,
  ChevronDown,
  X,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  Layers,
  Heart,
  Bell,
  Bookmark,
  FileText,
  Rss
} from "lucide-react";
import CandidateAvatar from "@/components/candidate/CandidateAvatar";
import JobFeed from "@/components/job/JobFeed";
import PopularArticlesFeed from "@/components/articles/PopularArticlesFeed";
import SavedJobs from "@/components/job/SavedJobs";
import MyApplicationsPage from "@/app/candidate/applications/page";
import JobAlertsPage from "@/app/candidate/job-alerts/page";
import CandidateProfileEditCard from "@/components/candidate/CandidateProfileEditCard";

import SkillsSection from "@/components/candidate/profile/SkillsSection";
import ExperienceSection from "@/components/candidate/profile/ExperienceSection";
import EducationSection from "@/components/candidate/profile/EducationSection";
import ProjectsSection from "@/components/candidate/profile/ProjectsSection";
import CertificationsSection from "@/components/candidate/profile/CertificationsSection";
import LanguagesSection from "@/components/candidate/profile/LanguagesSection";
import AchievementsSection from "@/components/candidate/profile/AchievementsSection";
import InterestsSection from "@/components/candidate/profile/InterestsSection";
import SocialLinksSection from "@/components/candidate/profile/SocialLinksSection";

import { getMyProfile } from "@/lib/api/candidate/profile";
import { getSkills } from "@/lib/api/candidate/skills";
import { getExperiences } from "@/lib/api/candidate/experience";
import { getEducation } from "@/lib/api/candidate/education";
import { getProjects } from "@/lib/api/candidate/projects";
import { getCertifications } from "@/lib/api/candidate/certifications";
import { getLanguages } from "@/lib/api/candidate/languages";
import { getAchievements } from "@/lib/api/candidate/achievements";
import { getInterests } from "@/lib/api/candidate/interests";
import { getSocials } from "@/lib/api/candidate/socials";

type CandidateProfileData = {
  username: string;
  fullName?: string;
  headline?: string;
  about?: string;
  location?: string;
  avatarUrl?: string;
  company?: string;
  education?: string;
  websiteUrl?: string;
  skills?: any[];
  experiences?: any[];
  educationList?: any[];
  projectsList?: any[];
  certifications?: any[];
  languages?: any[];
  achievements?: any[];
  interests?: any[];
  socials?: any[];
};

interface Props {
  username: string;
}

export default function CandidateLinkedInProfile({ username }: Props) {
  const [candidate, setCandidate] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  type TabType =
    | "profile"
    | "edit"
    | "projects"
    | "connections"
    | "feed"
    | "articles"
    | "saved"
    | "applications"
    | "alerts";

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [connectionsSubTab, setConnectionsSubTab] = useState<"all" | "people" | "companies">("all");
  const [connectionSearch, setConnectionSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const loadCandidate = async () => {
    try {
      let baseData: any = null;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/${username}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          baseData = await res.json();
        }
      } catch {
        // fallback below
      }

      const safeFetch = async (fn: () => Promise<any>) => {
        try {
          return await fn();
        } catch {
          return [];
        }
      };

      const [
        skillsData,
        expData,
        eduData,
        projData,
        certsData,
        langsData,
        achievementsData,
        interestsData,
        socialsData,
      ] = await Promise.all([
        safeFetch(getSkills),
        safeFetch(getExperiences),
        safeFetch(getEducation),
        safeFetch(getProjects),
        safeFetch(getCertifications),
        safeFetch(getLanguages),
        safeFetch(getAchievements),
        safeFetch(getInterests),
        safeFetch(getSocials),
      ]);

      if (baseData) {
        setCandidate({
          ...baseData,
          skills: skillsData || [],
          experiences: expData || [],
          educationList: eduData || [],
          projectsList: projData || [],
          certifications: certsData || [],
          languages: langsData || [],
          achievements: achievementsData || [],
          interests: interestsData || [],
          socials: socialsData || [],
        });
      } else {
        setCandidate({
          username: username || "gopinath2322002",
          fullName: username.includes("gopinath") ? "Gopinath Candidate" : username,
          headline: "Certified PMP with 7 years of experience leading cross-functional teams in agile environments. Successfully delivered 15+ large-scale IT projects on time and 10% under budget.",
          about: "Art-minded, creative visionary, design-focused, digital content creator passionate about manufacturing technology, sales execution, moulding dynamics, entrepreneurship, branding, and smart engineering.",
          location: "Bengaluru, Karnataka, India",
          company: "Maxx Business Media",
          education: "BMS College of Engineering / Cal Poly",
          websiteUrl: "https://toolingtrends.com",
          skills: skillsData || [],
          experiences: expData || [],
          educationList: eduData || [],
          projectsList: projData || [],
          certifications: certsData || [],
          languages: langsData || [],
          achievements: achievementsData || [],
          interests: interestsData || [],
          socials: socialsData || [],
        });
      }
    } catch (err) {
      console.error("Failed to load candidate data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidate();
  }, [username]);

  const displayName = candidate?.fullName || candidate?.username || "Gopinath Candidate";
  const displayHeadline =
    candidate?.headline ||
    "Certified PMP with 7 years of experience leading cross-functional teams in agile environments. Successfully delivered 15+ large-scale IT projects on time and 10% under budget.";
  const displayCompany = candidate?.company || "Maxx Business Media";
  const displayEducation = candidate?.education || "Cal Poly San Luis Obispo";
  const displayLocation = candidate?.location || "Bengaluru, Karnataka, India";
  const displayAbout =
    candidate?.about ||
    "Art-minded, creative visionary, design-focused, digital content creator passionate about design, photography, storytelling, entrepreneurship, branding, marketing, tech.";

  if (loading) {
    return (
      <div className="bg-[#f3f2ef] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0a66c2] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium text-sm">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f3f2ef] min-h-screen text-[#1d1d1d]">
      <div className="max-w-[1180px] mx-auto px-4 py-6 pb-16">

        {/* ================= SHARED HEADER CARD ================= */}
        <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm overflow-hidden mb-4">
          {/* Cover Banner */}
          <div className="h-36 sm:h-44 bg-gradient-to-r from-[#0f5b78] via-[#0a66c2] to-[#1769ff] relative">
            <button
              onClick={() => setActiveTab("edit")}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow text-gray-700 transition-colors flex items-center gap-1.5 text-xs font-semibold px-3 cursor-pointer"
            >
              <Pencil size={14} />
              <span>Edit Banner</span>
            </button>
          </div>

          {/* Profile Header Main */}
          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="absolute -top-16 left-6 z-10">
              <div className="relative">
                <CandidateAvatar
                  avatarUrl={candidate?.avatarUrl}
                  name={displayName}
                  size="xl"
                  borderClassName="border-4 border-white shadow-md"
                />
                <button
                  onClick={() => setActiveTab("edit")}
                  className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Camera size={13} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Header Actions & Text */}
            <div className="pt-14 sm:pt-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{displayName}</h1>
                  <CheckCircle size={20} className="text-[#0a66c2] fill-[#0a66c2]/10" />
                </div>
                <p className="text-sm sm:text-base text-gray-700 font-medium mt-1 max-w-2xl leading-relaxed">
                  {displayHeadline}
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-2 flex-wrap">
                  <span className="font-semibold text-gray-800">{displayCompany}</span>
                  <span>•</span>
                  <span>{displayEducation}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-gray-400" />
                    {displayLocation}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#0a66c2] mt-1.5 cursor-pointer hover:underline">
                  500+ connections
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start flex-wrap mt-2 md:mt-0">
                <button
                  onClick={() => setActiveTab("edit")}
                  className="bg-[#0a66c2] hover:bg-[#084e96] text-white px-5 py-2 rounded-full font-semibold text-sm transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil size={15} />
                  Edit Profile
                </button>
                <button className="border-2 border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/10 px-5 py-2 rounded-full font-semibold text-sm transition-colors shadow-sm flex items-center gap-1.5">
                  <UserPlus size={16} />
                  Connect
                </button>
                <button className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold text-sm transition-colors">
                  More...
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SHARED TAB BAR ================= */}
        <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm mb-4">
          <div className="flex items-center gap-8 px-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "profile"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Profile
            </button>

            <button
              onClick={() => setActiveTab("edit")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === "edit"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              <Pencil size={14} />
              Edit Profile
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "projects"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Projects
            </button>

            <button
              onClick={() => setActiveTab("connections")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "connections"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Connections
            </button>

            <button
              onClick={() => setActiveTab("feed")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "feed"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Home Feed
            </button>

            <button
              onClick={() => setActiveTab("articles")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "articles"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Popular Articles
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "saved"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Saved Jobs
            </button>

            <button
              onClick={() => setActiveTab("applications")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "applications"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              My Applications
            </button>

            <button
              onClick={() => setActiveTab("alerts")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "alerts"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Job Alerts
            </button>
          </div>
        </div>

        {/* ================= TAB 1: PROFILE ================= */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* MAIN COLUMN */}
            <div className="lg:col-span-8 space-y-4">
              {/* SUMMARY CARD */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm relative">
                <button
                  onClick={() => setActiveTab("edit")}
                  title="Edit Summary"
                  className="absolute top-4 right-4 text-gray-400 hover:text-[#0a66c2] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <Pencil size={16} />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Summary</h2>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {displayAbout}
                </p>

                <div className="mb-6">
                  <a
                    href={candidate?.websiteUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-5 py-2 border-2 border-[#0a66c2] text-[#0a66c2] font-semibold text-sm rounded-full hover:bg-[#0a66c2]/10 transition-colors"
                  >
                    Visit Website
                  </a>
                </div>

                {/* 3 Project Thumbnails */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                  <figure className="group cursor-pointer">
                    <div className="overflow-hidden rounded-md bg-gray-100 h-28 border border-gray-200">
                      <img
                        src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop"
                        alt="UI/UX Design"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <figcaption className="text-xs text-gray-800 font-medium mt-2 text-center group-hover:text-[#0a66c2] transition-colors line-clamp-2">
                      UI/UX Design: Award Winning Public Safety App
                    </figcaption>
                  </figure>

                  <figure className="group cursor-pointer">
                    <div className="overflow-hidden rounded-md bg-gray-100 h-28 border border-gray-200">
                      <img
                        src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=200&fit=crop&sat=-100"
                        alt="Branding & Art Direction"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <figcaption className="text-xs text-gray-800 font-medium mt-2 text-center group-hover:text-[#0a66c2] transition-colors line-clamp-2">
                      Branding & Art Direction: Tooling Dynamics
                    </figcaption>
                  </figure>

                  <figure className="group cursor-pointer">
                    <div className="overflow-hidden rounded-md bg-gray-100 h-28 border border-gray-200">
                      <img
                        src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&h=200&fit=crop"
                        alt="Architectural Design"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <figcaption className="text-xs text-gray-800 font-medium mt-2 text-center group-hover:text-[#0a66c2] transition-colors line-clamp-2">
                      Architectural Design: Smart Tooling Academy
                    </figcaption>
                  </figure>
                </div>

                <button
                  onClick={() => setActiveTab("projects")}
                  className="w-full text-center text-sm font-semibold text-[#0a66c2] hover:underline mt-4 pt-2 border-t border-gray-100 cursor-pointer"
                >
                  See all projects →
                </button>
              </div>

              {/* SKILLS CARD */}
              <SkillsSection
                editable={false}
                skills={candidate?.skills ?? []}
                onEditClick={() => setActiveTab("edit")}
              />

              {/* EXPERIENCE CARD */}
              <ExperienceSection
                editable={false}
                experiences={candidate?.experiences ?? []}
                onEditClick={() => setActiveTab("edit")}
              />

              {/* EDUCATION CARD */}
              <EducationSection
                editable={false}
                education={candidate?.educationList ?? []}
                onEditClick={() => setActiveTab("edit")}
              />

              {/* ACCOMPLISHMENTS CARD */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm relative">
                <button
                  onClick={() => setActiveTab("edit")}
                  title="Edit Accomplishments"
                  className="absolute top-4 right-4 text-gray-400 hover:text-[#0a66c2] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <Pencil size={16} />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Accomplishments</h2>
                <div className="space-y-4 divide-y divide-gray-100">
                  <div className="pt-2 first:pt-0">
                    <AchievementsSection
                      editable={false}
                      achievements={candidate?.achievements ?? []}
                    />
                  </div>

                  <div className="pt-4">
                    <LanguagesSection
                      editable={false}
                      languages={candidate?.languages ?? []}
                    />
                  </div>

                  <div className="pt-4">
                    <CertificationsSection
                      editable={false}
                      certifications={candidate?.certifications ?? []}
                    />
                  </div>
                </div>
              </div>

              {/* INTERESTS CARD */}
              <InterestsSection
                editable={false}
                interests={candidate?.interests ?? []}
                onEditClick={() => setActiveTab("edit")}
              />
            </div>

            {/* SIDEBAR COLUMN */}
            <div className="lg:col-span-4 space-y-4">
              <TrendingArticlesCard />
              <JobAlertsCard activeTab={activeTab} setActiveTab={setActiveTab} />
              <ContactCard username={candidate?.username} />
              <PublicUrlCard username={candidate?.username} />
            </div>
          </div>
        )}

        {/* ================= TAB: EDIT PROFILE ================= */}
        {activeTab === "edit" && (
          <CandidateProfileEditCard
            onProfileUpdated={() => {
              loadCandidate();
              setActiveTab("profile");
            }}
          />
        )}

        {/* ================= TAB 2: PROJECTS ================= */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">
              <ProjectsSection
                editable={false}
                projects={candidate?.projectsList ?? []}
                onEditClick={() => setActiveTab("edit")}
              />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <TrendingArticlesCard />
              <JobAlertsCard activeTab={activeTab} setActiveTab={setActiveTab} />
              <ContactCard username={candidate?.username} />
              <PublicUrlCard username={candidate?.username} />
            </div>
          </div>
        )}

        {/* ================= TAB 3: CONNECTIONS ================= */}
        {activeTab === "connections" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-blue-50 text-[#0a66c2] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Connections</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  Connect with {displayName} to expand your professional network.
                </p>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-4">
              <TrendingArticlesCard />
              <JobAlertsCard activeTab={activeTab} setActiveTab={setActiveTab} />
              <ContactCard username={candidate?.username} />
              <PublicUrlCard username={candidate?.username} />
            </div>
          </div>
        )}

        {/* ================= TAB 4: HOME FEED ================= */}
        {activeTab === "feed" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">
              <JobFeed />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <TrendingArticlesCard />
              <JobAlertsCard activeTab={activeTab} setActiveTab={setActiveTab} />
              <ContactCard username={candidate?.username} />
              <PublicUrlCard username={candidate?.username} />
            </div>
          </div>
        )}

        {/* ================= TAB 5: POPULAR ARTICLES ================= */}
        {activeTab === "articles" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">
              <PopularArticlesFeed />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <TrendingArticlesCard />
              <JobAlertsCard activeTab={activeTab} setActiveTab={setActiveTab} />
              <ContactCard username={candidate?.username} />
              <PublicUrlCard username={candidate?.username} />
            </div>
          </div>
        )}

        {/* ================= TAB 6: SAVED JOBS ================= */}
        {activeTab === "saved" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">
              <SavedJobs />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <TrendingArticlesCard />
              <JobAlertsCard activeTab={activeTab} setActiveTab={setActiveTab} />
              <ContactCard username={candidate?.username} />
              <PublicUrlCard username={candidate?.username} />
            </div>
          </div>
        )}

        {/* ================= TAB 7: MY APPLICATIONS ================= */}
        {activeTab === "applications" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">
              <MyApplicationsPage />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <TrendingArticlesCard />
              <JobAlertsCard activeTab={activeTab} setActiveTab={setActiveTab} />
              <ContactCard username={candidate?.username} />
              <PublicUrlCard username={candidate?.username} />
            </div>
          </div>
        )}

        {/* ================= TAB 8: JOB ALERTS ================= */}
        {activeTab === "alerts" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">
              <JobAlertsPage />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <TrendingArticlesCard />
              <JobAlertsCard activeTab={activeTab} setActiveTab={setActiveTab} />
              <ContactCard username={candidate?.username} />
              <PublicUrlCard username={candidate?.username} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HELPER SIDEBAR COMPONENTS
   ═══════════════════════════════════════════════════════ */
function JobAlertsCard({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm ${activeTab === "alerts" ? "ring-2 ring-[#0a66c2]" : ""
        }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Bell size={18} className="text-[#0a66c2]" />
          Job Alerts
        </h3>
        <span className="text-[11px] font-semibold text-[#0a66c2] bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Active
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-4 leading-relaxed">
        Get instant notifications when new moulding technology, mechanical engineering, and sales roles match your profile.
      </p>

      <button
        onClick={() => setActiveTab("alerts")}
        className={`w-full py-2 px-4 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === "alerts"
          ? "bg-[#0a66c2] text-white"
          : "border-2 border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/10"
          }`}
      >
        <Bell size={14} />
        {activeTab === "alerts" ? "Viewing Job Alerts" : "Manage Job Alerts"}
      </button>
    </div>
  );
}

function ContactCard({ username }: { username?: string }) {
  return (
    <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm relative">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Contact & Socials</h3>

      <div className="space-y-3.5 text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0a66c2] shrink-0">
            <Mail size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">Email</p>
            <p className="font-semibold text-gray-900 truncate">candidate@mouldtech.com</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0a66c2] shrink-0">
            <Globe size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">Website</p>
            <a
              href="https://toolingtrends.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#0a66c2] hover:underline truncate block"
            >
              https://toolingtrends.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicUrlCard({ username }: { username?: string }) {
  return (
    <div className="bg-white rounded-lg border border-[#e0e0e0] p-5 shadow-sm">
      <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">Public Profile & URL</h4>
      <p className="text-xs text-[#0a66c2] font-mono break-all font-medium">
        {typeof window !== 'undefined' ? `${window.location.origin}/candidate/${username || 'gopinath2322002'}` : `/candidate/${username || 'gopinath2322002'}`}
      </p>
    </div>
  );
}

function TrendingArticlesCard() {
  const [articles, setArticles] = useState<{ id: number; title: string; slug: string; views?: number }[]>([]);

  useEffect(() => {
    async function loadTrending() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/articles/approved`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const sorted = [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
        setArticles(sorted);
      } catch {
        // Fallback
      }
    }
    loadTrending();
  }, []);

  const displayArticles =
    articles.length > 0
      ? articles.slice(0, 4)
      : [
        {
          id: 1,
          title: "Why Upskilling Is the Key to Career Growth in 2026",
          slug: "why-upskilling-is-the-key-to-career-growth-in-2026",
          views: 3,
        },
        {
          id: 2,
          title: "Top 7 Digital Marketing Trends Every Business Should Watch in 2029",
          slug: "top-7-digital-marketing-trends-every-business-should-watch-in-2029",
          views: 2,
        },
        {
          id: 3,
          title: "How Artificial Intelligence Is Transforming Modern Recruitment",
          slug: "how-artificial-intelligence-is-transforming-modern-recruitment",
          views: 2,
        },
        {
          id: 4,
          title: "The Future of Remote Work: Building High-Performance Distributed Teams",
          slug: "the-future-of-remote-work-building-high-performance-distributed-teams",
          views: 0,
        },
      ];

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-md overflow-hidden">
      <div className="bg-[#be1823] px-5 py-3.5">
        <h3 className="text-white font-bold text-lg sm:text-xl tracking-wide">
          Trending Articles
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {displayArticles.map((article, index) => (
          <Link
            key={article.id}
            href={`/post/${article.slug}`}
            className="px-5 py-3.5 flex items-start gap-3.5 hover:bg-gray-50/80 transition-colors group block"
          >
            <div className="w-7 h-7 rounded-md bg-[#be1823] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#0f172a] group-hover:text-[#be1823] transition-colors leading-snug line-clamp-2">
                {article.title}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                {(article.views ?? 0).toLocaleString()} views
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-gray-100 bg-white">
        <Link
          href="/articles"
          className="text-center font-bold text-sm text-[#be1823] hover:underline py-3.5 block hover:bg-red-50/40 transition-colors"
        >
          View all articles →
        </Link>
      </div>
    </div>
  );
}

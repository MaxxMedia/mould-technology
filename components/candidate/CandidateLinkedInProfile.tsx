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
  Heart
} from "lucide-react";
import CandidateAvatar from "@/components/candidate/CandidateAvatar";
import SkillsSection from "@/components/candidate/profile/SkillsSection";
import ExperienceSection from "@/components/candidate/profile/ExperienceSection";
import EducationSection from "@/components/candidate/profile/EducationSection";
import ProjectsSection from "@/components/candidate/profile/ProjectsSection";
import CertificationsSection from "@/components/candidate/profile/CertificationsSection";
import LanguagesSection from "@/components/candidate/profile/LanguagesSection";
import AchievementsSection from "@/components/candidate/profile/AchievementsSection";
import InterestsSection from "@/components/candidate/profile/InterestsSection";
import SocialLinksSection from "@/components/candidate/profile/SocialLinksSection";

// Import API functions with safe error handling
import {
  getMyProfile,
  updateMyProfile,
} from "@/lib/api/candidate/profile";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/lib/api/candidate/skills";
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} from "@/lib/api/candidate/experience";
import {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
} from "@/lib/api/candidate/education";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/api/candidate/projects";
import {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
} from "@/lib/api/candidate/certifications";
import {
  getLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "@/lib/api/candidate/languages";
import {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "@/lib/api/candidate/achievements";
import {
  getInterests,
  createInterest,
  updateInterest,
  deleteInterest,
} from "@/lib/api/candidate/interests";
import {
  getSocials,
  createSocial,
  updateSocial,
  deleteSocial,
} from "@/lib/api/candidate/socials";

// Types
type CandidateEducation = {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  grade?: string;
  description?: string;
};

type CandidateLanguage = {
  id: number;
  language: string;
  proficiency?: string;
};

type CandidateSkill = {
  id: number;
  name: string;
  level?: string;
};

type CandidateProject = {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  projectUrl?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string;
};

type CandidateCertification = {
  id: number;
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
};

type CandidateExperience = {
  id: number;
  title: string;
  employmentType?: string;
  location?: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  currentlyWorking?: boolean;
  company?: {
    id: number;
    name: string;
    logo?: string;
  };
};

type CandidateAchievement = {
  id: number;
  title: string;
  description?: string;
  issuer?: string;
  achievementDate?: string;
};

type CandidateInterest = {
  id: number;
  name: string;
  category?: string;
  followersCount?: number;
  imageUrl?: string;
};

type CandidateSocial = {
  id: number;
  platform: string;
  url: string;
  username?: string;
};

type CandidateProfileData = {
  username: string;
  fullName?: string;
  headline?: string;
  about?: string;
  location?: string;
  avatarUrl?: string;
  company?: string;
  websiteUrl?: string;
  skills?: CandidateSkill[];
  experiences?: CandidateExperience[];
  education?: CandidateEducation[];
  projects?: CandidateProject[];
  certifications?: CandidateCertification[];
  languages?: CandidateLanguage[];
  achievements?: CandidateAchievement[];
  interests?: CandidateInterest[];
  socials?: CandidateSocial[];
};

interface Props {
  username: string;
}

// Helper function for safe API calls
const safeApiCall = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    console.warn("API call failed, using fallback:", err);
    return fallback;
  }
};

export default function CandidateLinkedInProfile({ username }: Props) {
  const [candidate, setCandidate] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "projects" | "activity" | "connections">("profile");
  const [connectionsSubTab, setConnectionsSubTab] = useState<"all" | "people" | "companies">("all");
  const [connectionSearch, setConnectionSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    async function loadCandidateData() {
      try {
        setLoading(true);
        setError(null);

        // Load profile data with fallback
        let profileData;
        try {
          profileData = await getMyProfile();
        } catch (err) {
          console.warn("Failed to load profile, using fallback:", err);
          profileData = {
            fullName: username,
            headline: "",
            about: "",
            location: "",
            avatarUrl: "",
            company: "",
            websiteUrl: "",
          };
        }

        // Load all sections with fallbacks
        const [
          skillsData,
          experiencesData,
          educationData,
          projectsData,
          certificationsData,
          languagesData,
          achievementsData,
          interestsData,
          socialsData,
        ] = await Promise.all([
          safeApiCall(getSkills, []),
          safeApiCall(getExperiences, []),
          safeApiCall(getEducation, []),
          safeApiCall(getProjects, []),
          safeApiCall(getCertifications, []),
          safeApiCall(getLanguages, []),
          safeApiCall(getAchievements, []),
          safeApiCall(getInterests, []),
          safeApiCall(getSocials, []),
        ]);

        // Combine all data
        const combinedData: CandidateProfileData = {
          username: username,
          fullName: profileData.fullName || username,
          headline: profileData.headline || "",
          about: profileData.about || "",
          location: profileData.location || "",
          avatarUrl: profileData.avatarUrl || "",
          company: profileData.company || "",
          websiteUrl: profileData.websiteUrl || "",
          skills: skillsData || [],
          experiences: experiencesData || [],
          education: educationData || [],
          projects: projectsData || [],
          certifications: certificationsData || [],
          languages: languagesData || [],
          achievements: achievementsData || [],
          interests: interestsData || [],
          socials: socialsData || [],
        };

        setCandidate(combinedData);
      } catch (err) {
        console.error("Failed to load candidate data:", err);
        setError("Failed to load profile data. Please try again.");
        
        // Fallback data
        setCandidate({
          username: username,
          fullName: username.includes("gopinath") ? "Gopinath Candidate" : username,
          headline: "Certified PMP with 7 years of experience leading cross-functional teams in agile environments.",
          about: "Art-minded, creative visionary, design-focused, digital content creator passionate about manufacturing technology.",
          location: "Bengaluru, Karnataka, India",
          company: "Maxx Business Media",
          websiteUrl: "https://toolingtrends.com",
          skills: [],
          experiences: [],
          education: [
            {
              id: 1,
              institution: "BMS College of Engineering",
              degree: "B.Tech",
              fieldOfStudy: "Computer Science",
              startYear: 2020,
              endYear: 2024,
            }
          ],
          projects: [],
          certifications: [],
          languages: [],
          achievements: [],
          interests: [],
          socials: [],
        });
      } finally {
        setLoading(false);
      }
    }

    loadCandidateData();
  }, [username]);

  // Display fallback values if data is missing
  const displayName = candidate?.fullName || candidate?.username || "Gopinath Candidate";
  const displayHeadline = candidate?.headline || "Certified PMP with 7 years of experience leading cross-functional teams in agile environments.";
  const displayCompany = candidate?.company || "Maxx Business Media";
  const displayEducation = candidate?.education?.[0]?.institution || "Cal Poly San Luis Obispo";
  const displayLocation = candidate?.location || "Bengaluru, Karnataka, India";
  const displayAbout = candidate?.about || "Art-minded, creative visionary, design-focused, digital content creator passionate about design, photography, storytelling, entrepreneurship, branding, marketing, tech.";

  if (loading) {
    return (
      <div className="bg-[#f3f2ef] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0a66c2] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !candidate) {
    return (
      <div className="bg-[#f3f2ef] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#0a66c2] text-white px-6 py-2 rounded-full hover:bg-[#084e96] transition-colors"
          >
            Try Again
          </button>
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
            <button className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow text-gray-700 transition-colors">
              <Pencil size={15} />
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
                <button className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow border border-gray-200 hover:bg-gray-100 transition-colors">
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
                  {candidate?.skills?.length || 0} skills • {candidate?.experiences?.length || 0} experiences
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start flex-wrap mt-2 md:mt-0">
                <button className="bg-[#0a66c2] hover:bg-[#084e96] text-white px-5 py-2 rounded-full font-semibold text-sm transition-colors shadow-sm flex items-center gap-1.5">
                  <MessageSquare size={16} />
                  Message
                </button>
                <button className="border-2 border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/10 px-5 py-2 rounded-full font-semibold text-sm transition-colors flex items-center gap-1.5">
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
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "profile"
                  ? "border-[#0a66c2] text-[#0a66c2]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "projects"
                  ? "border-[#0a66c2] text-[#0a66c2]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "activity"
                  ? "border-[#0a66c2] text-[#0a66c2]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab("connections")}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "connections"
                  ? "border-[#0a66c2] text-[#0a66c2]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Connections
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
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
                  <Pencil size={16} />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Summary</h2>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {displayAbout}
                </p>

                {candidate?.websiteUrl && (
                  <div className="mb-6">
                    <a
                      href={candidate.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block px-5 py-2 border-2 border-[#0a66c2] text-[#0a66c2] font-semibold text-sm rounded-full hover:bg-[#0a66c2]/10 transition-colors"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {/* Project Thumbnails */}
                {candidate?.projects && candidate.projects.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                      {candidate.projects.slice(0, 3).map((project, index) => (
                        <figure key={project.id || index} className="group cursor-pointer">
                          <div className="overflow-hidden rounded-md bg-gray-100 h-28 border border-gray-200">
                            {project.imageUrl ? (
                              <img
                                src={project.imageUrl}
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <figcaption className="text-xs text-gray-800 font-medium mt-2 text-center group-hover:text-[#0a66c2] transition-colors line-clamp-2">
                            {project.title}
                          </figcaption>
                        </figure>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveTab("projects")}
                      className="w-full text-center text-sm font-semibold text-[#0a66c2] hover:underline mt-4 pt-2 border-t border-gray-100"
                    >
                      See all projects →
                    </button>
                  </>
                )}
              </div>

              {/* SKILLS CARD */}
              <SkillsSection
                editable={false}
                skills={candidate?.skills ?? []}
              />

              {/* EXPERIENCE CARD */}
              <ExperienceSection
                editable={false}
                experiences={candidate?.experiences ?? []}
              />

              {/* EDUCATION CARD */}
              <EducationSection
                editable={false}
                education={candidate?.education ?? []}
              />

              {/* ACCOMPLISHMENTS CARD */}
              {(candidate?.achievements?.length || candidate?.languages?.length || candidate?.certifications?.length) && (
                <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Accomplishments</h2>
                  <div className="space-y-4 divide-y divide-gray-100">
                    
                    {candidate?.achievements && candidate.achievements.length > 0 && (
                      <div className="flex items-start gap-4 pt-2 first:pt-0">
                        <span className="text-xl font-extrabold text-[#0a66c2] w-6 shrink-0 text-center">
                          {candidate.achievements.length}
                        </span>
                        <AchievementsSection
                          editable={false}
                          achievements={candidate.achievements}
                        />
                      </div>
                    )}

                    {candidate?.languages && candidate.languages.length > 0 && (
                      <div className="flex items-start gap-4 pt-4">
                        <span className="text-xl font-extrabold text-[#0a66c2] w-6 shrink-0 text-center">
                          {candidate.languages.length}
                        </span>
                        <LanguagesSection
                          editable={false}
                          languages={candidate.languages}
                        />
                      </div>
                    )}

                    {candidate?.certifications && candidate.certifications.length > 0 && (
                      <div className="flex items-start gap-4 pt-4">
                        <span className="text-xl font-extrabold text-[#0a66c2] w-6 shrink-0 text-center">
                          {candidate.certifications.length}
                        </span>
                        <CertificationsSection
                          editable={false}
                          certifications={candidate.certifications}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* INTERESTS CARD */}
              <InterestsSection
                editable={false}
                interests={candidate?.interests ?? []}
              />

            </div>

            {/* SIDEBAR COLUMN */}
            <div className="lg:col-span-4 space-y-4">
              <SocialLinksSection
                socials={candidate?.socials ?? []}
              />

              {/* PUBLIC PROFILE URL CARD */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-5 shadow-sm">
                <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">Public Profile & URL</h4>
                <p className="text-xs text-[#0a66c2] font-mono break-all font-medium">
                  {typeof window !== 'undefined' ? `${window.location.origin}/candidate/${candidate?.username}` : `/candidate/${candidate?.username}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PROJECTS ================= */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">
              <ProjectsSection
                editable={false}
                projects={candidate?.projects ?? []}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 3: ACTIVITY ================= */}
        {activeTab === "activity" && (
          <div className="bg-white rounded-lg border border-[#e0e0e0] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-[#0a66c2] rounded-full flex items-center justify-center mx-auto mb-3">
              <Layers size={28} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No activity to show yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Posts, comments, and articles shared by {displayName} will appear here.
            </p>
          </div>
        )}

        {/* ================= TAB 4: CONNECTIONS ================= */}
        {activeTab === "connections" && (
          <div className="bg-white rounded-lg border border-[#e0e0e0] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-[#0a66c2] rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Connections</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Connect with {displayName} to see their network.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
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
  Bookmark,
  FileText,
  Loader2,
  CheckCircle2,
  FolderKanban
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

// API imports
import { fetchMyCandidateProfile, updateMyCandidateProfile, syncCandidateUserInStorage } from "@/lib/candidateProfile";
import { getSkills, createSkill, updateSkill, deleteSkill } from "@/lib/api/candidate/skills";
import { getExperiences, createExperience, updateExperience, deleteExperience } from "@/lib/api/candidate/experience";
import { getEducation, createEducation, updateEducation, deleteEducation } from "@/lib/api/candidate/education";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/api/candidate/projects";
import { getCertifications, createCertification, updateCertification, deleteCertification } from "@/lib/api/candidate/certifications";
import { getLanguages, createLanguage, updateLanguage, deleteLanguage } from "@/lib/api/candidate/languages";
import { getAchievements, createAchievement, updateAchievement, deleteAchievement } from "@/lib/api/candidate/achievements";
import { getInterests, createInterest, updateInterest, deleteInterest } from "@/lib/api/candidate/interests";
import { getSocials, createSocial, updateSocial, deleteSocial } from "@/lib/api/candidate/socials";

// Form imports
import BasicInfoForm, { type BasicInfoValues } from "@/components/candidate/profile/forms/BasicInfoForm";
import AboutForm from "@/components/candidate/profile/forms/AboutForm";
import ExperienceForm, { type Experience } from "@/components/candidate/profile/forms/ExperienceForm";
import EducationForm, { type Education } from "@/components/candidate/profile/forms/EducationForm";
import SkillsForm, { type Skill } from "@/components/candidate/profile/forms/SkillsForm";
import AchievementsForm, { type Achievement } from "@/components/candidate/profile/forms/AchievementsForm";
import CertificationsForm, { type Certification } from "@/components/candidate/profile/forms/CertificationsForm";
import ProjectsForm, { type Project } from "@/components/candidate/profile/forms/ProjectsForm";
import LanguagesForm, { type Language } from "@/components/candidate/profile/forms/LanguagesForm";
import InterestsForm, { type Interest } from "@/components/candidate/profile/forms/InterestsForm";
import SocialLinksForm, { type SocialLink } from "@/components/candidate/profile/forms/SocialLinksForm";

type CandidateProfileData = {
  username: string;
  email?: string;
  fullName?: string;
  headline?: string;
  about?: string;
  location?: any;
  avatarUrl?: string;
  company?: any;
  education?: any;
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

function getEducationDisplay(education: any, educationList?: any[]): string {
  if (typeof education === "string" && education.trim()) {
    return education;
  }
  if (education && typeof education === "object" && !Array.isArray(education)) {
    const parts = [education.institution, education.degree, education.fieldOfStudy].filter(
      (p) => typeof p === "string" && p.trim()
    );
    if (parts.length > 0) return parts.join(" • ");
  }
  if (Array.isArray(education) && education.length > 0) {
    return getEducationDisplay(education[0]);
  }
  if (Array.isArray(educationList) && educationList.length > 0) {
    return getEducationDisplay(educationList[0]);
  }
  return "";
}

function getCompanyDisplay(company: any): string {
  if (typeof company === "string" && company.trim()) {
    return company;
  }
  if (company && typeof company === "object" && !Array.isArray(company)) {
    return company.name || company.companyName || company.title || "";
  }
  if (Array.isArray(company) && company.length > 0) {
    return getCompanyDisplay(company[0]);
  }
  return "";
}

function getLocationDisplay(location: any): string {
  if (typeof location === "string" && location.trim()) {
    return location;
  }
  if (location && typeof location === "object" && !Array.isArray(location)) {
    const parts = [location.city, location.state, location.country].filter(
      (p) => typeof p === "string" && p.trim()
    );
    if (parts.length > 0) return parts.join(", ");
  }
  return "";
}

function getSafeString(val: any, fallback: string = ""): string {
  if (typeof val === "string" && val.trim()) {
    return val;
  }
  return fallback;
}

interface Props {
  username: string;
}

type ModalType =
  | "intro"
  | "about"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "achievements"
  | "interests"
  | "socials"
  | null;

export default function CandidateLinkedInProfile({ username }: Props) {
  const [candidate, setCandidate] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  type TabType =
    | "profile"
    | "projects"
    | "connections";

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check ownership
  useEffect(() => {
    async function checkOwnership() {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          if (u.username && u.username.toLowerCase() === username.toLowerCase()) {
            setIsOwner(true);
            return;
          }
        }
        const me = await fetchMyCandidateProfile();
        if (me && me.username && me.username.toLowerCase() === username.toLowerCase()) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch {
        setIsOwner(false);
      }
    }
    checkOwnership();
  }, [username]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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
          educationList: (eduData && eduData.length > 0)
            ? eduData
            : (Array.isArray(baseData.education) ? baseData.education : (baseData.education && typeof baseData.education === "object" ? [baseData.education] : [])),
          projectsList: projData || [],
          certifications: certsData || [],
          languages: langsData || [],
          achievements: achievementsData || [],
          interests: interestsData || [],
          socials: socialsData || [],
        });
      } else {
        setCandidate({
          username: username || "",
          fullName: username || "",
          headline: "",
          about: "",
          location: "",
          company: "",
          education: "",
          websiteUrl: "",
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

  const displayName = getSafeString(candidate?.fullName, candidate?.username || username);
  const displayHeadline = getSafeString(candidate?.headline, "");
  const displayCompany = getCompanyDisplay(candidate?.company);
  const displayEducation = getEducationDisplay(candidate?.education, candidate?.educationList);
  const displayLocation = getLocationDisplay(candidate?.location);
  const displayAbout = getSafeString(candidate?.about, "");

  // --- Modal Form Submit Handlers ---
  const handleSaveIntro = async (values: BasicInfoValues) => {
    setModalSaving(true);
    try {
      const updated = await updateMyCandidateProfile({
        fullName: `${values.firstName} ${values.lastName}`.trim(),
        headline: values.headline,
        location: values.location,
        about: values.about,
        websiteUrl: values.website,
      });
      syncCandidateUserInStorage(updated);
      await loadCandidate();
      setToastMessage("Intro updated successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save intro", err);
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveAbout = async (aboutText: string) => {
    setModalSaving(true);
    try {
      const updated = await updateMyCandidateProfile({ about: aboutText });
      syncCandidateUserInStorage(updated);
      await loadCandidate();
      setToastMessage("Summary updated successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save summary", err);
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveExperience = async (values: Experience[]) => {
    setModalSaving(true);
    try {
      const existingIds = values.filter((v) => v.id).map((v) => v.id!);
      const currentExps = candidate?.experiences || [];
      const toDelete = currentExps.filter((e: any) => e.id && !existingIds.includes(e.id));
      for (const exp of toDelete) {
        await deleteExperience(exp.id);
      }
      for (const exp of values) {
        const payload = {
          title: exp.title,
          companyName: exp.company,
          employmentType: exp.employmentType,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.currentlyWorking ? null : exp.endDate || null,
          currentlyWorking: exp.currentlyWorking,
          description: exp.description,
        };
        if (exp.id) {
          await updateExperience(exp.id, payload);
        } else {
          await createExperience(payload);
        }
      }
      await loadCandidate();
      setToastMessage("Experience updated successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save experience", err);
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveEducation = async (values: Education[]) => {
    setModalSaving(true);
    try {
      const existingIds = values.filter((v) => v.id).map((v) => v.id!);
      const currentEdus = candidate?.educationList || [];
      const toDelete = currentEdus.filter((e: any) => e.id && !existingIds.includes(e.id));
      for (const edu of toDelete) {
        await deleteEducation(edu.id);
      }
      for (const edu of values) {
        const payload = {
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startYear: edu.startYear ? Number(edu.startYear) : undefined,
          endYear: edu.endYear ? Number(edu.endYear) : undefined,
          grade: edu.grade,
          description: edu.description,
        };
        if (edu.id) {
          await updateEducation(edu.id, payload);
        } else {
          await createEducation(payload);
        }
      }
      await loadCandidate();
      setToastMessage("Education updated successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save education", err);
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveSkills = async (values: Skill[]) => {
    setModalSaving(true);
    try {
      const existingIds = values.filter((v) => v.id).map((v) => v.id!);
      const currentSkills = candidate?.skills || [];
      const toDelete = currentSkills.filter((s: any) => s.id && !existingIds.includes(s.id));
      for (const s of toDelete) {
        await deleteSkill(s.id);
      }
      for (const s of values) {
        if (s.id) {
          await updateSkill(s.id, { name: s.name, level: s.level });
        } else {
          await createSkill({ name: s.name, level: s.level });
        }
      }
      await loadCandidate();
      setToastMessage("Skills updated successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save skills", err);
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveProjects = async (values: Project[]) => {
    setModalSaving(true);
    try {
      const existingIds = values.filter((v) => v.id).map((v) => v.id!);
      const currentProjects = candidate?.projectsList || [];
      const toDelete = currentProjects.filter((p: any) => p.id && !existingIds.includes(p.id));
      for (const proj of toDelete) {
        await deleteProject(proj.id);
      }
      for (const proj of values) {
        const payload = {
          title: proj.title,
          description: proj.description,
          imageUrl: proj.imageUrl,
          projectUrl: proj.projectUrl,
          startDate: proj.startDate,
          endDate: proj.endDate,
          technologies: proj.technologies,
        };
        if (proj.id) {
          await updateProject(proj.id, payload);
        } else {
          await createProject(payload);
        }
      }
      await loadCandidate();
      setToastMessage("Projects updated successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save projects", err);
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveCertifications = async (values: Certification[]) => {
    setModalSaving(true);
    try {
      const existingIds = values.filter((v) => v.id).map((v) => v.id!);
      const currentCerts = candidate?.certifications || [];
      const toDelete = currentCerts.filter((c: any) => c.id && !existingIds.includes(c.id));
      for (const cert of toDelete) {
        await deleteCertification(cert.id);
      }
      for (const cert of values) {
        const payload = {
          name: cert.name,
          issuingOrganization: cert.issuingOrganization,
          issueDate: cert.issueDate,
          expirationDate: cert.expirationDate,
          credentialUrl: cert.credentialUrl,
        };
        if (cert.id) {
          await updateCertification(cert.id, payload);
        } else {
          await createCertification(payload);
        }
      }
      await loadCandidate();
      setToastMessage("Certifications updated successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save certifications", err);
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveLanguages = async (values: Language[]) => {
    setModalSaving(true);
    try {
      const existingIds = values.filter((v) => v.id).map((v) => v.id!);
      const currentLangs = candidate?.languages || [];
      const toDelete = currentLangs.filter((l: any) => l.id && !existingIds.includes(l.id));
      for (const lang of toDelete) {
        await deleteLanguage(lang.id);
      }
      for (const lang of values) {
        if (lang.id) {
          await updateLanguage(lang.id, { language: lang.language, proficiency: lang.proficiency });
        } else {
          await createLanguage({ language: lang.language, proficiency: lang.proficiency });
        }
      }
      await loadCandidate();
      setToastMessage("Languages updated successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save languages", err);
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveAchievements = async (values: Achievement[]) => {
    setModalSaving(true);
    try {
      const existingIds = values.filter((v) => v.id).map((v) => v.id!);
      const currentAchievements = candidate?.achievements || [];
      const toDelete = currentAchievements.filter((a: any) => a.id && !existingIds.includes(a.id));
      for (const ach of toDelete) {
        await deleteAchievement(ach.id);
      }
      for (const ach of values) {
        const payload = {
          title: ach.title,
          description: ach.description,
          issuer: ach.issuer,
          achievementDate: ach.achievementDate,
        };
        if (ach.id) {
          await updateAchievement(ach.id, payload);
        } else {
          await createAchievement(payload);
        }
      }
      await loadCandidate();
      setToastMessage("Achievements updated successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save achievements", err);
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveInterests = async (values: Interest[]) => {
    setModalSaving(true);
    try {
      const existingIds = values.filter((v) => v.id).map((v) => v.id!);
      const currentInterests = candidate?.interests || [];
      const toDelete = currentInterests.filter((i: any) => i.id && !existingIds.includes(i.id));
      for (const interest of toDelete) {
        await deleteInterest(interest.id);
      }
      for (const interest of values) {
        const payload = {
          title: interest.name || "",
          type: interest.category || "",
        };
        if (interest.id) {
          await updateInterest(interest.id, payload);
        } else {
          await createInterest(payload);
        }
      }
      await loadCandidate();
      setToastMessage("Interests updated successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save interests", err);
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveSocials = async (values: SocialLink[]) => {
    setModalSaving(true);
    try {
      const existingIds = values.filter((v) => v.id).map((v) => v.id!);
      const currentSocials = candidate?.socials || [];
      const toDelete = currentSocials.filter((s: any) => s.id && !existingIds.includes(s.id));
      for (const soc of toDelete) {
        await deleteSocial(soc.id);
      }
      for (const soc of values) {
        const payload = {
          platform: soc.platform,
          url: soc.url,
          username: soc.username,
        };
        if (soc.id) {
          await updateSocial(soc.id, payload);
        } else {
          await createSocial(payload);
        }
      }
      await loadCandidate();
      setToastMessage("Contact & Social links updated successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save social links", err);
    } finally {
      setModalSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0F5B78] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[#5A5F69] font-medium text-sm">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  const initialBasicInfo: BasicInfoValues = {
    firstName: (candidate?.fullName || "").split(" ")[0] || "",
    lastName: (candidate?.fullName || "").split(" ").slice(1).join(" ") || "",
    headline: candidate?.headline || "",
    currentPosition: typeof candidate?.company === "string" ? candidate.company : (candidate?.company?.name || ""),
    company: typeof candidate?.company === "string" ? candidate.company : (candidate?.company?.name || ""),
    location: typeof candidate?.location === "string" ? candidate.location : (candidate?.location?.city || ""),
    website: candidate?.websiteUrl || "",
    phone: "",
    email: candidate?.email || "",
    about: candidate?.about || "",
    avatar: candidate?.avatarUrl || "",
  };

  const candidateProjects = candidate?.projectsList ?? [];

  // Sidebar components in strict requested order: 1. Trending Articles, 2. Recommended Jobs, 3. Saved Jobs, 4. My Applications
  const renderSidebar = () => (
    <div className="lg:col-span-4 space-y-4">
      <TrendingArticlesCard />
      <HomeFeedCard />
      <SavedJobsCard />
      <MyApplicationsCard />
      <ContactCard
        candidate={candidate}
        isOwner={isOwner}
        onEditClick={isOwner ? () => setActiveModal("socials") : undefined}
      />
      <PublicUrlCard username={candidate?.username || username} />
    </div>
  );

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-[#000000] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#000000] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium animate-bounce">
          <CheckCircle2 size={18} className="text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1180px] mx-auto px-4 py-6 pb-16">

        {/* ================= SHARED HEADER CARD ================= */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-sm overflow-hidden mb-4 relative">
          {/* Cover Banner using Secondary Brand Color #0F5B78 */}
          <div className="h-36 sm:h-44 bg-gradient-to-r from-[#0F5B78] via-[#0F5B78] to-[#B40F24] relative">
            {isOwner && (
              <button
                onClick={() => setActiveModal("intro")}
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
                  avatarUrl={candidate?.avatarUrl}
                  name={displayName}
                  size="xl"
                  borderClassName="border-4 border-white shadow-md"
                />
                {isOwner && (
                  <button
                    onClick={() => setActiveModal("intro")}
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
                      onClick={() => setActiveModal("intro")}
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
                    onClick={() => setActiveModal("intro")}
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

        {/* ================= SHARED TAB BAR ================= */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-sm mb-4">
          <div className="flex items-center gap-8 px-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "profile"
                ? "border-[#0F5B78] text-[#0F5B78]"
                : "border-transparent text-[#5A5F69] hover:text-[#000000]"
                }`}
            >
              Profile
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "projects"
                ? "border-[#0F5B78] text-[#0F5B78]"
                : "border-transparent text-[#5A5F69] hover:text-[#000000]"
                }`}
            >
              Projects
            </button>

            <button
              onClick={() => setActiveTab("connections")}
              className={`py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "connections"
                ? "border-[#0F5B78] text-[#0F5B78]"
                : "border-transparent text-[#5A5F69] hover:text-[#000000]"
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
              <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 shadow-sm relative">
                {isOwner && (
                  <button
                    onClick={() => setActiveModal("about")}
                    title="Edit Summary"
                    className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <h2 className="text-lg font-bold text-[#000000] mb-3">Summary</h2>
                {displayAbout ? (
                  <p className="text-sm text-[#5A5F69] leading-relaxed mb-4 whitespace-pre-line">
                    {displayAbout}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic mb-4">No summary added yet.</p>
                )}

                {candidate?.websiteUrl && (
                  <div className="mb-6">
                    <a
                      href={candidate.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block px-5 py-2 border-2 border-[#0F5B78] text-[#0F5B78] font-semibold text-sm rounded-full hover:bg-[#0F5B78]/10 transition-colors"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {/* Real Projects Thumbnails from Candidate Data */}
                {candidateProjects.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                    {candidateProjects.slice(0, 3).map((proj: any) => (
                      <figure key={proj.id} className="group cursor-pointer" onClick={() => setActiveTab("projects")}>
                        <div className="overflow-hidden rounded-md bg-gray-100 h-28 border border-gray-200 flex items-center justify-center">
                          {proj.imageUrl ? (
                            <img
                              src={proj.imageUrl}
                              alt={proj.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <FolderKanban className="text-[#5A5F69]" size={32} />
                          )}
                        </div>
                        <figcaption className="text-xs text-[#000000] font-medium mt-2 text-center group-hover:text-[#0F5B78] transition-colors line-clamp-2">
                          {proj.title}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}

                {candidateProjects.length > 0 && (
                  <button
                    onClick={() => setActiveTab("projects")}
                    className="w-full text-center text-sm font-semibold text-[#0F5B78] hover:underline mt-4 pt-2 border-t border-gray-100 cursor-pointer"
                  >
                    See all projects →
                  </button>
                )}
              </div>

              {/* SKILLS CARD */}
              <SkillsSection
                editable={false}
                skills={candidate?.skills ?? []}
                onEditClick={isOwner ? () => setActiveModal("skills") : undefined}
              />

              {/* EXPERIENCE CARD */}
              <ExperienceSection
                editable={false}
                experiences={candidate?.experiences ?? []}
                onEditClick={isOwner ? () => setActiveModal("experience") : undefined}
              />

              {/* EDUCATION CARD */}
              <EducationSection
                editable={false}
                education={candidate?.educationList ?? []}
                onEditClick={isOwner ? () => setActiveModal("education") : undefined}
              />

              {/* ACCOMPLISHMENTS CARD */}
              <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 shadow-sm relative">
                <h2 className="text-lg font-bold text-[#000000] mb-4">Accomplishments</h2>
                <div className="space-y-4 divide-y divide-gray-100">
                  <div className="pt-2 first:pt-0">
                    <AchievementsSection
                      editable={false}
                      achievements={candidate?.achievements ?? []}
                      onEditClick={isOwner ? () => setActiveModal("achievements") : undefined}
                    />
                  </div>

                  <div className="pt-4">
                    <LanguagesSection
                      editable={false}
                      languages={candidate?.languages ?? []}
                      onEditClick={isOwner ? () => setActiveModal("languages") : undefined}
                    />
                  </div>

                  <div className="pt-4">
                    <CertificationsSection
                      editable={false}
                      certifications={candidate?.certifications ?? []}
                      onEditClick={isOwner ? () => setActiveModal("certifications") : undefined}
                    />
                  </div>
                </div>
              </div>

              {/* INTERESTS CARD */}
              <InterestsSection
                editable={false}
                interests={candidate?.interests ?? []}
                onEditClick={isOwner ? () => setActiveModal("interests") : undefined}
              />
            </div>

            {/* SIDEBAR COLUMN */}
            {renderSidebar()}
          </div>
        )}

        {/* ================= TAB 2: PROJECTS ================= */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">
              <ProjectsSection
                editable={false}
                projects={candidate?.projectsList ?? []}
                onEditClick={isOwner ? () => setActiveModal("projects") : undefined}
              />
            </div>
            {renderSidebar()}
          </div>
        )}

        {/* ================= TAB 3: CONNECTIONS ================= */}
        {activeTab === "connections" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-xl border border-[#e0e0e0] p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-[#0F5B78]/10 text-[#0F5B78] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={28} />
                </div>
                <h3 className="text-lg font-bold text-[#000000]">Connections</h3>
                <p className="text-sm text-[#5A5F69] mt-1 max-w-md mx-auto">
                  Connect with {displayName} to expand your professional network.
                </p>
              </div>
            </div>
            {renderSidebar()}
          </div>
        )}

      </div>

      {/* ================= INLINE MODAL DIALOGS (LINKEDIN STYLE) ================= */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <h3 className="text-xl font-bold text-[#000000]">
                {activeModal === "intro" && "Edit Intro"}
                {activeModal === "about" && "Edit Summary"}
                {activeModal === "experience" && "Edit Experience"}
                {activeModal === "education" && "Edit Education"}
                {activeModal === "skills" && "Edit Skills"}
                {activeModal === "projects" && "Edit Projects"}
                {activeModal === "certifications" && "Edit Certifications"}
                {activeModal === "languages" && "Edit Languages"}
                {activeModal === "achievements" && "Edit Achievements"}
                {activeModal === "interests" && "Edit Interests"}
                {activeModal === "socials" && "Edit Contact & Social Links"}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#5A5F69] hover:text-[#000000] p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div>
              {activeModal === "intro" && (
                <BasicInfoForm
                  initialValues={initialBasicInfo}
                  onSubmit={handleSaveIntro}
                  loading={modalSaving}
                />
              )}

              {activeModal === "about" && (
                <AboutForm
                  initialValue={candidate?.about || ""}
                  onSubmit={handleSaveAbout}
                  loading={modalSaving}
                />
              )}

              {activeModal === "experience" && (
                <ExperienceForm
                  initialValues={(candidate?.experiences || []).map((e: any) => ({
                    id: e.id,
                    title: e.designation || e.title || "",
                    company: e.companyName || e.company || "",
                    employmentType: e.employmentType || "",
                    location: e.location || "",
                    startDate: e.startDate || "",
                    endDate: e.endDate || "",
                    currentlyWorking: e.currentlyWorking || false,
                    description: e.description || "",
                  }))}
                  onSubmit={handleSaveExperience}
                  loading={modalSaving}
                />
              )}

              {activeModal === "education" && (
                <EducationForm
                  initialValues={candidate?.educationList || []}
                  onSubmit={handleSaveEducation}
                  loading={modalSaving}
                />
              )}

              {activeModal === "skills" && (
                <SkillsForm
                  initialValues={candidate?.skills || []}
                  onSubmit={handleSaveSkills}
                  loading={modalSaving}
                />
              )}

              {activeModal === "projects" && (
                <ProjectsForm
                  initialValues={candidate?.projectsList || []}
                  onSubmit={handleSaveProjects}
                  loading={modalSaving}
                />
              )}

              {activeModal === "certifications" && (
                <CertificationsForm
                  initialValues={candidate?.certifications || []}
                  onSubmit={handleSaveCertifications}
                  loading={modalSaving}
                />
              )}

              {activeModal === "languages" && (
                <LanguagesForm
                  initialValues={candidate?.languages || []}
                  onSubmit={handleSaveLanguages}
                  loading={modalSaving}
                />
              )}

              {activeModal === "achievements" && (
                <AchievementsForm
                  initialValues={candidate?.achievements || []}
                  onSubmit={handleSaveAchievements}
                  loading={modalSaving}
                />
              )}

              {activeModal === "interests" && (
                <InterestsForm
                  initialValues={candidate?.interests || []}
                  onSubmit={handleSaveInterests}
                  loading={modalSaving}
                />
              )}

              {activeModal === "socials" && (
                <SocialLinksForm
                  initialValues={candidate?.socials || []}
                  onSubmit={handleSaveSocials}
                  loading={modalSaving}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SIDEBAR CARDS (UNIFIED COLOR #0F5B78 & REAL DATA)
   ═══════════════════════════════════════════════════════ */

function TrendingArticlesCard() {
  const [articles, setArticles] = useState<{ id: number; title: string; slug: string; views?: number }[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    loadTrending();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-md overflow-hidden">
      <div className="bg-[#0F5B78] px-5 py-3.5">
        <h3 className="text-white font-bold text-base sm:text-lg tracking-wide">
          Trending Articles
        </h3>
      </div>

      {loading ? (
        <div className="p-4 text-center text-xs text-[#5A5F69]">Loading trending articles...</div>
      ) : articles.length === 0 ? (
        <div className="p-5 text-center text-xs text-[#5A5F69]">No trending articles at the moment.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {articles.slice(0, 5).map((article, index) => (
            <Link
              key={article.id}
              href={`/post/${article.slug}`}
              className="px-5 py-3.5 flex items-start gap-3.5 hover:bg-gray-50/80 transition-colors group block"
            >
              <div className="w-7 h-7 rounded-md bg-[#0F5B78] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#000000] group-hover:text-[#0F5B78] transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-xs text-[#5A5F69] mt-0.5 font-medium">
                  {(article.views ?? 0).toLocaleString()} views
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {articles.length > 0 && (
        <div className="border-t border-gray-100 bg-white">
          <Link
            href="/articles"
            className="text-center font-bold text-sm text-[#0F5B78] hover:underline py-3.5 block hover:bg-blue-50/40 transition-colors"
          >
            View all articles →
          </Link>
        </div>
      )}
    </div>
  );
}

function HomeFeedCard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        let fetchedJobs: any[] = [];
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?page=1&limit=20`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          fetchedJobs = data.jobs || (Array.isArray(data) ? data : []);
        }
        if (fetchedJobs.length === 0) {
          const fallbackRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/approved`, { cache: "no-store" });
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            fetchedJobs = Array.isArray(data) ? data : data.jobs || [];
          }
        }
        setJobs(fetchedJobs.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch jobs for Recommended Jobs card", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-md overflow-hidden">
      <div className="bg-[#0F5B78] px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
          <Briefcase size={18} />
          Recommended Jobs
        </h3>
        <span className="text-[11px] font-semibold text-white bg-white/20 px-2.5 py-0.5 rounded-full">
          {jobs.length > 0 ? `${jobs.length} Listed` : "Jobs"}
        </span>
      </div>

      {loading ? (
        <div className="p-4 text-center text-xs text-[#5A5F69]">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="p-5 text-center text-xs text-[#5A5F69]">No recommended jobs available.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {jobs.slice(0, 5).map((job) => (
            <Link
              key={job.id}
              href="/feed"
              className="p-3.5 block hover:bg-blue-50/30 transition-colors cursor-pointer group"
            >
              <h4 className="text-xs sm:text-sm font-bold text-[#000000] group-hover:text-[#0F5B78] transition-colors truncate">
                {job.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-[#5A5F69] mt-1">
                <span className="font-medium text-[#0F5B78]">{job.Company?.name || job.companyName || ""}</span>
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-[#5A5F69]" />
                    {job.location}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 bg-white p-2">
        <Link
          href="/feed"
          className="w-full text-center font-bold text-xs text-[#0F5B78] hover:underline py-2 block hover:bg-blue-50/40 rounded transition-colors cursor-pointer"
        >
          View all jobs in feed →
        </Link>
      </div>
    </div>
  );
}

function SavedJobsCard() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/saved/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setSavedJobs(data.slice(0, 5));
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadSaved();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-md overflow-hidden">
      <div className="bg-[#0F5B78] px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
          <Bookmark size={18} />
          Saved Jobs
        </h3>
        <span className="text-[11px] font-semibold text-white bg-white/20 px-2.5 py-0.5 rounded-full">
          {savedJobs.length} Listed
        </span>
      </div>

      {loading ? (
        <div className="p-4 text-center text-xs text-[#5A5F69]">Loading saved jobs...</div>
      ) : savedJobs.length === 0 ? (
        <div className="p-5 text-center text-xs text-[#5A5F69]">
          <p className="font-semibold text-[#000000]">No saved jobs yet</p>
          <p className="mt-1">Bookmark jobs to view them here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {savedJobs.slice(0, 5).map((item) => {
            const job = item.Job || item;
            return (
              <div
                key={item.id || job.id}
                className="p-3.5 block hover:bg-blue-50/40 transition-colors group"
              >
                <h4 className="text-xs sm:text-sm font-bold text-[#000000] group-hover:text-[#0F5B78] transition-colors truncate">
                  {job.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-[#5A5F69] mt-1">
                  <span className="font-medium text-[#0F5B78]">{job.Company?.name || job.companyName || ""}</span>
                  <span>{job.location || ""}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MyApplicationsCard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setApplications(data.slice(0, 5));
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-md overflow-hidden">
      <div className="bg-[#0F5B78] px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
          <FileText size={18} />
          My Applications
        </h3>
        <span className="text-[11px] font-semibold text-white bg-white/20 px-2.5 py-0.5 rounded-full">
          {applications.length} Listed
        </span>
      </div>

      {loading ? (
        <div className="p-4 text-center text-xs text-[#5A5F69]">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="p-5 text-center text-xs text-[#5A5F69]">
          <p className="font-semibold text-[#000000]">No applications submitted</p>
          <p className="mt-1">Applied roles will appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {applications.slice(0, 5).map((app) => {
            const job = app.Job || {};
            return (
              <div
                key={app.id}
                className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[#000000] truncate">{job.title || "Applied Role"}</h4>
                  <p className="text-xs text-[#5A5F69] mt-0.5 truncate">{job.Company?.name || ""}</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-[#0F5B78] border border-[#0F5B78]/30 shrink-0">
                  {app.status || "APPLIED"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContactCard({
  candidate,
  isOwner,
  onEditClick,
}: {
  candidate?: CandidateProfileData | null;
  isOwner?: boolean;
  onEditClick?: () => void;
}) {
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

function PublicUrlCard({ username }: { username?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] p-5 shadow-sm">
      <h4 className="font-bold text-xs text-[#5A5F69] uppercase tracking-wider mb-2">Public Profile & URL</h4>
      <p className="text-xs text-[#0F5B78] font-mono break-all font-medium">
        {typeof window !== 'undefined' ? `${window.location.origin}/candidate/${username || ''}` : `/candidate/${username || ''}`}
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Pencil, CheckCircle2, Users, FolderKanban } from "lucide-react";

import SummarySection from "@/components/candidate/profile/SummarySection";
import SkillsSection from "@/components/candidate/profile/SkillsSection";
import ExperienceSection from "@/components/candidate/profile/ExperienceSection";
import EducationSection from "@/components/candidate/profile/EducationSection";
import ProjectsSection from "@/components/candidate/profile/ProjectsSection";
import CertificationsSection from "@/components/candidate/profile/CertificationsSection";
import LanguagesSection from "@/components/candidate/profile/LanguagesSection";
import AchievementsSection from "@/components/candidate/profile/AchievementsSection";
import InterestsSection from "@/components/candidate/profile/InterestsSection";

import ProfileHeader from "@/components/candidate/profile/ProfileHeader";
import CandidateSidebar from "@/components/candidate/profile/sidebar/CandidateSidebar";
import ProfileModals, { type ModalType } from "@/components/candidate/profile/ProfileModals";

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

import { type BasicInfoValues } from "@/components/candidate/profile/forms/BasicInfoForm";
import { type Experience } from "@/components/candidate/profile/forms/ExperienceForm";
import { type Education } from "@/components/candidate/profile/forms/EducationForm";
import { type Skill } from "@/components/candidate/profile/forms/SkillsForm";
import { type Achievement } from "@/components/candidate/profile/forms/AchievementsForm";
import { type Certification } from "@/components/candidate/profile/forms/CertificationsForm";
import { type Project } from "@/components/candidate/profile/forms/ProjectsForm";
import { type Language } from "@/components/candidate/profile/forms/LanguagesForm";
import { type Interest } from "@/components/candidate/profile/forms/InterestsForm";
import { type SocialLink } from "@/components/candidate/profile/forms/SocialLinksForm";

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

export default function CandidateLinkedInProfile({ username }: Props) {
  const [candidate, setCandidate] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  type TabType = "profile" | "projects" | "connections";

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
      setLoading(true);

      // 1. Determine ownership first
      let currentIsOwner = false;
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.username && u.username.toLowerCase() === username.toLowerCase()) {
            currentIsOwner = true;
          }
        } catch (err) {
          console.error(err);
        }
      }

      // 2. Fetch candidate base profile by username or ID
      let baseData: any = null;
      try {
        let res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/${username}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/id/${username}`,
            { cache: "no-store" }
          );
        }
        if (res.ok) {
          baseData = await res.json();
        }
      } catch (err) {
        console.error("Failed to fetch candidate base data", err);
      }

      // Check if logged in user is owner via fetched profile if not matched by username
      if (!currentIsOwner && baseData) {
        try {
          const me = await fetchMyCandidateProfile();
          if (me && (me.username?.toLowerCase() === baseData.username?.toLowerCase() || me.id === baseData.id)) {
            currentIsOwner = true;
          }
        } catch {}
      }

      setIsOwner(currentIsOwner);

      // Helper function to extract array from baseData keys
      const extractArray = (keys: string[]) => {
        if (!baseData) return [];
        for (const k of keys) {
          if (Array.isArray(baseData[k])) return baseData[k];
        }
        return [];
      };

      let skillsData: any[] = extractArray(["skills", "CandidateSkill", "CandidateSkills"]);
      let expData: any[] = extractArray(["experiences", "CandidateExperience", "CandidateExperiences"]);
      let eduData: any[] = extractArray(["educationList", "education", "CandidateEducation", "CandidateEducations"]);
      let projData: any[] = extractArray(["projectsList", "projects", "CandidateProject", "CandidateProjects"]);
      let certsData: any[] = extractArray(["certifications", "CandidateCertification", "CandidateCertifications"]);
      let langsData: any[] = extractArray(["languages", "CandidateLanguage", "CandidateLanguages"]);
      let achievementsData: any[] = extractArray(["achievements", "CandidateAchievement", "CandidateAchievements"]);
      let interestsData: any[] = extractArray(["interests", "CandidateInterest", "CandidateInterests"]);
      let socialsData: any[] = extractArray(["socials", "CandidateSocial", "CandidateSocials"]);

      // 3. ONLY if logged-in user IS THE OWNER, fetch owner's personal items via token
      if (currentIsOwner) {
        const safeFetch = async (fn: () => Promise<any>) => {
          try {
            return await fn();
          } catch {
            return [];
          }
        };

        const [
          mySkills,
          myExps,
          myEdus,
          myProjs,
          myCerts,
          myLangs,
          myAchievements,
          myInterests,
          mySocials,
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

        if (mySkills.length > 0) skillsData = mySkills;
        if (myExps.length > 0) expData = myExps;
        if (myEdus.length > 0) eduData = myEdus;
        if (myProjs.length > 0) projData = myProjs;
        if (myCerts.length > 0) certsData = myCerts;
        if (myLangs.length > 0) langsData = myLangs;
        if (myAchievements.length > 0) achievementsData = myAchievements;
        if (myInterests.length > 0) interestsData = myInterests;
        if (mySocials.length > 0) socialsData = mySocials;
      }

      interestsData = (interestsData || []).map((item: any) => ({
        ...item,
        name: item.name || item.title || item.interestName || "",
        category: item.category || item.type || "",
      }));

      if (baseData) {
        setCandidate({
          ...baseData,
          skills: skillsData,
          experiences: expData,
          educationList: eduData,
          projectsList: projData,
          certifications: certsData,
          languages: langsData,
          achievements: achievementsData,
          interests: interestsData,
          socials: socialsData,
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
          skills: skillsData,
          experiences: expData,
          educationList: eduData,
          projectsList: projData,
          certifications: certsData,
          languages: langsData,
          achievements: achievementsData,
          interests: interestsData,
          socials: socialsData,
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
          company: exp.company,
          companyName: exp.company,
          designation: exp.title,
          employmentType: exp.employmentType,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.currentlyWorking ? null : exp.endDate || null,
          currentlyWorking: Boolean(exp.currentlyWorking),
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
          name: cert.name || "",
          title: cert.name || "",
          certificateName: cert.name || "",
          issuingOrganization: cert.issuingOrganization || "",
          organization: cert.issuingOrganization || "",
          issuer: cert.issuingOrganization || "",
          authority: cert.issuingOrganization || "",
          issueDate: cert.issueDate || null,
          expirationDate: cert.expirationDate && cert.expirationDate.trim() !== "" ? cert.expirationDate : null,
          credentialUrl: cert.credentialUrl && cert.credentialUrl.trim() !== "" ? cert.credentialUrl : null,
          url: cert.credentialUrl && cert.credentialUrl.trim() !== "" ? cert.credentialUrl : null,
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
          name: interest.name || "",
          interestName: interest.name || "",
          type: interest.category || "",
          category: interest.category || "",
          followersCount: interest.followersCount !== undefined && interest.followersCount !== null ? Number(interest.followersCount) : undefined,
          imageUrl: interest.imageUrl || "",
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

        {/* PROFILE HEADER */}
        <ProfileHeader
          displayName={displayName}
          displayHeadline={displayHeadline}
          displayCompany={displayCompany}
          displayEducation={displayEducation}
          displayLocation={displayLocation}
          avatarUrl={candidate?.avatarUrl}
          isOwner={isOwner}
          onEditIntroClick={() => setActiveModal("intro")}
        />

        {/* SHARED SUB-NAV TAB BAR */}
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

            {isOwner && (
              <button
                onClick={() => setActiveTab("connections")}
                className={`py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "connections"
                  ? "border-[#0F5B78] text-[#0F5B78]"
                  : "border-transparent text-[#5A5F69] hover:text-[#000000]"
                  }`}
              >
                Connections
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: PROFILE */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* MAIN COLUMN */}
            <div className="lg:col-span-8 space-y-4">
              {/* 1. SUMMARY / ABOUT CARD (LINKEDIN STYLE) */}
              <SummarySection
                aboutText={displayAbout}
                websiteUrl={candidate?.websiteUrl}
                projects={candidateProjects}
                isOwner={isOwner}
                onEditClick={() => setActiveModal("about")}
                onSeeAllProjects={() => setActiveTab("projects")}
              />

              {/* 2. EXPERIENCE CARD */}
              <ExperienceSection
                editable={false}
                experiences={candidate?.experiences ?? []}
                onEditClick={isOwner ? () => setActiveModal("experience") : undefined}
              />

              {/* 3. EDUCATION CARD */}
              <EducationSection
                editable={false}
                education={candidate?.educationList ?? []}
                onEditClick={isOwner ? () => setActiveModal("education") : undefined}
              />

              {/* 4. ACCOMPLISHMENTS CARD */}
              <AchievementsSection
                editable={false}
                achievements={candidate?.achievements ?? []}
                onEditClick={isOwner ? () => setActiveModal("achievements") : undefined}
              />

              {/* 5. CERTIFICATION CARD */}
              <CertificationsSection
                editable={false}
                certifications={candidate?.certifications ?? []}
                onEditClick={isOwner ? () => setActiveModal("certifications") : undefined}
              />

              {/* 6. SKILLS CARD */}
              <SkillsSection
                editable={false}
                skills={candidate?.skills ?? []}
                onEditClick={isOwner ? () => setActiveModal("skills") : undefined}
              />

              {/* 7. LANGUAGES CARD */}
              <LanguagesSection
                editable={false}
                languages={candidate?.languages ?? []}
                onEditClick={isOwner ? () => setActiveModal("languages") : undefined}
              />

              {/* 8. INTERESTS CARD */}
              <InterestsSection
                editable={false}
                interests={candidate?.interests ?? []}
                onEditClick={isOwner ? () => setActiveModal("interests") : undefined}
              />
            </div>

            {/* SIDEBAR COLUMN */}
            <CandidateSidebar
              candidate={candidate}
              username={username}
              isOwner={isOwner}
              onEditSocialsClick={() => setActiveModal("socials")}
            />
          </div>
        )}

        {/* TAB 2: PROJECTS */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">
              <ProjectsSection
                editable={false}
                projects={candidate?.projectsList ?? []}
                onEditClick={isOwner ? () => setActiveModal("projects") : undefined}
              />
            </div>
            <CandidateSidebar
              candidate={candidate}
              username={username}
              isOwner={isOwner}
              onEditSocialsClick={() => setActiveModal("socials")}
            />
          </div>
        )}

        {/* TAB 3: CONNECTIONS (OWNER ONLY) */}
        {activeTab === "connections" && isOwner && (
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
            <CandidateSidebar
              candidate={candidate}
              username={username}
              isOwner={isOwner}
              onEditSocialsClick={() => setActiveModal("socials")}
            />
          </div>
        )}

      </div>

      {/* INLINE MODAL DIALOGS (LINKEDIN STYLE) */}
      <ProfileModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        candidate={candidate}
        initialBasicInfo={initialBasicInfo}
        modalSaving={modalSaving}
        onSaveIntro={handleSaveIntro}
        onSaveAbout={handleSaveAbout}
        onSaveExperience={handleSaveExperience}
        onSaveEducation={handleSaveEducation}
        onSaveSkills={handleSaveSkills}
        onSaveProjects={handleSaveProjects}
        onSaveCertifications={handleSaveCertifications}
        onSaveLanguages={handleSaveLanguages}
        onSaveAchievements={handleSaveAchievements}
        onSaveInterests={handleSaveInterests}
        onSaveSocials={handleSaveSocials}
      />
    </div>
  );
}

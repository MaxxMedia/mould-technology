"use client";

import { X } from "lucide-react";
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

export type ModalType =
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

interface ProfileModalsProps {
  activeModal: ModalType;
  onClose: () => void;
  candidate?: any;
  initialBasicInfo: BasicInfoValues;
  modalSaving: boolean;
  onSaveIntro: (values: BasicInfoValues) => Promise<void>;
  onSaveAbout: (text: string) => Promise<void>;
  onSaveExperience: (values: Experience[]) => Promise<void>;
  onSaveEducation: (values: Education[]) => Promise<void>;
  onSaveSkills: (values: Skill[]) => Promise<void>;
  onSaveProjects: (values: Project[]) => Promise<void>;
  onSaveCertifications: (values: Certification[]) => Promise<void>;
  onSaveLanguages: (values: Language[]) => Promise<void>;
  onSaveAchievements: (values: Achievement[]) => Promise<void>;
  onSaveInterests: (values: Interest[]) => Promise<void>;
  onSaveSocials: (values: SocialLink[]) => Promise<void>;
}

export default function ProfileModals({
  activeModal,
  onClose,
  candidate,
  initialBasicInfo,
  modalSaving,
  onSaveIntro,
  onSaveAbout,
  onSaveExperience,
  onSaveEducation,
  onSaveSkills,
  onSaveProjects,
  onSaveCertifications,
  onSaveLanguages,
  onSaveAchievements,
  onSaveInterests,
  onSaveSocials,
}: ProfileModalsProps) {
  if (!activeModal) return null;

  return (
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
            onClick={onClose}
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
              onSubmit={onSaveIntro}
              loading={modalSaving}
            />
          )}

          {activeModal === "about" && (
            <AboutForm
              initialValue={candidate?.about || ""}
              onSubmit={onSaveAbout}
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
              onSubmit={onSaveExperience}
              loading={modalSaving}
            />
          )}

          {activeModal === "education" && (
            <EducationForm
              initialValues={candidate?.educationList || []}
              onSubmit={onSaveEducation}
              loading={modalSaving}
            />
          )}

          {activeModal === "skills" && (
            <SkillsForm
              initialValues={candidate?.skills || []}
              onSubmit={onSaveSkills}
              loading={modalSaving}
            />
          )}

          {activeModal === "projects" && (
            <ProjectsForm
              initialValues={candidate?.projectsList || []}
              onSubmit={onSaveProjects}
              loading={modalSaving}
            />
          )}

          {activeModal === "certifications" && (
            <CertificationsForm
              initialValues={candidate?.certifications || []}
              onSubmit={onSaveCertifications}
              loading={modalSaving}
            />
          )}

          {activeModal === "languages" && (
            <LanguagesForm
              initialValues={candidate?.languages || []}
              onSubmit={onSaveLanguages}
              loading={modalSaving}
            />
          )}

          {activeModal === "achievements" && (
            <AchievementsForm
              initialValues={candidate?.achievements || []}
              onSubmit={onSaveAchievements}
              loading={modalSaving}
            />
          )}

          {activeModal === "interests" && (
            <InterestsForm
              initialValues={(candidate?.interests || []).map((i: any) => ({
                id: i.id,
                name: i.name || i.title || i.interestName || "",
                category: i.category || i.type || "",
                followersCount: i.followersCount,
                imageUrl: i.imageUrl,
              }))}
              onSubmit={onSaveInterests}
              loading={modalSaving}
            />
          )}

          {activeModal === "socials" && (
            <SocialLinksForm
              initialValues={candidate?.socials || []}
              onSubmit={onSaveSocials}
              loading={modalSaving}
            />
          )}
        </div>
      </div>
    </div>
  );
}

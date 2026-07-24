"use client";

import { useEffect, useState, useRef } from "react";
import {
    User,
    Briefcase,
    GraduationCap,
    Sparkles,
    Award,
    ShieldCheck,
    FolderOpen,
    Languages,
    Heart,
    Share2,
    Loader2,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import {
    fetchMyCandidateProfile,
    syncCandidateUserInStorage,
    updateMyCandidateProfile,
    type CandidateProfile,
} from "@/lib/candidateProfile";

// API imports
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
    getSkills,
    createSkill,
    updateSkill,
    deleteSkill,
} from "@/lib/api/candidate/skills";
import {
    getAchievements,
    createAchievement,
    updateAchievement,
    deleteAchievement,
} from "@/lib/api/candidate/achievements";
import {
    getCertifications,
    createCertification,
    updateCertification,
    deleteCertification,
} from "@/lib/api/candidate/certifications";
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
} from "@/lib/api/candidate/projects";
import {
    getLanguages,
    createLanguage,
    updateLanguage,
    deleteLanguage,
} from "@/lib/api/candidate/languages";
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

// Form imports
import BasicInfoForm, {
    type BasicInfoValues,
} from "@/components/candidate/profile/forms/BasicInfoForm";
import ExperienceForm, {
    type Experience,
} from "@/components/candidate/profile/forms/ExperienceForm";
import EducationForm, {
    type Education,
} from "@/components/candidate/profile/forms/EducationForm";
import SkillsForm, {
    type Skill,
} from "@/components/candidate/profile/forms/SkillsForm";
import AchievementsForm, {
    type Achievement,
} from "@/components/candidate/profile/forms/AchievementsForm";
import CertificationsForm, {
    type Certification,
} from "@/components/candidate/profile/forms/CertificationsForm";
import ProjectsForm, {
    type Project,
} from "@/components/candidate/profile/forms/ProjectsForm";
import LanguagesForm, {
    type Language,
} from "@/components/candidate/profile/forms/LanguagesForm";
import InterestsForm, {
    type Interest,
} from "@/components/candidate/profile/forms/InterestsForm";
import SocialLinksForm, {
    type SocialLink,
} from "@/components/candidate/profile/forms/SocialLinksForm";

const sidebarSections = [
    { id: "basic-info", label: "Basic Info", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Sparkles },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "certifications", label: "Certifications", icon: ShieldCheck },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "languages", label: "Languages", icon: Languages },
    { id: "interests", label: "Interests", icon: Heart },
    { id: "socials", label: "Social Links", icon: Share2 },
];

function Toast({
    message,
    type,
    onClose,
}: {
    message: string;
    type: "success" | "error";
    onClose: () => void;
}) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium animate-slide-up backdrop-blur-sm ${type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
        >
            {type === "success" ? (
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            ) : (
                <AlertCircle size={18} className="text-red-500 shrink-0" />
            )}
            {message}
            <button
                onClick={onClose}
                className="ml-2 text-current opacity-50 hover:opacity-100 transition-opacity"
            >
                ✕
            </button>
        </div>
    );
}

interface CandidateProfileEditCardProps {
    onProfileUpdated?: () => void;
}

export default function CandidateProfileEditCard({ onProfileUpdated }: CandidateProfileEditCardProps) {
    const [profile, setProfile] = useState<CandidateProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("basic-info");
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    // Section data
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [interests, setInterests] = useState<Interest[]>([]);
    const [socials, setSocials] = useState<SocialLink[]>([]);

    // Section loading states
    const [sectionLoading, setSectionLoading] = useState<Record<string, boolean>>({});

    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        async function loadAll() {
            try {
                const [
                    profileData,
                    expData,
                    eduData,
                    skillsData,
                    achievementsData,
                    certsData,
                    projectsData,
                    langsData,
                    interestsData,
                    socialsData,
                ] = await Promise.allSettled([
                    fetchMyCandidateProfile(),
                    getExperiences(),
                    getEducation(),
                    getSkills(),
                    getAchievements(),
                    getCertifications(),
                    getProjects(),
                    getLanguages(),
                    getInterests(),
                    getSocials(),
                ]);

                if (profileData.status === "fulfilled") setProfile(profileData.value);
                if (expData.status === "fulfilled")
                    setExperiences(
                        (expData.value || []).map((e: any) => ({
                            id: e.id,
                            title: e.designation || e.title || "",
                            company: e.companyName || e.company || "",
                            employmentType: e.employmentType || "",
                            location: e.location || "",
                            startDate: e.startDate || "",
                            endDate: e.endDate || "",
                            currentlyWorking: e.currentlyWorking || false,
                            description: e.description || "",
                        }))
                    );
                if (eduData.status === "fulfilled") setEducation(eduData.value || []);
                if (skillsData.status === "fulfilled") setSkills(skillsData.value || []);
                if (achievementsData.status === "fulfilled") setAchievements(achievementsData.value || []);
                if (certsData.status === "fulfilled") setCertifications(certsData.value || []);
                if (projectsData.status === "fulfilled") setProjects(projectsData.value || []);
                if (langsData.status === "fulfilled") setLanguages(langsData.value || []);
                if (interestsData.status === "fulfilled") setInterests(interestsData.value || []);
                if (socialsData.status === "fulfilled") setSocials(socialsData.value || []);
            } catch (err) {
                console.error("Failed to load profile data", err);
                showToast("Failed to load profile data", "error");
            } finally {
                setLoading(false);
            }
        }

        loadAll();
    }, []);

    function showToast(message: string, type: "success" | "error") {
        setToast({ message, type });
    }

    function scrollToSection(id: string) {
        setActiveSection(id);
        sectionRefs.current[id]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    function setSectionLoad(id: string, val: boolean) {
        setSectionLoading((prev) => ({ ...prev, [id]: val }));
    }

    async function handleBasicInfoSubmit(values: BasicInfoValues) {
        if (!profile) return;
        setSectionLoad("basic-info", true);
        try {
            const updated = await updateMyCandidateProfile({
                fullName: `${values.firstName} ${values.lastName}`.trim(),
                headline: values.headline,
                location: values.location,
                about: values.about,
                websiteUrl: values.website,
            });
            setProfile(updated);
            syncCandidateUserInStorage(updated);
            showToast("Basic info saved successfully!", "success");
            if (onProfileUpdated) onProfileUpdated();
        } catch {
            showToast("Failed to save basic info. Please try again.", "error");
        } finally {
            setSectionLoad("basic-info", false);
        }
    }

    async function handleExperienceSubmit(values: Experience[]) {
        setSectionLoad("experience", true);
        try {
            const existingIds = values.filter((v) => v.id).map((v) => v.id!);
            const toDelete = experiences.filter((e) => e.id && !existingIds.includes(e.id));
            for (const exp of toDelete) {
                await deleteExperience(exp.id!);
            }
            for (const exp of values) {
                if (exp.id) {
                    await updateExperience(exp.id, exp);
                } else {
                    await createExperience(exp);
                }
            }
            const fresh = await getExperiences();
            setExperiences(
                (fresh || []).map((e: any) => ({
                    id: e.id,
                    title: e.designation || e.title || "",
                    company: e.companyName || e.company || "",
                    employmentType: e.employmentType || "",
                    location: e.location || "",
                    startDate: e.startDate || "",
                    endDate: e.endDate || "",
                    currentlyWorking: e.currentlyWorking || false,
                    description: e.description || "",
                }))
            );
            showToast("Experience saved successfully!", "success");
            if (onProfileUpdated) onProfileUpdated();
        } catch {
            showToast("Failed to save experience. Please try again.", "error");
        } finally {
            setSectionLoad("experience", false);
        }
    }

    async function handleEducationSubmit(values: Education[]) {
        setSectionLoad("education", true);
        try {
            const existingIds = values.filter((v) => v.id).map((v) => v.id!);
            const toDelete = education.filter((e) => e.id && !existingIds.includes(e.id));
            for (const item of toDelete) {
                await deleteEducation(item.id!);
            }
            for (const item of values) {
                if (item.id) {
                    await updateEducation(item.id, item);
                } else {
                    await createEducation(item);
                }
            }
            const fresh = await getEducation();
            setEducation(fresh || []);
            showToast("Education saved successfully!", "success");
            if (onProfileUpdated) onProfileUpdated();
        } catch {
            showToast("Failed to save education. Please try again.", "error");
        } finally {
            setSectionLoad("education", false);
        }
    }

    async function handleSkillsSubmit(values: Skill[]) {
        setSectionLoad("skills", true);
        try {
            const existingIds = values.filter((v) => v.id).map((v) => v.id!);
            const toDelete = skills.filter((s) => s.id && !existingIds.includes(s.id));
            for (const item of toDelete) {
                await deleteSkill(item.id!);
            }
            for (const item of values) {
                if (item.id) {
                    await updateSkill(item.id, { name: item.name, level: item.level });
                } else {
                    await createSkill({ name: item.name, level: item.level });
                }
            }
            const fresh = await getSkills();
            setSkills(fresh || []);
            showToast("Skills saved successfully!", "success");
            if (onProfileUpdated) onProfileUpdated();
        } catch {
            showToast("Failed to save skills. Please try again.", "error");
        } finally {
            setSectionLoad("skills", false);
        }
    }

    async function handleAchievementsSubmit(values: Achievement[]) {
        setSectionLoad("achievements", true);
        try {
            const existingIds = values.filter((v) => v.id).map((v) => v.id!);
            const toDelete = achievements.filter((a) => a.id && !existingIds.includes(a.id));
            for (const item of toDelete) {
                await deleteAchievement(item.id!);
            }
            for (const item of values) {
                if (item.id) {
                    await updateAchievement(item.id, item);
                } else {
                    await createAchievement(item);
                }
            }
            const fresh = await getAchievements();
            setAchievements(fresh || []);
            showToast("Achievements saved successfully!", "success");
            if (onProfileUpdated) onProfileUpdated();
        } catch {
            showToast("Failed to save achievements. Please try again.", "error");
        } finally {
            setSectionLoad("achievements", false);
        }
    }

    async function handleCertificationsSubmit(values: Certification[]) {
        setSectionLoad("certifications", true);
        try {
            const existingIds = values.filter((v) => v.id).map((v) => v.id!);
            const toDelete = certifications.filter((c) => c.id && !existingIds.includes(c.id));
            for (const item of toDelete) {
                await deleteCertification(item.id!);
            }
            for (const item of values) {
                if (item.id) {
                    await updateCertification(item.id, item);
                } else {
                    await createCertification(item);
                }
            }
            const fresh = await getCertifications();
            setCertifications(fresh || []);
            showToast("Certifications saved successfully!", "success");
            if (onProfileUpdated) onProfileUpdated();
        } catch {
            showToast("Failed to save certifications. Please try again.", "error");
        } finally {
            setSectionLoad("certifications", false);
        }
    }

    async function handleProjectsSubmit(values: Project[]) {
        setSectionLoad("projects", true);
        try {
            const existingIds = values.filter((v) => v.id).map((v) => v.id!);
            const toDelete = projects.filter((p) => p.id && !existingIds.includes(p.id));
            for (const item of toDelete) {
                await deleteProject(item.id!);
            }
            for (const item of values) {
                if (item.id) {
                    await updateProject(item.id, item);
                } else {
                    await createProject(item);
                }
            }
            const fresh = await getProjects();
            setProjects(fresh || []);
            showToast("Projects saved successfully!", "success");
            if (onProfileUpdated) onProfileUpdated();
        } catch {
            showToast("Failed to save projects. Please try again.", "error");
        } finally {
            setSectionLoad("projects", false);
        }
    }

    async function handleLanguagesSubmit(values: Language[]) {
        setSectionLoad("languages", true);
        try {
            const existingIds = values.filter((v) => v.id).map((v) => v.id!);
            const toDelete = languages.filter((l) => l.id && !existingIds.includes(l.id));
            for (const item of toDelete) {
                await deleteLanguage(item.id!);
            }
            for (const item of values) {
                if (item.id) {
                    await updateLanguage(item.id, {
                        language: item.language,
                        proficiency: item.proficiency,
                    });
                } else {
                    await createLanguage({
                        language: item.language,
                        proficiency: item.proficiency,
                    });
                }
            }
            const fresh = await getLanguages();
            setLanguages(fresh || []);
            showToast("Languages saved successfully!", "success");
            if (onProfileUpdated) onProfileUpdated();
        } catch {
            showToast("Failed to save languages. Please try again.", "error");
        } finally {
            setSectionLoad("languages", false);
        }
    }

    async function handleInterestsSubmit(values: Interest[]) {
        setSectionLoad("interests", true);
        try {
            const existingIds = values.filter((v) => v.id).map((v) => v.id!);
            const toDelete = interests.filter((i) => i.id && !existingIds.includes(i.id));
            for (const item of toDelete) {
                await deleteInterest(item.id!);
            }
            for (const item of values) {
                if (item.id) {
                    await updateInterest(item.id, {
                        title: item.name,
                        type: item.category,
                    });
                } else {
                    await createInterest({
                        title: item.name,
                        type: item.category,
                    });
                }
            }
            const fresh = await getInterests();
            setInterests(fresh || []);
            showToast("Interests saved successfully!", "success");
            if (onProfileUpdated) onProfileUpdated();
        } catch {
            showToast("Failed to save interests. Please try again.", "error");
        } finally {
            setSectionLoad("interests", false);
        }
    }

    async function handleSocialsSubmit(values: SocialLink[]) {
        setSectionLoad("socials", true);
        try {
            const existingIds = values.filter((v) => v.id).map((v) => v.id!);
            const toDelete = socials.filter((s) => s.id && !existingIds.includes(s.id));
            for (const item of toDelete) {
                await deleteSocial(item.id!);
            }
            for (const item of values) {
                if (item.id) {
                    await updateSocial(item.id, item);
                } else {
                    await createSocial(item);
                }
            }
            const fresh = await getSocials();
            setSocials(fresh || []);
            showToast("Social links saved successfully!", "success");
            if (onProfileUpdated) onProfileUpdated();
        } catch {
            showToast("Failed to save social links. Please try again.", "error");
        } finally {
            setSectionLoad("socials", false);
        }
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-[#e0e0e0] p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2] mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading edit forms...</p>
            </div>
        );
    }

    const nameParts = (profile?.fullName || "").split(" ");
    const basicInfoValues: BasicInfoValues = {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        headline: profile?.headline || "",
        currentPosition: profile?.headline?.split(" at ")[0] || "",
        company: (profile?.company as any)?.name || (profile?.Company as any)?.name || "",
        location: profile?.location || "",
        website: profile?.websiteUrl || "",
        phone: "",
        email: profile?.email || "",
        about: profile?.about || "",
        avatar: profile?.avatarUrl || "",
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* SIDEBAR NAVIGATION */}
            <aside className="lg:col-span-3">
                <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm lg:sticky lg:top-6 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Select Section To Edit
                        </p>
                    </div>
                    <nav className="p-2 space-y-1">
                        {sidebarSections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                                            ? "bg-[#0a66c2] text-white shadow-sm font-semibold"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    <Icon
                                        size={16}
                                        className={isActive ? "text-white" : "text-[#0a66c2]"}
                                    />
                                    {section.label}
                                    {sectionLoading[section.id] && (
                                        <Loader2
                                            size={14}
                                            className={`ml-auto animate-spin ${isActive ? "text-white" : "text-[#0a66c2]"
                                                }`}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* SINGLE ACTIVE FORM CARD (NO LONG LADDER SCROLL) */}
            <main className="lg:col-span-9 space-y-6">
                {/* Horizontal Mobile/Sub Section Tabs */}
                <div className="bg-white rounded-lg border border-[#e0e0e0] p-2 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {sidebarSections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${isActive
                                        ? "bg-[#0a66c2] text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                <Icon size={14} />
                                {section.label}
                            </button>
                        );
                    })}
                </div>

                {activeSection === "basic-info" && (
                    <SectionCard
                        title="Basic Information"
                        icon={User}
                        description="Your personal and contact details"
                    >
                        <BasicInfoForm
                            initialValues={basicInfoValues}
                            loading={sectionLoading["basic-info"]}
                            onSubmit={handleBasicInfoSubmit}
                        />
                    </SectionCard>
                )}

                {activeSection === "experience" && (
                    <SectionCard
                        title="Experience"
                        icon={Briefcase}
                        description="Your professional work history"
                    >
                        <ExperienceForm
                            initialValues={experiences}
                            loading={sectionLoading["experience"]}
                            onSubmit={handleExperienceSubmit}
                        />
                    </SectionCard>
                )}

                {activeSection === "education" && (
                    <SectionCard
                        title="Education"
                        icon={GraduationCap}
                        description="Your academic background"
                    >
                        <EducationForm
                            initialValues={education}
                            loading={sectionLoading["education"]}
                            onSubmit={handleEducationSubmit}
                        />
                    </SectionCard>
                )}

                {activeSection === "skills" && (
                    <SectionCard
                        title="Skills"
                        icon={Sparkles}
                        description="Technical and professional skills"
                    >
                        <SkillsForm
                            initialValues={skills}
                            loading={sectionLoading["skills"]}
                            onSubmit={handleSkillsSubmit}
                        />
                    </SectionCard>
                )}

                {activeSection === "achievements" && (
                    <SectionCard
                        title="Achievements"
                        icon={Award}
                        description="Awards, recognitions, and honors"
                    >
                        <AchievementsForm
                            initialValues={achievements}
                            loading={sectionLoading["achievements"]}
                            onSubmit={handleAchievementsSubmit}
                        />
                    </SectionCard>
                )}

                {activeSection === "certifications" && (
                    <SectionCard
                        title="Certifications"
                        icon={ShieldCheck}
                        description="Professional certifications and licenses"
                    >
                        <CertificationsForm
                            initialValues={certifications}
                            loading={sectionLoading["certifications"]}
                            onSubmit={handleCertificationsSubmit}
                        />
                    </SectionCard>
                )}

                {activeSection === "projects" && (
                    <SectionCard
                        title="Projects"
                        icon={FolderOpen}
                        description="Showcase your notable projects"
                    >
                        <ProjectsForm
                            initialValues={projects}
                            loading={sectionLoading["projects"]}
                            onSubmit={handleProjectsSubmit}
                        />
                    </SectionCard>
                )}

                {activeSection === "languages" && (
                    <SectionCard
                        title="Languages"
                        icon={Languages}
                        description="Languages you speak"
                    >
                        <LanguagesForm
                            initialValues={languages}
                            loading={sectionLoading["languages"]}
                            onSubmit={handleLanguagesSubmit}
                        />
                    </SectionCard>
                )}

                {activeSection === "interests" && (
                    <SectionCard
                        title="Interests"
                        icon={Heart}
                        description="Topics and industries you follow"
                    >
                        <InterestsForm
                            initialValues={interests}
                            loading={sectionLoading["interests"]}
                            onSubmit={handleInterestsSubmit}
                        />
                    </SectionCard>
                )}

                {activeSection === "socials" && (
                    <SectionCard
                        title="Social Links"
                        icon={Share2}
                        description="Connect your social profiles"
                    >
                        <SocialLinksForm
                            initialValues={socials}
                            loading={sectionLoading["socials"]}
                            onSubmit={handleSocialsSubmit}
                        />
                    </SectionCard>
                )}
            </main>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

function SectionCard({
    title,
    icon: Icon,
    description,
    children,
}: {
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0a66c2]/10 flex items-center justify-center">
                        <Icon size={18} className="text-[#0a66c2]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                    </div>
                </div>
            </div>
            <div className="px-6 py-6">{children}</div>
        </div>
    );
}

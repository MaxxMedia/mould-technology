"use client";

import { useEffect, useState } from "react";

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

// Import types
import type { BasicInfoValues } from "../../../../components/candidate/profile/forms/BasicInfoForm";
import type { Skill } from "../../../../components/candidate/profile/forms/SkillsForm";
import type { Experience } from "../../../../components/candidate/profile/forms/ExperienceForm";
import type { Education } from "../../../../components/candidate/profile/forms/EducationForm";
import type { Project } from "../../../../components/candidate/profile/forms/ProjectsForm";
import type { Certification } from "../../../../components/candidate/profile/forms/CertificationsForm";
import type { Language } from "../../../../components/candidate/profile/forms/LanguagesForm";
import type { Achievement } from "../../../../components/candidate/profile/forms/AchievementsForm";
import type { Interest } from "../../../../components/candidate/profile/forms/InterestsForm";
import type { SocialLink } from "../../../../components/candidate/profile/forms/SocialLinksForm";

// Import components
import BasicInfoForm from "../../../../components/candidate/profile/forms/BasicInfoForm";
import SkillsForm from "../../../../components/candidate/profile/forms/SkillsForm";
import ExperienceForm from "../../../../components/candidate/profile/forms/ExperienceForm";
import EducationForm from "../../../../components/candidate/profile/forms/EducationForm";
import ProjectsForm from "../../../../components/candidate/profile/forms/ProjectsForm";
import CertificationsForm from "../../../../components/candidate/profile/forms/CertificationsForm";
import LanguagesForm from "../../../../components/candidate/profile/forms/LanguagesForm";
import AchievementsForm from "../../../../components/candidate/profile/forms/AchievementsForm";
import InterestsForm from "../../../../components/candidate/profile/forms/InterestsForm";
import SocialLinksForm from "../../../../components/candidate/profile/forms/SocialLinksForm";

export default function CandidateProfilePage() {
  const [basicInfo, setBasicInfo] = useState<BasicInfoValues>({
    firstName: "",
    lastName: "",
    headline: "",
    currentPosition: "",
    company: "",
    location: "",
    website: "",
    phone: "",
    email: "",
    about: "",
    avatar: "",
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();

      const names = (data.fullName || "").split(" ");

      setBasicInfo({
        firstName: names[0] || "",
        lastName: names.slice(1).join(" "),
        headline: data.headline || "",
        currentPosition: "",
        company: "",
        location: data.location || "",
        website: data.websiteUrl || "",
        phone: "",
        email: data.email || "",
        about: data.about || "",
        avatar: data.avatarUrl || "",
      });

      // Load each section individually with error handling
      try {
        const skillData = await getSkills();
        setSkills(skillData || []);
      } catch (err) {
        console.error("Failed to load skills:", err);
        setSkills([]);
      }

      try {
        const experienceData = await getExperiences();
        setExperiences(experienceData || []);
      } catch (err) {
        console.error("Failed to load experiences:", err);
        setExperiences([]);
      }

      try {
        const educationData = await getEducation();
        setEducation(educationData || []);
      } catch (err) {
        console.error("Failed to load education:", err);
        setEducation([]);
      }

      try {
        const projectData = await getProjects();
        setProjects(projectData || []);
      } catch (err) {
        console.error("Failed to load projects:", err);
        setProjects([]);
      }

   try {
  const certData = await getCertifications();
  // Format dates for display in the form (yyyy-MM-dd)
  // Map backend fields: title -> name, organization -> issuingOrganization, expiryDate -> expirationDate
  const formattedCertData = certData.map((cert: any) => ({
    id: cert.id,
    name: cert.title || "", // ✅ Map from backend 'title' to frontend 'name'
    issuingOrganization: cert.organization || "",
    credentialUrl: cert.credentialUrl || "",
    issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : "",
    expirationDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : "",
  }));
  setCertifications(formattedCertData || []);
} catch (err) {
  console.error("Failed to load certifications:", err);
  setCertifications([]);
}

      try {
        const languageData = await getLanguages();
        setLanguages(languageData || []);
      } catch (err) {
        console.error("Failed to load languages:", err);
        setLanguages([]);
      }

      try {
        const achievementData = await getAchievements();
        setAchievements(achievementData || []);
      } catch (err) {
        console.error("Failed to load achievements:", err);
        setAchievements([]);
      }

      try {
  const interestData = await getInterests();
  // Map backend fields: title -> name, type -> category
  const formattedInterestData = interestData.map((item: any) => ({
    id: item.id,
    name: item.title || "",
    category: item.type || "",
    followersCount: 0,
    imageUrl: "",
  }));
  setInterests(formattedInterestData || []);
} catch (err) {
  console.error("Failed to load interests:", err);
  setInterests([]);
}

      try {
        const socialData = await getSocials();
        setSocials(socialData || []);
      } catch (err) {
        console.error("Failed to load socials:", err);
        setSocials([]);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoSubmit = async (
    values: BasicInfoValues
  ) => {
    try {
      await updateMyProfile({
        fullName: `${values.firstName} ${values.lastName}`.trim(),
        headline: values.headline,
        location: values.location,
        about: values.about,
        avatarUrl: values.avatar,
        websiteUrl: values.website,
      });

      await loadProfile();
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  const handleSkillsSubmit = async (
    values: Skill[]
  ) => {
    try {
      const currentIds = new Set(
        values
          .filter((s) => s.id)
          .map((s) => s.id!)
      );

      for (const skill of values) {
        if (!skill.id) {
          await createSkill({
            name: skill.name,
            level: skill.level,
          });
        }
      }

      for (const skill of values) {
        if (skill.id) {
          await updateSkill(skill.id, {
            name: skill.name,
            level: skill.level,
          });
        }
      }

      for (const skill of skills) {
        if (skill.id && !currentIds.has(skill.id)) {
          await deleteSkill(skill.id);
        }
      }

      const updatedSkills = await getSkills();
      setSkills(updatedSkills);
      alert("Skills updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update skills");
    }
  };

  const handleExperienceSubmit = async (
    values: Experience[]
  ) => {
    try {
      const currentIds = new Set(
        values
          .filter((exp) => exp.id)
          .map((exp) => exp.id!)
      );

      // Create
      for (const exp of values) {
        if (!exp.id) {
          await createExperience({
            company: exp.company,
            title: exp.title,
            employmentType: exp.employmentType,
            location: exp.location,
            startDate: exp.startDate,
            endDate: exp.endDate,
            currentlyWorking: exp.currentlyWorking,
            description: exp.description,
          });
        }
      }

      // Update
      for (const exp of values) {
        if (exp.id) {
          await updateExperience(exp.id, {
            company: exp.company,
            title: exp.title,
            employmentType: exp.employmentType,
            location: exp.location,
            startDate: exp.startDate,
            endDate: exp.endDate,
            currentlyWorking: exp.currentlyWorking,
            description: exp.description,
          });
        }
      }

      // Delete
      for (const exp of experiences) {
        if (exp.id && !currentIds.has(exp.id)) {
          await deleteExperience(exp.id);
        }
      }

      const updated = await getExperiences();
      setExperiences(updated);
      alert("Experience updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update experience");
    }
  };

  const handleEducationSubmit = async (
    values: Education[]
  ) => {
    try {
      const currentIds = new Set(
        values
          .filter((edu) => edu.id)
          .map((edu) => edu.id!)
      );

      for (const edu of values) {
        if (!edu.id) {
          await createEducation({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startYear: edu.startYear,
            endYear: edu.endYear,
            grade: edu.grade,
            description: edu.description,
          });
        }
      }

      for (const edu of values) {
        if (edu.id) {
          await updateEducation(edu.id, {
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startYear: edu.startYear,
            endYear: edu.endYear,
            grade: edu.grade,
            description: edu.description,
          });
        }
      }

      for (const edu of education) {
        if (edu.id && !currentIds.has(edu.id)) {
          await deleteEducation(edu.id);
        }
      }

      const updated = await getEducation();
      setEducation(updated);
      alert("Education updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update education");
    }
  };

  const handleProjectsSubmit = async (
    values: Project[]
  ) => {
    try {
      const currentIds = new Set(
        values
          .filter((project) => project.id)
          .map((project) => project.id!)
      );

      for (const project of values) {
        if (!project.id) {
          await createProject({
            title: project.title,
            description: project.description,
            technologies: project.technologies,
            projectUrl: project.projectUrl,
            imageUrl: project.imageUrl,
            startDate: project.startDate,
            endDate: project.endDate,
          });
        }
      }

      for (const project of values) {
        if (project.id) {
          await updateProject(project.id, {
            title: project.title,
            description: project.description,
            technologies: project.technologies,
            projectUrl: project.projectUrl,
            imageUrl: project.imageUrl,
            startDate: project.startDate,
            endDate: project.endDate,
          });
        }
      }

      for (const project of projects) {
        if (project.id && !currentIds.has(project.id)) {
          await deleteProject(project.id);
        }
      }

      const updated = await getProjects();
      setProjects(updated);
      alert("Projects updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update projects");
    }
  };

const handleCertificationsSubmit = async (
  values: Certification[]
) => {
  try {
    // Format dates before sending to API
    const formattedValues = values.map(cert => ({
      ...cert,
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString() : null,
      expiryDate: cert.expirationDate ? new Date(cert.expirationDate).toISOString() : null,
    }));

    // Call the API to save certifications
    const currentIds = new Set(
      values
        .filter((cert) => cert.id)
        .map((cert) => cert.id!)
    );

    // Create new certifications
    for (const cert of formattedValues) {
      if (!cert.id) {
        console.log("Creating certification with data:", {
          title: cert.name, // ✅ Map 'name' to 'title'
          organization: cert.issuingOrganization,
          credentialUrl: cert.credentialUrl,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
        });

        await createCertification({
          title: cert.name, // ✅ Map 'name' to 'title' for backend
          organization: cert.issuingOrganization,
          credentialUrl: cert.credentialUrl,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
        });
      }
    }

    // Update existing certifications
    for (const cert of formattedValues) {
      if (cert.id) {
        await updateCertification(cert.id, {
          title: cert.name, // ✅ Map 'name' to 'title' for backend
          organization: cert.issuingOrganization,
          credentialUrl: cert.credentialUrl,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
        });
      }
    }

    // Delete removed certifications
    for (const cert of certifications) {
      if (cert.id && !currentIds.has(cert.id)) {
        await deleteCertification(cert.id);
      }
    }

    // Reload certifications with formatted dates
    const updated = await getCertifications();
    const formattedUpdated = updated.map((cert: any) => ({
      id: cert.id,
      name: cert.title || "", // ✅ Map from backend 'title' to frontend 'name'
      issuingOrganization: cert.organization || "",
      credentialUrl: cert.credentialUrl || "",
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : "",
      expirationDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : "",
    }));
    setCertifications(formattedUpdated);
    alert("Certifications updated successfully");
  } catch (err) {
    console.error("Error updating certifications:", err);
    alert("Failed to update certifications");
  }
};

  const handleLanguagesSubmit = async (
    values: Language[]
  ) => {
    try {
      const currentIds = new Set(
        values
          .filter((lang) => lang.id)
          .map((lang) => lang.id!)
      );

      for (const lang of values) {
        if (!lang.id) {
          await createLanguage({
            language: lang.language,
            proficiency: lang.proficiency,
          });
        }
      }

      for (const lang of values) {
        if (lang.id) {
          await updateLanguage(lang.id, {
            language: lang.language,
            proficiency: lang.proficiency,
          });
        }
      }

      for (const lang of languages) {
        if (lang.id && !currentIds.has(lang.id)) {
          await deleteLanguage(lang.id);
        }
      }

      const updated = await getLanguages();
      setLanguages(updated);
      alert("Languages updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update languages");
    }
  };

  const handleAchievementsSubmit = async (
    values: Achievement[]
  ) => {
    try {
      const currentIds = new Set(
        values
          .filter((achievement) => achievement.id)
          .map((achievement) => achievement.id!)
      );

      for (const achievement of values) {
        if (!achievement.id) {
          await createAchievement({
            title: achievement.title,
            description: achievement.description,
            achievementDate: achievement.achievementDate,
          });
        }
      }

      for (const achievement of values) {
        if (achievement.id) {
          await updateAchievement(achievement.id, {
            title: achievement.title,
            description: achievement.description,
            achievementDate: achievement.achievementDate,
          });
        }
      }

      for (const achievement of achievements) {
        if (achievement.id && !currentIds.has(achievement.id)) {
          await deleteAchievement(achievement.id);
        }
      }

      const updated = await getAchievements();
      setAchievements(updated);
      alert("Achievements updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update achievements");
    }
  };

 const handleInterestsSubmit = async (
  values: Interest[]
) => {
  try {
    // Map frontend fields to backend schema
    const formattedValues = values.map(interest => ({
      title: interest.name, // ✅ Map 'name' to 'title'
      type: interest.category, // ✅ Map 'category' to 'type'
    }));

    const currentIds = new Set(
      values
        .filter((interest) => interest.id)
        .map((interest) => interest.id!)
    );

    // Create new interests
    for (const interest of formattedValues) {
      // Find the original to check if it has an id
      const original = values.find(v => v.name === interest.title);
      if (!original?.id) {
        await createInterest(interest);
      }
    }

    // Update existing interests
    for (const interest of formattedValues) {
      const original = values.find(v => v.name === interest.title);
      if (original?.id) {
        await updateInterest(original.id, interest);
      }
    }

    // Delete removed interests
    for (const interest of interests) {
      if (interest.id && !currentIds.has(interest.id)) {
        await deleteInterest(interest.id);
      }
    }

    // Reload interests
    const updated = await getInterests();
    // Map backend fields back to frontend format
    const formattedUpdated = updated.map((item: any) => ({
      id: item.id,
      name: item.title || "",
      category: item.type || "",
      followersCount: 0,
      imageUrl: "",
    }));
    setInterests(formattedUpdated);
    alert("Interests updated successfully");
  } catch (err) {
    console.error(err);
    alert("Failed to update interests");
  }
};

  const handleSocialsSubmit = async (
    values: SocialLink[]
  ) => {
    try {
      const currentIds = new Set(
        values
          .filter((social) => social.id)
          .map((social) => social.id!)
      );

      for (const social of values) {
        if (!social.id) {
          await createSocial({
            platform: social.platform,
            url: social.url,
          });
        }
      }

      for (const social of values) {
        if (social.id) {
          await updateSocial(social.id, {
            platform: social.platform,
            url: social.url,
          });
        }
      }

      for (const social of socials) {
        if (social.id && !currentIds.has(social.id)) {
          await deleteSocial(social.id);
        }
      }

      const updated = await getSocials();
      setSocials(updated);
      alert("Social links updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update social links");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-5">
        <div className="text-center py-20">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-5 space-y-8">
      <BasicInfoForm
        initialValues={basicInfo}
        onSubmit={handleBasicInfoSubmit}
      />

      <SkillsForm
        initialValues={skills}
        onSubmit={handleSkillsSubmit}
      />

      <ExperienceForm
        initialValues={experiences}
        onSubmit={handleExperienceSubmit}
      />

      <EducationForm
        initialValues={education}
        onSubmit={handleEducationSubmit}
      />

      <ProjectsForm
        initialValues={projects}
        onSubmit={handleProjectsSubmit}
      />

      <CertificationsForm
        initialValues={certifications}
        onSubmit={handleCertificationsSubmit}
      />

      <LanguagesForm
        initialValues={languages}
        onSubmit={handleLanguagesSubmit}
      />

      <AchievementsForm
        initialValues={achievements}
        onSubmit={handleAchievementsSubmit}
      />

      <InterestsForm
        initialValues={interests}
        onSubmit={handleInterestsSubmit}
      />

      <SocialLinksForm
        initialValues={socials}
        onSubmit={handleSocialsSubmit}
      />
    </div>
  );
}
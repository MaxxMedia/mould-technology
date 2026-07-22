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
};

interface Props {
  username: string;
}

export default function CandidateLinkedInProfile({ username }: Props) {
  const [candidate, setCandidate] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "projects" | "activity" | "connections">("profile");
  const [connectionsSubTab, setConnectionsSubTab] = useState<"all" | "people" | "companies">("all");
  const [connectionSearch, setConnectionSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    async function loadCandidate() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/${username}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          setCandidate(data);
        } else {
          // Fallback dummy profile for Gopinath
          setCandidate({
            username: username || "gopinath2322002",
            fullName: username.includes("gopinath") ? "Gopinath Candidate" : username,
            headline: "Certified PMP with 7 years of experience leading cross-functional teams in agile environments. Successfully delivered 15+ large-scale IT projects on time and 10% under budget.",
            about: "Art-minded, creative visionary, design-focused, digital content creator passionate about manufacturing technology, sales execution, moulding dynamics, entrepreneurship, branding, and smart engineering.",
            location: "Bengaluru, Karnataka, India",
            company: "Maxx Business Media",
            education: "BMS College of Engineering / Cal Poly",
            websiteUrl: "https://toolingtrends.com",
          });
        }
      } catch (err) {
        console.error("Failed to load candidate, using fallback data", err);
        setCandidate({
          username: username || "gopinath2322002",
          fullName: "Gopinath Candidate",
          headline: "Certified PMP with 7 years of experience leading cross-functional teams in agile environments. Successfully delivered 15+ large-scale IT projects on time and 10% under budget.",
          about: "Art-minded, creative visionary, design-focused, digital content creator passionate about manufacturing technology, sales execution, moulding dynamics, entrepreneurship, branding, and smart engineering.",
          location: "Bengaluru, Karnataka, India",
          company: "Maxx Business Media",
          education: "BMS College of Engineering / Cal Poly",
          websiteUrl: "https://toolingtrends.com",
        });
      } finally {
        setLoading(false);
      }
    }

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
                  500+ connections
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
                  className="w-full text-center text-sm font-semibold text-[#0a66c2] hover:underline mt-4 pt-2 border-t border-gray-100"
                >
                  See all projects →
                </button>
              </div>

              {/* SKILLS CARD */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm relative">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
                  <Pencil size={16} />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    "Photoshop",
                    "Illustrator",
                    "InDesign",
                    "After Effects",
                    "React",
                    "Node.js",
                    "Project Management",
                    "Sales Execution",
                    "Mould Design",
                    "CAD/CAM",
                    "Agile Methodology",
                    "Quality Assurance",
                    "Supply Chain",
                    "CNC Machining"
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="border-1.5 border-[#0a66c2] text-gray-800 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium hover:bg-[#0a66c2]/5 transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* EXPERIENCE CARD */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm relative">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
                  <Pencil size={16} />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience</h2>

                <div className="space-y-6 divide-y divide-gray-100">
                  {/* Experience 1 */}
                  <div className="flex items-start gap-4 pt-2 first:pt-0">
                    <div className="w-11 h-11 rounded-md bg-[#0f5b78] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                      MBM
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">Process Executive - Sales</h3>
                      <p className="text-sm font-medium text-gray-700">Maxx Business Media</p>
                      <p className="text-xs text-gray-500 mt-0.5">Dec 2021 - Present &nbsp;|&nbsp; Bengaluru, Karnataka Area</p>
                      <ul className="list-disc list-inside text-xs sm:text-sm text-gray-700 mt-2 space-y-1 leading-relaxed">
                        <li>Lead sales execution and process operations for industrial tooling media campaigns.</li>
                        <li>Coordinate cross-functional technical teams delivering 15+ large-scale projects on schedule.</li>
                        <li>Build candidate pipelines, customer engagement frameworks, and client technical workflows.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Experience 2 */}
                  <div className="flex items-start gap-4 pt-6">
                    <div className="w-11 h-11 rounded-md bg-[#0a66c2] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                      GC
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">Senior Tooling & Production Lead</h3>
                      <p className="text-sm font-medium text-gray-700">Freelance & Consulting</p>
                      <p className="text-xs text-gray-500 mt-0.5">March 2018 - Dec 2021</p>
                      <p className="text-xs sm:text-sm text-gray-700 mt-2">
                        Freelance technical designer, process engineer, and industrial tooling consultant.
                      </p>
                      <p className="text-xs text-[#0a66c2] mt-1">
                        Visit website: <a href="#" className="underline font-semibold">www.gopinath-tooling.com</a>
                      </p>
                    </div>
                  </div>

                  {/* Experience 3 */}
                  <div className="flex items-start gap-4 pt-6">
                    <div className="w-11 h-11 rounded-md bg-slate-700 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                      TD
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">Manufacturing & Quality Engineer</h3>
                      <p className="text-sm font-medium text-gray-700">Tooling Dynamics Corp</p>
                      <p className="text-xs text-gray-500 mt-0.5">Jan 2016 - Feb 2018 &nbsp;|&nbsp; Pune, Maharashtra Area</p>
                      <ul className="list-disc list-inside text-xs sm:text-sm text-gray-700 mt-2 space-y-1 leading-relaxed">
                        <li>Supervised high-precision CNC machining and mould tooling quality assurance checks.</li>
                        <li>Reduced operational downtime by 14% through process optimization and preventive maintenance.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* EDUCATION CARD */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm relative">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
                  <Pencil size={16} />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-md bg-[#0b4a3f] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    CP
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{displayEducation}</h3>
                    <p className="text-sm text-gray-700">Bachelor of Engineering (B.E.), Mechanical & Tooling Engineering</p>
                    <p className="text-xs text-gray-500 mt-1">Minor in Industrial Automation & Management • 2012-2016</p>
                  </div>
                </div>
              </div>

              {/* ACCOMPLISHMENTS CARD */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Accomplishments</h2>
                <div className="space-y-4 divide-y divide-gray-100">
                  <div className="flex items-start gap-4 pt-2 first:pt-0">
                    <span className="text-xl font-extrabold text-[#0a66c2] w-6 shrink-0 text-center">4</span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0a66c2]">Organizations</h4>
                      <p className="text-xs sm:text-sm text-gray-700 mt-0.5">
                        Tooling & Manufacturing Association • PMP Chapter India • SAE India • Smart Manufacturing Forum
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pt-4">
                    <span className="text-xl font-extrabold text-[#0a66c2] w-6 shrink-0 text-center">3</span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0a66c2]">Honors & Awards</h4>
                      <p className="text-xs sm:text-sm text-gray-700 mt-0.5">
                        Best Process Efficiency Award • Industrial Design Innovation Award • Dean's List
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pt-4">
                    <span className="text-xl font-extrabold text-[#0a66c2] w-6 shrink-0 text-center">3</span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0a66c2]">Languages</h4>
                      <p className="text-xs sm:text-sm text-gray-700 mt-0.5">
                        English • Hindi • Kannada
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pt-4">
                    <span className="text-xl font-extrabold text-[#0a66c2] w-6 shrink-0 text-center">1</span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0a66c2]">Certification</h4>
                      <p className="text-xs sm:text-sm text-gray-700 mt-0.5">
                        Project Management Professional (PMP)® • Certified Moulding Specialist
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* INTERESTS CARD */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Interests</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[#0a66c2] text-white font-bold flex items-center justify-center text-xs shrink-0">
                      in
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-semibold text-gray-900">LinkedIn</h5>
                      <span className="text-xs text-gray-500">3,020,848 followers</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[#0b4a3f] text-white font-bold flex items-center justify-center text-xs shrink-0">
                      TT
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-semibold text-gray-900">Tooling Trends Alumni</h5>
                      <span className="text-xs text-gray-500">31,466 members</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[#0f5b78] text-white font-bold flex items-center justify-center text-xs shrink-0">
                      MT
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-semibold text-gray-900">Moulding Technology</h5>
                      <span className="text-xs text-gray-500">135,395 followers</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-gradient-to-br from-red-500 via-green-500 to-blue-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      MS
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-semibold text-gray-900">Microsoft</h5>
                      <span className="text-xs text-gray-500">5,264,522 followers</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* SIDEBAR COLUMN */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Contact / More Profiles</h3>
                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#5f6368] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      @
                    </div>
                    <a href={`mailto:${candidate?.username || 'gopinath'}@toolingtrends.com`} className="text-gray-800 hover:text-[#0a66c2] hover:underline truncate">
                      {candidate?.username || 'gopinath2322002'}@toolingtrends.com
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      IG
                    </div>
                    <a href="#" className="text-gray-800 hover:text-[#0a66c2] hover:underline">
                      @{candidate?.username || "gopinath"}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#1d9bf0] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      𝕏
                    </div>
                    <a href="#" className="text-gray-800 hover:text-[#0a66c2] hover:underline">
                      @{candidate?.username || "gopinath"}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#00aff0] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      S
                    </div>
                    <a href="#" className="text-gray-800 hover:text-[#0a66c2] hover:underline">
                      @{candidate?.username || "gopinath"}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#1769ff] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      Bē
                    </div>
                    <a href="#" className="text-gray-800 hover:text-[#0a66c2] hover:underline">
                      @{candidate?.username || "gopinath_designs"}
                    </a>
                  </div>
                </div>
              </div>

              {/* PUBLIC PROFILE URL CARD */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-5 shadow-sm">
                <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">Public Profile & URL</h4>
                <p className="text-xs text-[#0a66c2] font-mono break-all font-medium">
                  {typeof window !== 'undefined' ? `${window.location.origin}/candidate/${candidate?.username || 'gopinath2322002'}` : `/candidate/${candidate?.username || 'gopinath2322002'}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PROJECTS ================= */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8 space-y-4">

              {/* CANDIDATE PROJECTS */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">{displayName}'s Projects</h2>
                  <div className="relative w-40 sm:w-48">
                    <input
                      type="text"
                      placeholder="Search"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="w-full bg-[#f3f2ef] text-xs px-3 py-1.5 rounded-full border border-transparent focus:border-[#0a66c2] outline-none"
                    />
                    <Search size={12} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Project 1 */}
                  <div className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <img
                      src="https://images.unsplash.com/photo-1581091870627-3c3f4a1b8b8e?w=400&h=300&fit=crop"
                      alt="Apricot Designs iOS App"
                      className="w-full h-36 object-cover rounded-md bg-gray-200"
                    />
                    <h3 className="font-semibold text-base text-gray-900 mt-3">Apricot Designs iOS App</h3>
                    <div className="text-xs text-[#0a66c2] font-semibold mt-0.5">UI Design, UX Design</div>
                    <p className="text-xs sm:text-sm text-gray-700 mt-2 leading-relaxed">
                      I designed an app for pharmaceutical lab equipment company Apricot Design's Personal Pipettor. Available on the App Store.
                    </p>
                    <a href="#" className="inline-block text-xs font-bold text-[#0a66c2] mt-3 tracking-wider hover:underline">
                      VIEW PROJECT →
                    </a>
                    <div className="text-xs text-gray-500 mt-2">Tools: Illustrator, Sketch</div>
                  </div>

                  {/* Project 2 */}
                  <div className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <img
                      src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=300&fit=crop&sat=-100"
                      alt="Smart Mould Monitoring System"
                      className="w-full h-36 object-cover rounded-md bg-gray-200"
                    />
                    <h3 className="font-semibold text-base text-gray-900 mt-3">Smart Mould Monitoring System</h3>
                    <div className="text-xs text-[#0a66c2] font-semibold mt-0.5">IoT, Industrial Automation</div>
                    <p className="text-xs sm:text-sm text-gray-700 mt-2 leading-relaxed">
                      Developed real-time telemetry dashboards and predictive maintenance alerts for plastic injection moulding machines.
                    </p>
                    <a href="#" className="inline-block text-xs font-bold text-[#0a66c2] mt-3 tracking-wider hover:underline">
                      VIEW PROJECT →
                    </a>
                    <div className="text-xs text-gray-500 mt-2">Tools: React, Node.js, Python</div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <a href="#" className="inline-block border-2 border-[#0a66c2] text-[#0a66c2] font-semibold text-sm px-6 py-2 rounded-full hover:bg-[#0a66c2]/10 transition-colors">
                    Visit Website
                  </a>
                </div>
              </div>

              {/* TEAM PROJECTS */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Team Projects</h2>
                  <div className="relative w-40 sm:w-48">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full bg-[#f3f2ef] text-xs px-3 py-1.5 rounded-full border border-transparent focus:border-[#0a66c2] outline-none"
                    />
                    <Search size={12} className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Team Project 1 */}
                  <div className="border border-gray-100 rounded-lg p-3">
                    <img
                      src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop&sat=-100"
                      alt="Rowkin Branding Visuals"
                      className="w-full h-36 object-cover rounded-md bg-gray-200"
                    />
                    <h3 className="font-semibold text-base text-gray-900 mt-3">Rowkin Branding Visuals</h3>
                    <div className="text-xs text-[#0a66c2] font-semibold mt-0.5">Role: Art Direction, Photography</div>
                    <p className="text-xs sm:text-sm text-gray-700 mt-2 leading-relaxed">
                      Transformed Rowkin from a tech-focused consumer electronics company to a lifestyle brand.{" "}
                      <a href="#" className="text-xs font-bold text-[#0a66c2] hover:underline">VIEW PROJECT →</a>
                    </p>

                    <div className="border-t border-gray-100 mt-4 pt-3">
                      <h4 className="text-xs font-semibold text-gray-800 mb-2">Team Members</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">ML</div>
                          <div><p className="text-xs font-semibold text-gray-800">Minji Lee</p><p className="text-[10px] text-gray-500">Designer</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">NG</div>
                          <div><p className="text-xs font-semibold text-gray-800">Nelson Glendinning</p><p className="text-[10px] text-gray-500">Designer</p></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team Project 2 */}
                  <div className="border border-gray-100 rounded-lg p-3">
                    <img
                      src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop"
                      alt="First Assist App"
                      className="w-full h-36 object-cover rounded-md bg-gray-200"
                    />
                    <h3 className="font-semibold text-base text-gray-900 mt-3">First Assist App</h3>
                    <div className="text-xs text-[#0a66c2] font-semibold mt-0.5">Role: UI Design, UX Design</div>
                    <p className="text-xs sm:text-sm text-gray-700 mt-2 leading-relaxed">
                      Built an app helping people with mobility disabilities connect with first responders during emergencies.{" "}
                      <a href="#" className="text-xs font-bold text-[#0a66c2] hover:underline">VIEW PROJECT →</a>
                    </p>

                    <div className="border-t border-gray-100 mt-4 pt-3">
                      <h4 className="text-xs font-semibold text-gray-800 mb-2">Team Members</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">GC</div>
                          <div><p className="text-xs font-semibold text-gray-800">Gia Cheng</p><p className="text-[10px] text-gray-500">UI/UX Designer</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Contact / More Profiles</h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#5f6368] text-white text-xs font-bold flex items-center justify-center shrink-0">@</div>
                    <a href="#" className="text-gray-800 hover:text-[#0a66c2] truncate">{candidate?.username || "gopinath"}@toolingtrends.com</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-pink-600 text-white text-xs font-bold flex items-center justify-center shrink-0">IG</div>
                    <a href="#" className="text-gray-800 hover:text-[#0a66c2]">@{candidate?.username || "gopinath"}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0">𝕏</div>
                    <a href="#" className="text-gray-800 hover:text-[#0a66c2]">@{candidate?.username || "gopinath"}</a>
                  </div>
                </div>
              </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

            {/* CONNECTIONS MAIN COLUMN */}
            <div className="lg:col-span-8 space-y-4">

              {/* TOPBAR */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">My Connections</h2>
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">356</p>
                  <p className="text-xs text-gray-500">Total Connections</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Search connections..."
                      value={connectionSearch}
                      onChange={(e) => setConnectionSearch(e.target.value)}
                      className="bg-[#f3f2ef] border border-gray-200 rounded-full px-4 py-2 text-xs sm:text-sm w-48 sm:w-56 focus:outline-none focus:border-[#0a66c2]"
                    />
                  </div>
                  <button className="border-2 border-[#0a66c2] text-[#0a66c2] px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-[#0a66c2]/10 transition-colors flex items-center gap-1.5">
                    <Users size={16} />
                    Manage
                  </button>
                </div>
              </div>

              {/* SUBTABS */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConnectionsSubTab("all")}
                    className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      connectionsSubTab === "all"
                        ? "bg-[#0a66c2] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All Connections
                  </button>
                  <button
                    onClick={() => setConnectionsSubTab("people")}
                    className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      connectionsSubTab === "people"
                        ? "bg-[#0a66c2] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    People
                  </button>
                  <button
                    onClick={() => setConnectionsSubTab("companies")}
                    className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      connectionsSubTab === "companies"
                        ? "bg-[#0a66c2] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Companies
                  </button>
                </div>
              </div>

              {/* BANNER */}
              {showBanner && (
                <div className="bg-white rounded-lg border border-[#e0e0e0] p-4 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#eaf2fb] text-[#0a66c2] flex items-center justify-center shrink-0">
                      <Users size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Grow your network</h4>
                      <p className="text-xs text-gray-500">Connect with people you know and trust to see updates and stay in touch.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button className="border-2 border-[#0a66c2] text-[#0a66c2] px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-[#0a66c2]/10 transition-colors">
                      Find Connections
                    </button>
                    <button onClick={() => setShowBanner(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* PINNED SECTION */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-gray-900 flex items-center gap-1.5">
                    📌 Pinned <span className="text-gray-500 font-normal text-sm">3</span>
                  </h4>
                  <span className="text-xs font-semibold text-[#0a66c2] cursor-pointer hover:underline">See all</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Pin Card 1 */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex gap-3 items-start mb-2">
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-700 text-sm">
                            RV
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">Rahul Verma • 1st</p>
                          <p className="text-xs text-gray-700 mt-1">Senior Design Engineer</p>
                          <p className="text-xs text-gray-500">Mahindra & Mahindra Ltd.</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Pune, Maharashtra</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-3">Connected 2 years ago</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button className="flex-1 py-1.5 text-center border-1.5 border-[#0a66c2] text-[#0a66c2] rounded-full text-xs font-semibold hover:bg-[#0a66c2]/10 transition-colors">
                        Message
                      </button>
                      <button className="p-1.5 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Pin Card 2 */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex gap-3 items-start mb-2">
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-sm">
                            NP
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">Neha Patil • 1st</p>
                          <p className="text-xs text-gray-700 mt-1">Product Designer</p>
                          <p className="text-xs text-gray-500">Tata Motors Ltd.</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Pune, Maharashtra</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-3">Connected 1 year ago</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button className="flex-1 py-1.5 text-center border-1.5 border-[#0a66c2] text-[#0a66c2] rounded-full text-xs font-semibold hover:bg-[#0a66c2]/10 transition-colors">
                        Message
                      </button>
                      <button className="p-1.5 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Pin Card 3 */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex gap-3 items-start mb-2">
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-full bg-teal-200 flex items-center justify-center font-bold text-teal-800 text-sm">
                            AD
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">Amit Deshmukh • 1st</p>
                          <p className="text-xs text-gray-700 mt-1">Lead Engineer - R&D</p>
                          <p className="text-xs text-gray-500">Bosch India</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Pune, Maharashtra</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-3">Connected 1 year ago</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button className="flex-1 py-1.5 text-center border-1.5 border-[#0a66c2] text-[#0a66c2] rounded-full text-xs font-semibold hover:bg-[#0a66c2]/10 transition-colors">
                        Message
                      </button>
                      <button className="p-1.5 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ALL CONNECTIONS LIST */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <h4 className="text-base font-semibold text-gray-900">All Connections (356)</h4>
                  <span className="text-xs text-gray-600">Sort by: <b>Recently added ▾</b></span>
                </div>

                <div className="divide-y divide-gray-100">
                  {/* Connection Row 1 */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                          RK
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Rohit Kulkarni • 1st</p>
                        <p className="text-xs text-gray-700">Engineering Manager at Siemens Ltd.</p>
                        <p className="text-xs text-gray-400">Pune, Maharashtra</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-xs text-gray-400 leading-tight">Connected<br />3 days ago</span>
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-1 border-1.5 border-[#0a66c2] text-[#0a66c2] rounded-full text-xs font-semibold hover:bg-[#0a66c2]/10 transition-colors">
                          Message
                        </button>
                        <button className="p-1 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Connection Row 2 */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm">
                          SI
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Sneha Iyer • 2nd</p>
                        <p className="text-xs text-gray-700">Design Engineer at John Deere India</p>
                        <p className="text-xs text-gray-400">Pune, Maharashtra</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-xs text-gray-400 leading-tight">Connected<br />1 week ago</span>
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-1 border-1.5 border-[#0a66c2] text-[#0a66c2] rounded-full text-xs font-semibold hover:bg-[#0a66c2]/10 transition-colors">
                          Message
                        </button>
                        <button className="p-1 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Connection Row 3 */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                          VS
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Vikram Singh • 1st</p>
                        <p className="text-xs text-gray-700">CAE Specialist at Altair Engineering</p>
                        <p className="text-xs text-gray-400">Bengaluru, Karnataka</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-xs text-gray-400 leading-tight">Connected<br />2 weeks ago</span>
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-1 border-1.5 border-[#0a66c2] text-[#0a66c2] rounded-full text-xs font-semibold hover:bg-[#0a66c2]/10 transition-colors">
                          Message
                        </button>
                        <button className="p-1 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Connection Row 4 */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-sm">
                          KM
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Karan Mehta • 2nd</p>
                        <p className="text-xs text-gray-700">Project Engineer at L&T Technology Services</p>
                        <p className="text-xs text-gray-400">Pune, Maharashtra</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-xs text-gray-400 leading-tight">Connected<br />1 month ago</span>
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-1 border-1.5 border-[#0a66c2] text-[#0a66c2] rounded-full text-xs font-semibold hover:bg-[#0a66c2]/10 transition-colors">
                          Message
                        </button>
                        <button className="p-1 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-gray-100 mt-2">
                  <button className="text-sm font-semibold text-[#0a66c2] hover:underline">
                    Show more connections ▾
                  </button>
                </div>
              </div>

            </div>

            {/* CONNECTIONS SIDEBAR */}
            <div className="lg:col-span-4 space-y-4">

              {/* PEOPLE YOU MAY KNOW */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">People You May Know</h4>
                  <span className="text-xs font-semibold text-[#0a66c2] cursor-pointer hover:underline">View all</span>
                </div>

                <div className="space-y-3.5 divide-y divide-gray-100">
                  <div className="pt-2 first:pt-0 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">PJ</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">Pooja Joshi</p>
                      <p className="text-[11px] text-gray-600 truncate">Mechanical Engineer</p>
                      <p className="text-[10px] text-gray-400">12 mutual connections</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button className="border-1.5 border-[#0a66c2] text-[#0a66c2] px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#0a66c2]/10 transition-colors">
                        Connect
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-0.5"><X size={14} /></button>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-xs shrink-0">SK</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">Sanket Kale</p>
                      <p className="text-[11px] text-gray-600 truncate">Design Engineer</p>
                      <p className="text-[10px] text-gray-400">8 mutual connections</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button className="border-1.5 border-[#0a66c2] text-[#0a66c2] px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#0a66c2]/10 transition-colors">
                        Connect
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-0.5"><X size={14} /></button>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-800 font-bold flex items-center justify-center text-xs shrink-0">MB</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">Mayur Bhosale</p>
                      <p className="text-[11px] text-gray-600 truncate">CAE Engineer</p>
                      <p className="text-[10px] text-gray-400">15 mutual connections</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button className="border-1.5 border-[#0a66c2] text-[#0a66c2] px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#0a66c2]/10 transition-colors">
                        Connect
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-0.5"><X size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* MANAGE MY NETWORK */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-5 shadow-sm space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Manage My Network</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Users size={16} className="text-[#0a66c2]" />
                      <span className="font-semibold text-gray-800">Contacts</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Mail size={16} className="text-[#0a66c2]" />
                      <span className="font-semibold text-gray-800">Invitations</span>
                    </div>
                    <span className="bg-[#0a66c2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <TrendingUp size={16} className="text-[#0a66c2]" />
                      <span className="font-semibold text-gray-800">Following & Followers</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NETWORK INSIGHTS */}
              <div className="bg-white rounded-lg border border-[#e0e0e0] p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Network Insights</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-blue-50/60 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">356</p>
                    <p className="text-[11px] text-gray-500">Total Connections</p>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">28</p>
                    <p className="text-[11px] text-gray-500">New (Last 90d)</p>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">12,840</p>
                    <p className="text-[11px] text-gray-500">Network reach</p>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">8</p>
                    <p className="text-[11px] text-gray-500">Posts this week</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

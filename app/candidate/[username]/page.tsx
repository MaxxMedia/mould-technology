import CandidateAvatar from "@/components/candidate/CandidateAvatar"
import { MapPin, CheckCircle, Pencil, Camera } from "lucide-react"
import Link from "next/link"

type Candidate = {
  username: string
  fullName?: string
  headline?: string
  about?: string
  location?: string
  avatarUrl?: string
  company?: string
  education?: string
}

export default async function CandidateProfilePage(props: {
  params: Promise<{ username: string }>
}) {
  const { username } = await props.params

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/${username}`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    return <div className="p-10 text-center">Profile not found</div>
  }

  const candidate: Candidate = await res.json()

  return (
    <div className="bg-[#f3f2ef] min-h-screen">

      {/* ===== PAGE WIDTH SAME AS FEED ===== */}
      <div className="max-w-[1128px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ================= MAIN PROFILE ================= */}
        <div className="lg:col-span-8 space-y-6">

          {/* ================= TOP PROFILE CARD ================= */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">

            {/* COVER */}
            <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
              <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors">
                <Pencil size={16} />
              </button>
            </div>

            {/* PROFILE INFO */}
            <div className="px-6 pb-6 relative">

              {/* AVATAR - FIXED DISPLAY */}
              <div className="absolute -top-12 left-6 z-10">
                <div className="relative">
                  <CandidateAvatar
                    avatarUrl={candidate.avatarUrl}
                    name={candidate.fullName || candidate.username}
                    size="xl"
                    borderClassName="border-4 border-white shadow-md"
                  />
                  {/* Optional edit button on avatar */}
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors border border-gray-200">
                    <Camera size={12} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between gap-6 pt-12">

                {/* LEFT INFO */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    {candidate.fullName || candidate.username}
                    <CheckCircle size={18} className="text-blue-600" />
                  </h1>

                  <p className="text-gray-700 mt-1">
                    {candidate.headline || "Add your headline"}
                  </p>

                  {candidate.company && (
                    <p className="text-sm text-gray-600 mt-1">
                      {candidate.company}
                    </p>
                  )}

                  {candidate.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={14} />
                      {candidate.location}
                    </p>
                  )}

                  <p className="text-sm text-blue-600 mt-1">
                    500+ connections
                  </p>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    <button className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                      Open to
                    </button>

                    <button className="border border-blue-600 text-blue-600 px-5 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors">
                      Add profile section
                    </button>

                    <button className="border border-gray-300 px-5 py-1.5 rounded-full text-sm hover:bg-gray-50 transition-colors">
                      Resources
                    </button>
                  </div>
                </div>

                {/* RIGHT INFO (Company / Education logos) */}
                <div className="hidden md:block space-y-3 text-sm text-gray-700 min-w-[120px]">
                  {candidate.company && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">
                        {candidate.company.charAt(0)}
                      </div>
                      <span className="truncate">{candidate.company}</span>
                    </div>
                  )}

                  {candidate.education && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">
                        {candidate.education.charAt(0)}
                      </div>
                      <span className="truncate">{candidate.education}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ================= ABOUT ================= */}
          <ProfileSection title="About">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {candidate.about || "Write a summary to highlight your personality or work experience."}
            </p>
          </ProfileSection>

          {/* ================= EXPERIENCE ================= */}
          <ProfileSection title="Experience">
            <p className="text-sm text-gray-700">
              {candidate.company || "Add your work experience"}
            </p>
          </ProfileSection>

          {/* ================= EDUCATION ================= */}
          <ProfileSection title="Education">
            <p className="text-sm text-gray-700">
              {candidate.education || "Add your education"}
            </p>
          </ProfileSection>

          {/* ================= SKILLS ================= */}
          <ProfileSection title="Skills">
            <div className="flex flex-wrap gap-2">
              {["JavaScript", "React", "Node.js", "SQL"].map((skill) => (
                <span
                  key={skill}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </ProfileSection>
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <div className="lg:col-span-4 space-y-6">

          {/* PROFILE LANGUAGE */}
          <SidebarCard title="Profile language">
            <p className="text-sm">English</p>
          </SidebarCard>

          {/* PUBLIC URL */}
          <SidebarCard title="Public profile & URL">
            <p className="text-sm break-all text-gray-700">
              /candidate/{candidate.username}
            </p>
          </SidebarCard>

          {/* SUGGESTED */}
          <SidebarCard title="Suggested for you" subtitle="Private to you">
            <p className="text-sm text-gray-600">
              Write a summary to highlight your personality or work experience.
            </p>
            <button className="mt-3 border border-gray-300 px-4 py-1.5 rounded-full text-sm hover:bg-gray-50 transition-colors">
              Add a summary
            </button>
          </SidebarCard>

          {/* VIEWERS */}
          <SidebarCard title="Who your viewers also viewed" subtitle="Private to you">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                M
              </div>
              <span className="text-sm">Someone at Maxpo Exhibitions</span>
            </div>
          </SidebarCard>
        </div>
      </div>
    </div>
  )
}

/* ================= REUSABLE COMPONENTS ================= */

function ProfileSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm relative">
      <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
        <Pencil size={16} />
      </button>
      <h2 className="font-semibold mb-3 text-lg">{title}</h2>
      {children}
    </div>
  )
}

function SidebarCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <Pencil size={14} className="text-gray-400 hover:text-gray-700 cursor-pointer transition-colors" />
      </div>
      {children}
    </div>
  )
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCandidateGuard } from "@/lib/useCandidateGuard";
import JobFeed from "@/components/job/JobFeed";
import PopularArticlesFeed from "@/components/articles/PopularArticlesFeed";
import SavedJobs from "@/components/job/SavedJobs";
import MyApplicationsPage from "../applications/page";
import JobAlertsPage from "../job-alerts/page";
import CandidateProfilePanel from "@/components/candidate/CandidateProfilePanel";
import CandidateAvatar from "@/components/candidate/CandidateAvatar";
import type { Post } from "@/types/Post";
import TeamStatusBadge from "@/components/teams/TeamStatusBadge";
import { Search, Building2, CheckCircle, XCircle, Clock, Briefcase, Calendar, X } from "lucide-react";

type CandidateProfile = {
  id: number;
  fullName?: string;
  headline?: string;
  username?: string;
  avatarUrl?: string;
  companyId?: number;
  Company?: {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string;
    tagline?: string;
  };
};

type TeamMember = {
  id: number;
  companyId: number;
  userId: number;
  designation: string;
  department?: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'FORMER';
  rejectionReason?: string;
  company: {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string;
  };
};

export default function CandidateFeedPage() {
  useCandidateGuard();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [activeSection, setActiveSection] = useState("feed");
  const [popularArticles, setPopularArticles] = useState<Post[]>([]);
  const [teamStatus, setTeamStatus] = useState<TeamMember | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const sectionMeta: Record<string, { title: string; subtitle: string }> = {
    feed: {
      title: "Home Feed",
      subtitle: "Latest job opportunities for you",
    },
    articles: {
      title: "Popular Articles",
      subtitle: "Technical articles ranked by most views",
    },
    saved: {
      title: "Saved Jobs",
      subtitle: "Jobs you bookmarked to apply later",
    },
    applications: {
      title: "My Applications",
      subtitle: "Track jobs you have applied to",
    },
    alerts: {
      title: "Job Alerts",
      subtitle: "Get notified about matching roles",
    },
    profile: {
      title: "My Profile",
      subtitle: "Update your public candidate profile",
    },
    company: {
      title: "My Company",
      subtitle: "Your company and verification status",
    },
  };

  const meta = sectionMeta[activeSection] ?? sectionMeta.feed;

  // Load profile and company data
  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setProfile(data);

          // If user has a company, load team status
          if (data.companyId) {
            loadTeamStatus(data.companyId);
          } else {
            setLoadingTeam(false);
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        setLoadingTeam(false);
      }
    }
    loadProfile();
  }, []);

  async function loadTeamStatus(companyId: number) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/team/me?companyId=${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 404) {
        setTeamStatus(null);
        return;
      }

      if (res.ok) {
        const result = await res.json();
        const data = result.data || result;
        if (data && data.id) {
          setTeamStatus(data);
        } else {
          setTeamStatus(null);
        }
      }
    } catch (error) {
      console.error("Failed to load team status:", error);
      setTeamStatus(null);
    } finally {
      setLoadingTeam(false);
    }
  }

  useEffect(() => {
    async function loadTrendingArticles() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/articles/approved`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setPopularArticles(
          [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
        );
      } catch {
        // sidebar is optional
      }
    }
    loadTrendingArticles();
  }, []);

  const displayName = profile?.fullName || profile?.username || "Candidate";
  const displayHeadline = profile?.headline || "Aspiring Professional";

  return (
    <div className="bg-[#f3f2ef] min-h-screen lg:h-screen lg:overflow-hidden scrollbar-hide">
      <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-12 gap-6 lg:h-full">

        {/* LEFT SIDEBAR */}
        <aside className="col-span-12 lg:col-span-3 space-y-4 lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-md overflow-hidden shadow-sm">
            <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="flex flex-col items-center -mt-8 pb-4">
              <CandidateAvatar
                avatarUrl={profile?.avatarUrl}
                name={displayName}
                size="md"
                borderClassName="border-2 border-white"
              />
              <h3 className="font-semibold mt-2">{displayName}</h3>
              <p className="text-xs text-gray-500">{displayHeadline}</p>
              {profile?.Company && (
                <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                  <Building2 size={12} />
                  {profile.Company.name}
                </div>
              )}
            </div>
          </div>

          <nav className="bg-white rounded-md shadow-sm p-3 space-y-1 text-sm">
            <SidebarButton active={activeSection === "feed"} onClick={() => setActiveSection("feed")}>
              Home Feed
            </SidebarButton>
            <SidebarButton active={activeSection === "articles"} onClick={() => setActiveSection("articles")}>
              Popular Articles
            </SidebarButton>
            <SidebarButton active={activeSection === "saved"} onClick={() => setActiveSection("saved")}>
              Saved Jobs
            </SidebarButton>
            <SidebarButton active={activeSection === "applications"} onClick={() => setActiveSection("applications")}>
              My Applications
            </SidebarButton>
            <SidebarButton active={activeSection === "alerts"} onClick={() => setActiveSection("alerts")}>
              Job Alerts
            </SidebarButton>
            <SidebarButton active={activeSection === "profile"} onClick={() => setActiveSection("profile")}>
              My Profile
            </SidebarButton>
            <SidebarButton active={activeSection === "company"} onClick={() => setActiveSection("company")}>
              <div className="flex items-center justify-between">
                <span>My Company</span>
                {teamStatus && teamStatus.status === 'PENDING' && (
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                )}
                {teamStatus && teamStatus.status === 'ACTIVE' && (
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </div>
            </SidebarButton>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="col-span-12 lg:col-span-6 space-y-4 lg:overflow-y-auto scrollbar-hide lg:h-full pr-2">
          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{meta.title}</h1>
                <p className="text-xs text-gray-500 mt-0.5">{meta.subtitle}</p>
              </div>
              <CandidateAvatar avatarUrl={profile?.avatarUrl} name={displayName} size="sm" />
            </div>
          </div>

          {activeSection === "feed" && <JobFeed />}
          {activeSection === "articles" && <PopularArticlesFeed onArticlesLoaded={setPopularArticles} />}
          {activeSection === "saved" && <SavedJobs />}
          {activeSection === "applications" && <MyApplicationsPage />}
          {activeSection === "alerts" && <JobAlertsPage />}
          {activeSection === "profile" && (
            <CandidateProfilePanel
              onProfileUpdated={async (updated) => {
                if (!profile) return;
                setProfile({
                  ...profile,
                  fullName: updated.fullName,
                  headline: updated.headline,
                  username: updated.username,
                  avatarUrl: updated.avatarUrl,
                });
                // Reload profile to get updated company info
                const token = localStorage.getItem("token");
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/me`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.ok) {
                  const data = await res.json();
                  setProfile(data);
                }
              }}
            />
          )}
          {activeSection === "company" && (
            <CompanySection
              profile={profile}
              teamStatus={teamStatus}
              loading={loadingTeam}
              onStatusChange={async () => {
                setLoadingTeam(true);
                try {
                  const token = localStorage.getItem("token");
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/me`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    if (data.companyId) {
                      const teamRes = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/team/me?companyId=${data.companyId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      if (teamRes.ok) {
                        const teamData = await teamRes.json();
                        setTeamStatus(teamData.data || teamData);
                      }
                    }
                  }
                } catch (error) {
                  console.error("Failed to refresh:", error);
                } finally {
                  setLoadingTeam(false);
                }
              }}
            />
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="col-span-12 lg:col-span-3 space-y-4 lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-md shadow-sm p-4">
            <h4 className="font-semibold mb-3">Trending Articles</h4>
            {popularArticles.length === 0 ? (
              <p className="text-sm text-gray-500">Loading popular articles...</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {popularArticles.slice(0, 5).map((article, index) => (
                  <li key={article.id}>
                    <Link href={`/post/${article.slug}`} className="group block">
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                        {index + 1}. {article.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(article.views ?? 0).toLocaleString()} views
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/articles" className="inline-block mt-4 text-xs font-medium text-blue-600 hover:underline">
              View all articles →
            </Link>
          </div>

          {/* Company Status Widget */}
          {profile?.Company && (
            <div className="bg-white rounded-md shadow-sm p-4">
              <h4 className="font-semibold mb-2">Company Status</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{profile.Company.name}</span>
                {teamStatus ? (
                  <TeamStatusBadge status={teamStatus.status} />
                ) : (
                  <span className="text-xs text-gray-400">Not verified</span>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function SidebarButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block text-left w-full px-3 py-2 rounded-md transition-colors ${active ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
        }`}
    >
      {children}
    </button>
  );
}

// ============================================
// COMPANY SECTION - FULL WORKING COMPONENT
// ============================================

function CompanySection({
  profile,
  teamStatus,
  loading,
  onStatusChange
}: {
  profile: CandidateProfile | null;
  teamStatus: TeamMember | null;
  loading: boolean;
  onStatusChange: () => void;
}) {
  const [step, setStep] = useState<'view' | 'search' | 'form'>('view');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    designation: '',
    department: '',
    employmentType: 'FULL_TIME',
    startDate: '',
  });

  // Search companies
  async function searchCompanies(query: string) {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/companies/search?q=${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        throw new Error('Failed to search companies');
      }

      const data = await res.json();
      const companies = Array.isArray(data) ? data : data.data || data.companies || [];
      setSearchResults(companies);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  // Submit team join request
  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();

    console.log('📝 Form submitted!');
    console.log('📝 Selected company:', selectedCompany);

    if (!selectedCompany) {
      setMessage({ type: 'error', text: 'Please select a company first' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists?', !!token);

      const payload = {
        companyId: selectedCompany.id,
        ...formData,
      };

      console.log('📦 Request payload:', payload);
      console.log('📡 Sending to:', `${process.env.NEXT_PUBLIC_API_URL}/api/team/request`);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response status:', res.status);

      const responseData = await res.json();
      console.log('📦 Response data:', responseData);

      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to submit request');
      }

      setMessage({
        type: 'success',
        text: '✅ Request submitted successfully! Waiting for recruiter approval.'
      });

      // Reset form after 2 seconds and refresh
      setTimeout(() => {
        setStep('view');
        setSelectedCompany(null);
        setFormData({
          designation: '',
          department: '',
          employmentType: 'FULL_TIME',
          startDate: '',
        });
        onStatusChange();
      }, 2000);

    } catch (error: any) {
      console.error('❌ Submission error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to submit request'
      });
    } finally {
      setSubmitting(false);
    }
  }

  // If user already has a company
  if (profile?.Company) {
    return (
      <div className="bg-white rounded-md shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Company</h2>
          {teamStatus && <TeamStatusBadge status={teamStatus.status} />}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {profile.Company.logoUrl ? (
              <img src={profile.Company.logoUrl} alt={profile.Company.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{profile.Company.name}</h3>
              {profile.Company.tagline && (
                <p className="text-sm text-gray-500">{profile.Company.tagline}</p>
              )}
              <Link
                href={`/company/${profile.Company.slug}`}
                className="text-xs text-blue-600 hover:underline"
              >
                View Company Profile →
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading team status...</p>
            </div>
          ) : teamStatus ? (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Your Role</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Designation:</span> {teamStatus.designation}</p>
                {teamStatus.department && (
                  <p><span className="text-gray-500">Department:</span> {teamStatus.department}</p>
                )}
                {teamStatus.employmentType && (
                  <p><span className="text-gray-500">Type:</span> {teamStatus.employmentType.replace('_', ' ')}</p>
                )}
                {teamStatus.startDate && (
                  <p><span className="text-gray-500">Started:</span> {new Date(teamStatus.startDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Your company is not verified yet.
                <button
                  onClick={() => {
                    setStep('search');
                    setSelectedCompany(null);
                  }}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Request verification →
                </button>
              </p>
            </div>
          )}

          {teamStatus?.status === 'PENDING' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">⏳ Your verification request is pending approval from the recruiter.</p>
            </div>
          )}

          {teamStatus?.status === 'REJECTED' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                <strong>Verification Rejected:</strong> {teamStatus.rejectionReason || 'No reason provided'}
              </p>
              <button
                onClick={() => {
                  setStep('search');
                  setSelectedCompany(null);
                }}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Submit new request →
              </button>
            </div>
          )}

          {teamStatus?.status === 'ACTIVE' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">✅ Your company is verified! You are an active team member.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No company - show the full flow
  return (
    <div className="bg-white rounded-md shadow-sm p-6">
      {/* VIEW STATE */}
      {step === 'view' && (
        <>
          <h2 className="text-lg font-semibold mb-2">My Company</h2>
          <p className="text-sm text-gray-500 mb-4">Add your company to get verified</p>

          <button
            onClick={() => {
              setStep('search');
              setSearchQuery('');
              setSearchResults([]);
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Building2 size={18} />
            Add Your Company
          </button>
        </>
      )}

      {/* SEARCH STATE */}
      {step === 'search' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Search for your company</h2>
            <button
              onClick={() => setStep('view')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchCompanies(e.target.value);
              }}
              placeholder="Type company name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            {searching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-60 overflow-auto">
              {searchResults.map((company) => (
                <button
                  key={company.id}
                  onClick={() => {
                    console.log('📝 Selected company:', company);
                    setSelectedCompany(company);
                    setStep('form');
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-4 border-2 hover:border-blue-400"
                >
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{company.name}</p>
                      {company.isVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ Verified</span>
                      )}
                      {company.hasRecruiter && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">👥 Has Recruiter</span>
                      )}
                    </div>
                    {company.tagline && (
                      <p className="text-sm text-gray-500">{company.tagline}</p>
                    )}
                    {company.location && (
                      <p className="text-xs text-gray-400">📍 {company.location}</p>
                    )}
                    {company.Industry && (
                      <p className="text-xs text-gray-400">{company.Industry.name}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <div className="mt-4 p-8 text-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">No companies found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
              <button
                onClick={() => setStep('view')}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Go back
              </button>
            </div>
          )}

          {searchQuery.length < 2 && (
            <div className="mt-4 p-8 text-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Type at least 2 characters to search</p>
            </div>
          )}
        </>
      )}

      {/* FORM STATE */}
      {step === 'form' && selectedCompany && (
        <>
          <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {selectedCompany.logoUrl ? (
              <img src={selectedCompany.logoUrl} alt={selectedCompany.name} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-200 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{selectedCompany.name}</h2>
              {selectedCompany.tagline && (
                <p className="text-sm text-gray-600">{selectedCompany.tagline}</p>
              )}
              {selectedCompany.location && (
                <p className="text-xs text-gray-500">📍 {selectedCompany.location}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {selectedCompany.isVerified ? '✅ Verified Company' : '📝 Unverified Company'}
              </p>
            </div>
            <button
              onClick={() => {
                setStep('search');
                setSelectedCompany(null);
                setMessage(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change
            </button>
          </div>

          {!selectedCompany.isVerified && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              ⚠️ This company is not verified. Your request will need to be approved by a recruiter.
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                  'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Engineering"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('search');
                  setSelectedCompany(null);
                  setMessage(null);
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
                disabled={submitting}
              >
                Back
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
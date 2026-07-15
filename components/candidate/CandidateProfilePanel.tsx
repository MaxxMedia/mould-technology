"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, User, Building2, Search, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import UploadBox from "@/components/UploadBox";
import CandidateAvatar from "@/components/candidate/CandidateAvatar";
import {
  fetchMyCandidateProfile,
  syncCandidateUserInStorage,
  updateMyCandidateProfile,
  uploadCandidateImage,
  type CandidateProfile,
} from "@/lib/candidateProfile";

type CandidateProfilePanelProps = {
  onProfileUpdated?: (profile: CandidateProfile) => void;
};

type Company = {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  tagline?: string;
};

type TeamStatus = {
  id: number;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'FORMER';
  designation: string;
  department?: string;
  employmentType?: string;
  startDate?: string;
  rejectionReason?: string;
  company: Company;
};

// Helper function to get company from profile (handles both company and Company)
function getCompanyFromProfile(profile: CandidateProfile | null): Company | null {
  if (!profile) return null;
  return profile.Company || profile.company || null;
}

export default function CandidateProfilePanel({
  onProfileUpdated,
}: CandidateProfilePanelProps) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Company related states
  const [teamStatus, setTeamStatus] = useState<TeamStatus | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [showCompanySearch, setShowCompanySearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    designation: '',
    department: '',
    employmentType: 'FULL_TIME',
    startDate: '',
  });
  const [submittingCompany, setSubmittingCompany] = useState(false);

  useEffect(() => {
    fetchMyCandidateProfile()
      .then((data) => {
        console.log("📦 Profile data from API:", data);
        console.log("📦 Company data:", data.company || data.Company);
        setProfile(data);
      })
      .catch((err) => console.error("Failed to load profile", err))
      .finally(() => setLoading(false));
  }, []);

  // Load team status when profile is loaded.
  // NOTE: we always check — even before a company is linked to the profile —
  // because companyId is only set on the User once a recruiter approves the
  // request. Calling /api/team/me without a companyId returns the
  // candidate's most recent membership request across any company, so a
  // PENDING or REJECTED request is visible before approval happens.
  useEffect(() => {
    if (!profile) return;
    const company = getCompanyFromProfile(profile);
    loadTeamStatus(company?.id);
  }, [profile]);

  async function loadTeamStatus(companyId?: number) {
    setLoadingTeam(true);
    try {
      const token = localStorage.getItem("token");
      const url = companyId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/team/me?companyId=${companyId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/team/me`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

      if (res.status === 404) {
        setTeamStatus(null);
        return;
      }

      if (res.ok) {
        const result = await res.json();
        const data = result?.data ?? result;
        setTeamStatus(data && data.id ? data : null);
      }
    } catch (error) {
      console.error("Failed to load team status:", error);
      setTeamStatus(null);
    } finally {
      setLoadingTeam(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    if (!profile) return;

    setUploading(true);
    setMessage("");
    try {
      const imageUrl = await uploadCandidateImage(file);
      const updated = await updateMyCandidateProfile({
        ...profile,
        avatarUrl: imageUrl,
      });

      setProfile(updated);
      onProfileUpdated?.(updated);
      syncCandidateUserInStorage(updated);
      setMessage("Profile photo updated.");
    } catch {
      setMessage("Could not upload profile photo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage("");
    try {
      const updated = await updateMyCandidateProfile(profile);
      setProfile(updated);
      onProfileUpdated?.(updated);
      syncCandidateUserInStorage(updated);
      setMessage("Profile saved successfully.");
    } catch {
      setMessage("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

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
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  }

  async function handleCompanySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCompany || !profile) return;

    // Guard: don't allow submitting a second request while one is already
    // pending. The backend already blocks duplicates for the SAME company,
    // but this also covers picking a DIFFERENT company while pending.
    if (teamStatus?.status === 'PENDING') {
      setMessage('You already have a pending request awaiting approval.');
      return;
    }

    setSubmittingCompany(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          ...companyFormData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to submit request');
      }

      setMessage('✅ Company verification request submitted successfully!');
      setShowCompanyForm(false);
      setShowCompanySearch(false);
      setSelectedCompany(null);
      setCompanyFormData({
        designation: '',
        department: '',
        employmentType: 'FULL_TIME',
        startDate: '',
      });

      // Refresh profile
      const updatedProfile = await fetchMyCandidateProfile();
      setProfile(updatedProfile);
      onProfileUpdated?.(updatedProfile);

      // Refresh team status too, so the new PENDING request shows up
      // immediately instead of waiting for the next profile reload.
      const company = getCompanyFromProfile(updatedProfile);
      loadTeamStatus(company?.id ?? selectedCompany.id);

    } catch (error: any) {
      setMessage(error.message || 'Failed to submit request');
    } finally {
      setSubmittingCompany(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-sm p-8 text-center text-sm text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-md shadow-sm p-8 text-center text-sm text-red-600">
        Unable to load your profile.
      </div>
    );
  }

  // Get company from profile (handles both 'company' and 'Company')
  const company = getCompanyFromProfile(profile);

  // A candidate can only ever have one live request at a time. They're
  // free to search/request a (new) company when there's no existing
  // membership, or when the last one was REJECTED / FORMER.
  const canRequestNewCompany =
    !teamStatus || teamStatus.status === 'REJECTED' || teamStatus.status === 'FORMER';

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600" />

      <div className="px-6 pb-6 -mt-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-end gap-4">
            <CandidateAvatar
              avatarUrl={profile.avatarUrl}
              name={profile.fullName || profile.username}
              size="lg"
              borderClassName="border-4 border-white"
            />
            <div className="pb-1">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                {profile.fullName || profile.username}
              </h2>
              <p className="text-sm text-gray-500">@{profile.username}</p>
              {company && (
                <div className="flex items-center gap-1 text-xs text-blue-600 mt-0.5">
                  <Building2 size={12} />
                  {company.name}
                  {teamStatus && (
                    <span className="ml-1">
                      {teamStatus.status === 'PENDING' && <Clock size={12} className="inline text-yellow-500" />}
                      {teamStatus.status === 'ACTIVE' && <CheckCircle size={12} className="inline text-green-500" />}
                      {teamStatus.status === 'REJECTED' && <XCircle size={12} className="inline text-red-500" />}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <Link
            href={`/candidate/${profile.username}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View public profile
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* Company Section */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Company
            </h3>
            {!company && !showCompanySearch && canRequestNewCompany && (
              <button
                onClick={() => setShowCompanySearch(true)}
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition flex items-center gap-1"
              >
                <Plus size={14} />
                Add Company
              </button>
            )}
          </div>

          {/* NEW: pending/rejected/former messaging shown even before a
              company is linked to the profile (i.e. before approval). */}
          {!company && teamStatus && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${teamStatus.status === 'PENDING'
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                  : teamStatus.status === 'REJECTED'
                    ? 'bg-red-50 border border-red-200 text-red-600'
                    : 'bg-gray-50 border border-gray-200 text-gray-600'
                }`}
            >
              {teamStatus.status === 'PENDING' && (
                <>
                  ⏳ Your request to join <strong>{teamStatus.company?.name}</strong> is pending
                  approval from the recruiter.
                </>
              )}
              {teamStatus.status === 'REJECTED' && (
                <>
                  ❌ Your request to join <strong>{teamStatus.company?.name}</strong> was rejected
                  {teamStatus.rejectionReason ? `: ${teamStatus.rejectionReason}` : '.'} You can
                  search for a company and submit a new request.
                </>
              )}
              {teamStatus.status === 'FORMER' && (
                <>
                  You were previously a member of <strong>{teamStatus.company?.name}</strong>.
                </>
              )}
            </div>
          )}

          {/* Company Search */}
          {showCompanySearch && !company && (
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchCompanies(e.target.value);
                  }}
                  placeholder="Search for your company..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                {searching && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 space-y-2 max-h-48 overflow-auto">
                  {searchResults.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowCompanyForm(true);
                        setShowCompanySearch(false);
                        setSearchResults([]);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3"
                    >
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{company.name}</p>
                        {company.tagline && <p className="text-xs text-gray-500">{company.tagline}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <div className="mt-2 p-3 text-center bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">No companies found. Try a different search.</p>
                </div>
              )}

              <button
                onClick={() => {
                  setShowCompanySearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Company Form */}
          {showCompanyForm && selectedCompany && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {selectedCompany.logoUrl ? (
                    <img src={selectedCompany.logoUrl} alt={selectedCompany.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                  <span className="font-medium">{selectedCompany.name}</span>
                </div>
                <button
                  onClick={() => {
                    setShowCompanyForm(false);
                    setSelectedCompany(null);
                    setShowCompanySearch(true);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Change
                </button>
              </div>

              <form onSubmit={handleCompanySubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyFormData.designation}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, designation: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={companyFormData.department}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, department: e.target.value })}
                    placeholder="e.g., Engineering"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={companyFormData.employmentType}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, employmentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    value={companyFormData.startDate}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submittingCompany}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                  >
                    {submittingCompany ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompanyForm(false);
                      setSelectedCompany(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Display Company & Status */}
          {company && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{company.name}</p>
                    {teamStatus && (
                      <p className="text-sm text-gray-600">{teamStatus.designation}</p>
                    )}
                  </div>
                </div>
                {teamStatus && (
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${teamStatus.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    teamStatus.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      teamStatus.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                    {teamStatus.status === 'ACTIVE' && '✅ Verified Team Member'}
                    {teamStatus.status === 'PENDING' && '⏳ Pending'}
                    {teamStatus.status === 'REJECTED' && '❌ Rejected'}
                    {teamStatus.status === 'FORMER' && '📤 Former'}
                  </span>
                )}
              </div>

              {teamStatus && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {teamStatus.department && (
                    <div><span className="text-gray-500">Department:</span> {teamStatus.department}</div>
                  )}
                  {teamStatus.employmentType && (
                    <div><span className="text-gray-500">Type:</span> {teamStatus.employmentType.replace('_', ' ')}</div>
                  )}
                  {teamStatus.startDate && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Started:</span> {new Date(teamStatus.startDate).toLocaleDateString()}
                    </div>
                  )}
                  {teamStatus.rejectionReason && (
                    <div className="col-span-2 text-red-600 text-sm">
                      <strong>Reason:</strong> {teamStatus.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              {!teamStatus && (
                <div className="mt-2 text-sm text-yellow-600">
                  ⚠️ Your company is not verified yet.
                  <button
                    onClick={() => {
                      setSelectedCompany(company);
                      setShowCompanyForm(true);
                    }}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Request verification →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="max-w-xs">
            <UploadBox
              label={uploading ? "Uploading photo..." : "Profile photo"}
              value={profile.avatarUrl}
              onUpload={handleAvatarUpload}
              height="h-40"
              accept="image/*"
            />
            <p className="text-xs text-gray-500 mt-2">
              Click the image area to upload a new photo. Changes save automatically.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email" value={profile.email} disabled />
            <Field label="Username" value={profile.username} disabled />
          </div>

          <input
            placeholder="Full name"
            value={profile.fullName || ""}
            onChange={(e) =>
              setProfile({ ...profile, fullName: e.target.value })
            }
            className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm"
          />

          <input
            placeholder="Headline"
            value={profile.headline || ""}
            onChange={(e) =>
              setProfile({ ...profile, headline: e.target.value })
            }
            className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm"
          />

          <input
            placeholder="Location"
            value={profile.location || ""}
            onChange={(e) =>
              setProfile({ ...profile, location: e.target.value })
            }
            className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm"
          />

          <input
            placeholder="Website URL"
            value={profile.websiteUrl || ""}
            onChange={(e) =>
              setProfile({ ...profile, websiteUrl: e.target.value })
            }
            className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm"
          />

          <textarea
            placeholder="About you"
            rows={5}
            value={profile.about || ""}
            onChange={(e) =>
              setProfile({ ...profile, about: e.target.value })
            }
            className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm"
          />

          {message && (
            <p
              className={`text-sm ${message.toLowerCase().includes("could not") || message.toLowerCase().includes("failed")
                ? "text-red-600"
                : "text-green-600"
                }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save profile details"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  disabled,
}: {
  label: string;
  value: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        value={value}
        disabled={disabled}
        className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm bg-gray-50 mt-1"
      />
    </div>
  );
}
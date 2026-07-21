// lib/candidateProfile.ts

export type CandidateProfile = {
  id?: number;
  email: string;
  username: string;
  fullName?: string;
  headline?: string;
  about?: string;
  location?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  companyId?: number;
  // Support both lowercase and capitalized versions
  company?: {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string;
    tagline?: string;
    description?: string;
  };
  Company?: {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string;
    tagline?: string;
    description?: string;
  };
};

export async function uploadCandidateImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();
  if (!res.ok || !data.imageUrl) {
    throw new Error(data.error || "Image upload failed");
  }

  return data.imageUrl;
}

export async function fetchMyCandidateProfile(): Promise<CandidateProfile> {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/me`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    throw new Error("Failed to load profile");
  }

  const data = await res.json();

  // Normalize the data - if company exists but Company doesn't, copy it
  if (data.company && !data.Company) {
    data.Company = data.company;
  }

  return data;
}

export async function updateMyCandidateProfile(
  profile: Partial<CandidateProfile>
): Promise<CandidateProfile> {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/me`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  return res.json();
}

export function syncCandidateUserInStorage(profile: CandidateProfile) {
  const stored = localStorage.getItem("user");
  if (!stored) return;

  const existing = JSON.parse(stored);
  localStorage.setItem(
    "user",
    JSON.stringify({
      ...existing,
      avatarUrl: profile.avatarUrl,
      fullName: profile.fullName,
      username: profile.username,
    })
  );
  window.dispatchEvent(new Event("userChanged"));
}
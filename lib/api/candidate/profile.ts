const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getMyProfile() {
  const res = await fetch(`${API}/api/candidates/me`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to load profile");
  }

  return res.json();
}

export async function updateMyProfile(data: {
  fullName: string;
  headline?: string;
  location?: string;
  about?: string;
  avatarUrl?: string;
  websiteUrl?: string;
}) {
  const res = await fetch(`${API}/api/candidates/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  return res.json();
}
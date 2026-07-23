const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getLanguages() {
  try {
    const res = await fetch(`${API}/api/candidate-languages`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      if (res.status === 404) {
        console.warn("Languages endpoint not found, returning empty array");
        return [];
      }
      throw new Error("Failed to load languages");
    }

    return res.json();
  } catch (err) {
    console.warn("Error loading languages:", err);
    return [];
  }
}

export async function createLanguage(data: {
  language: string;
  proficiency?: string;
}) {
  const res = await fetch(`${API}/api/candidate-languages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create language");
  return res.json();
}

export async function updateLanguage(
  id: number,
  data: {
    language: string;
    proficiency?: string;
  }
) {
  const res = await fetch(`${API}/api/candidate-languages/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update language");
  return res.json();
}

export async function deleteLanguage(id: number) {
  const res = await fetch(`${API}/api/candidate-languages/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete language");
  return res.json();
}
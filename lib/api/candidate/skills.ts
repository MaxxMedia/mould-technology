const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getSkills() {
  const res = await fetch(`${API}/api/candidate-skills`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to load skills");

  return res.json();
}

export async function createSkill(data: {
  name: string;
  level?: string;
}) {
  const res = await fetch(`${API}/api/candidate-skills`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create skill");

  return res.json();
}

export async function updateSkill(
  id: number,
  data: {
    name: string;
    level?: string;
  }
) {
  const res = await fetch(`${API}/api/candidate-skills/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update skill");

  return res.json();
}

export async function deleteSkill(id: number) {
  const res = await fetch(`${API}/api/candidate-skills/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete skill");

  return res.json();
}
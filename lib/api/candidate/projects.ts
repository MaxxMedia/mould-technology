const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getProjects() {
  const res = await fetch(`${API}/api/candidate-projects`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to load projects");

  return res.json();
}

export async function createProject(data: any) {
  const res = await fetch(`${API}/api/candidate-projects`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create project");

  return res.json();
}

export async function updateProject(id: number, data: any) {
  const res = await fetch(`${API}/api/candidate-projects/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update project");

  return res.json();
}

export async function deleteProject(id: number) {
  const res = await fetch(`${API}/api/candidate-projects/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete project");

  return res.json();
}
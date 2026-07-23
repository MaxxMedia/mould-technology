const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getSocials() {
  const res = await fetch(`${API}/api/candidate-socials`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to load social links");

  return res.json();
}

export async function createSocial(data: any) {
  const res = await fetch(`${API}/api/candidate-socials`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create social link");

  return res.json();
}

export async function updateSocial(id: number, data: any) {
  const res = await fetch(`${API}/api/candidate-socials/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update social link");

  return res.json();
}

export async function deleteSocial(id: number) {
  const res = await fetch(`${API}/api/candidate-socials/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete social link");

  return res.json();
}
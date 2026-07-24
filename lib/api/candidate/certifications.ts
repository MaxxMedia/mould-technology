const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getCertifications() {
  const res = await fetch(`${API}/api/candidate-certifications`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to load certifications");

  return res.json();
}

export async function createCertification(data: any) {
  const res = await fetch(`${API}/api/candidate-certifications`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Server response:", errorText);
    throw new Error(`Failed to create certification: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function updateCertification(id: number, data: any) {
  const res = await fetch(`${API}/api/candidate-certifications/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Server response:", errorText);
    throw new Error(`Failed to update certification: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function deleteCertification(id: number) {
  const res = await fetch(`${API}/api/candidate-certifications/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete certification");

  return res.json();
}
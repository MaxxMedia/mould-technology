const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getInterests() {
  try {
    const res = await fetch(`${API}/api/candidate-interests`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      if (res.status === 404) {
        console.warn("Interests endpoint not found, returning empty array");
        return [];
      }
      throw new Error("Failed to load interests");
    }

    return res.json();
  } catch (err) {
    console.warn("Error loading interests:", err);
    return [];
  }
}

export async function createInterest(data: { title: string; type?: string }) {
  try {
    const res = await fetch(`${API}/api/candidate-interests`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server response:", errorText);
      throw new Error(`Failed to create interest: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (err) {
    console.error("Error creating interest:", err);
    throw err;
  }
}

export async function updateInterest(
  id: number,
  data: { title: string; type?: string }
) {
  try {
    const res = await fetch(`${API}/api/candidate-interests/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Failed to update interest: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (err) {
    console.error("Error updating interest:", err);
    throw err;
  }
}

export async function deleteInterest(id: number) {
  try {
    const res = await fetch(`${API}/api/candidate-interests/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to delete interest: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (err) {
    console.error("Error deleting interest:", err);
    throw err;
  }
}
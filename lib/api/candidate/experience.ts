const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getExperiences() {
  try {
    const res = await fetch(`${API}/api/candidate-experience`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      if (res.status === 404) {
        console.warn("Experience endpoint not found, returning empty array");
        return [];
      }
      throw new Error("Failed to load experience");
    }

    return res.json();
  } catch (err) {
    console.warn("Error loading experiences:", err);
    return [];
  }
}

export async function createExperience(data: any) {
  try {
    // Transform the data to match backend expectations
    const payload = {
      companyId: data.companyId || null,
      companyName: data.companyName || data.company || "",
      designation: data.designation || data.title || "",
      employmentType: data.employmentType || "",
      location: data.location || "",
      startDate: data.startDate || null,
      endDate: data.currentlyWorking ? null : data.endDate || null,
      currentlyWorking: Boolean(data.currentlyWorking),
      description: data.description || "",
    };

    const res = await fetch(`${API}/api/candidate-experience`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server response:", errorText);
      throw new Error(`Failed to create experience: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (err) {
    console.error("Error creating experience:", err);
    throw err; // Re-throw to let the handler manage it
  }
}

export async function updateExperience(id: number, data: any) {
  try {
    // Transform the data to match backend expectations
    const payload = {
      companyId: data.companyId || null,
      companyName: data.companyName || data.company || "",
      designation: data.designation || data.title || "",
      employmentType: data.employmentType || "",
      location: data.location || "",
      startDate: data.startDate || null,
      endDate: data.currentlyWorking ? null : data.endDate || null,
      currentlyWorking: Boolean(data.currentlyWorking),
      description: data.description || "",
    };

    const res = await fetch(`${API}/api/candidate-experience/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server response:", errorText);
      throw new Error(`Failed to update experience: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (err) {
    console.error("Error updating experience:", err);
    throw err;
  }
}

export async function deleteExperience(id: number) {
  try {
    const res = await fetch(`${API}/api/candidate-experience/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to delete experience: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (err) {
    console.error("Error deleting experience:", err);
    throw err;
  }
}
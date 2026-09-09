"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Factory, Plus, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ParentOption = {
  id: number;
  name: string;
};

type CreateKind = "parent" | "child";

async function createIndustry(
  token: string,
  name: string,
  parentId: number | null
) {
  const res = await fetch(`${API_URL}/api/admin/industries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, parentId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Failed to create "${name}"`);
  }
  return data;
}

export default function CreateIndustryPage() {
  const router = useRouter();
  const [kind, setKind] = useState<CreateKind>("parent");
  const [parentName, setParentName] = useState("");
  const [childNames, setChildNames] = useState<string[]>([""]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/admin/industries/parents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        setParents(Array.isArray(data) ? data : []);
      })
      .catch(() => setParents([]))
      .finally(() => setLoadingParents(false));
  }, []);

  function setChildName(index: number, value: string) {
    setChildNames((prev) => prev.map((name, i) => (i === index ? value : name)));
  }

  function addChildField() {
    setChildNames((prev) => [...prev, ""]);
  }

  function removeChildField(index: number) {
    setChildNames((prev) => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== index)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in again.");
      return;
    }

    const children = childNames.map((n) => n.trim()).filter(Boolean);

    setSubmitting(true);
    try {
      if (kind === "parent") {
        if (!parentName.trim()) {
          throw new Error("Parent industry name is required");
        }
        const parent = await createIndustry(token, parentName.trim(), null);
        for (const child of children) {
          await createIndustry(token, child, parent.id);
        }
      } else {
        if (!selectedParentId) {
          throw new Error("Select a parent industry");
        }
        if (children.length === 0) {
          throw new Error("Enter at least one child industry name");
        }
        for (const child of children) {
          await createIndustry(token, child, Number(selectedParentId));
        }
      }

      router.push("/admin/industries");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-1">
        <Factory className="text-indigo-600" size={24} />
        Create Industry
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Create a parent industry on its own, or add children under an existing parent.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => {
            setKind("parent");
            setMessage("");
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${
            kind === "parent"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Parent industry
        </button>
        <button
          type="button"
          onClick={() => {
            setKind("child");
            setMessage("");
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${
            kind === "child"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Child industry
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {kind === "parent" ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Parent industry name
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Metalworking"
                className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase">
                  Children <span className="normal-case font-normal text-gray-400">(optional)</span>
                </label>
                <button
                  type="button"
                  onClick={addChildField}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <Plus size={14} /> Add child
                </button>
              </div>
              <div className="space-y-2">
                {childNames.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setChildName(index, e.target.value)}
                      placeholder="Child industry name"
                      className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeChildField(index)}
                      className="p-2.5 text-gray-400 hover:text-red-600"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Leave children empty to create only the parent.
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Parent industry
              </label>
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
                disabled={loadingParents}
              >
                <option value="">
                  {loadingParents ? "Loading parents…" : "Select parent industry"}
                </option>
                {parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase">
                  Child industry name
                </label>
                <button
                  type="button"
                  onClick={addChildField}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <Plus size={14} /> Add another child
                </button>
              </div>
              <div className="space-y-2">
                {childNames.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setChildName(index, e.target.value)}
                      placeholder="e.g. CNC Machines"
                      className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required={index === 0}
                    />
                    <button
                      type="button"
                      onClick={() => removeChildField(index)}
                      className="p-2.5 text-gray-400 hover:text-red-600"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {message && (
          <p className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
            {message}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition disabled:opacity-50"
          >
            {submitting
              ? "Creating…"
              : kind === "parent"
                ? "Create parent"
                : "Create child"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/industries")}
            className="border border-gray-200 text-gray-700 py-2.5 px-5 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

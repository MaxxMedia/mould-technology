"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ParentOption = {
  id: number;
  name: string;
};

type IndustryFormValues = {
  name: string;
  parentId: number | null;
};

type IndustryFormProps = {
  initialValues?: IndustryFormValues;
  excludeId?: number;
  submitLabel: string;
  onSubmit: (values: IndustryFormValues) => Promise<void>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function IndustryForm({
  initialValues,
  excludeId,
  submitLabel,
  onSubmit,
}: IndustryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [parentId, setParentId] = useState(
    initialValues?.parentId ? String(initialValues.parentId) : ""
  );
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues?.name) setName(initialValues.name);
    setParentId(initialValues?.parentId ? String(initialValues.parentId) : "");
  }, [initialValues?.name, initialValues?.parentId]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function loadParents() {
      const res = await fetch(`${API_URL}/api/admin/industries/parents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const rows: ParentOption[] = Array.isArray(data) ? data : [];
      let options = rows.filter((row) => row.id !== excludeId);

      if (
        initialValues?.parentId &&
        !options.some((row) => row.id === initialValues.parentId)
      ) {
        const current = await fetch(
          `${API_URL}/api/admin/industries/${initialValues.parentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (current.ok) {
          const parent = await current.json();
          options = [{ id: parent.id, name: parent.name }, ...options];
        }
      }

      setParents(options);
    }

    loadParents().catch(() => setParents([]));
  }, [excludeId, initialValues?.parentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        parentId: parentId ? Number(parentId) : null,
      });
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
          Industry name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Metalworking"
          className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
          Parent industry
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">None — top-level parent</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Leave as none to keep this a parent industry.
        </p>
      </div>

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
          {submitting ? "Saving…" : submitLabel}
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
  );
}

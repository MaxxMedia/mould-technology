"use client";
import { useEffect, useState } from "react";

type Entitlement = { id: number; packageName: string; status: string; Company?: { name: string } };
export default function ContentPackageSelect({ type, value, onChange }: {
  type: "BANNER" | "SPONSORED"; value: number | null; onChange: (id: number | null) => void;
}) {
  const [options, setOptions] = useState<Entitlement[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch(process.env.NEXT_PUBLIC_API_URL + "/api/payments/admin/entitlements?type=" + type, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }, cache: "no-store",
    }).then(async response => {
      if (!response.ok) throw new Error("Unable to load company packages");
      const data = await response.json();
      if (active) setOptions(data);
    }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [type]);
  return (
    <div>
      <label className="mb-1 block font-medium">Company {type === "BANNER" ? "banner" : "sponsored content"} package</label>
      <select className="w-full rounded border p-2" value={value ?? ""} onChange={event => onChange(event.target.value ? Number(event.target.value) : null)}>
        <option value="">General site content</option>
        {value && !options.some(option => option.id === value) && <option value={value}>Existing company package #{value}</option>}
        {options.map(option => <option key={option.id} value={option.id}>{option.Company?.name} — {option.packageName} ({option.status === "TRIAL" ? "30-day trial" : "Paid"})</option>)}
      </select>
      <p className="mt-1 text-xs text-gray-500">Link company content to its package to apply expiry and renewal automatically.</p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

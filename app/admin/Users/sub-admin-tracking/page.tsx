"use client";

import { useState } from "react";
import {
    RefreshCw,
    Upload,
    Pencil,
    Users,
    Activity,
    Globe,
    ChevronLeft,
    ChevronRight,
    Sparkles,
} from "lucide-react";

interface SubAdminSummary {
    id: number | string;
    name: string;
    email: string;
    status: "ONLINE" | "OFFLINE";
    events: number;
    organizersDone: number;
    organizersTotal: number;
    exhibitors: number;
    speakers: number;
    bulkImports: number;
    created: number;
    updated: number;
}

// ===== Replace with real API data later. Empty array = "no data yet" state. =====
const subAdmins: SubAdminSummary[] = [];

const overview = {
    totalCreated: 0,
    totalUpdated: 0,
    subAdminsOnline: 0,
    events: 0,
    organizersDone: 0,
    organizersTotal: 0,
    exhibitors: 0,
    speakers: 0,
    bulkImports: 0,
};

function formatMonthLabel(year: number, month: number) {
    return new Date(year, month, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

function daysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function pad(n: number) {
    return n.toString().padStart(2, "0");
}

export default function SubAdminTrackingPage() {
    const today = new Date();
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(
        `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    );
    const [selectedAdmin, setSelectedAdmin] = useState<SubAdminSummary | null>(
        subAdmins[0] ?? null
    );

    function goToPrevMonth() {
        setCalMonth((m) => {
            if (m === 0) {
                setCalYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
    }

    function goToNextMonth() {
        setCalMonth((m) => {
            if (m === 11) {
                setCalYear((y) => y + 1);
                return 0;
            }
            return m + 1;
        });
    }

    const maxCreated = Math.max(...subAdmins.map((a) => a.created), 1);
    const totalDays = daysInMonth(calYear, calMonth);
    const firstWeekday = new Date(calYear, calMonth, 1).getDay();
    const leadingBlanks = Array.from({ length: firstWeekday }, (_, i) => i);
    const monthDays = Array.from({ length: totalDays }, (_, i) => i + 1);

    return (
        <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-6">
            {/* ===== HEADER ===== */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sub Admin Tracking</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Created vs updated counts per sub-admin (last 90 days)
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Table format: created / updated</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                    <RefreshCw size={15} />
                    Refresh
                </button>
            </div>

            {/* ===== TOP SUMMARY CARDS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard label="Total Created" value={overview.totalCreated} icon={<Upload size={16} className="text-blue-500" />} />
                <SummaryCard label="Total Updated" value={overview.totalUpdated} icon={<Pencil size={16} className="text-purple-500" />} />
                <SummaryCard label="Sub Admins Online" value={overview.subAdminsOnline} icon={<Users size={16} className="text-orange-500" />} />
            </div>

            {/* ===== MODULE STAT CARDS ===== */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Events" value={overview.events} />
                <StatCard label="Organizers" value={`${overview.organizersDone} / ${overview.organizersTotal}`} />
                <StatCard label="Exhibitors" value={overview.exhibitors} />
                <StatCard label="Speakers" value={overview.speakers} />
                <StatCard label="Bulk Imports" value={overview.bulkImports} />
            </div>

            {/* ===== TOP ACTIVE SUB ADMINS + ONLINE STATUS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Top Active Sub Admins</h2>
                    {subAdmins.length === 0 ? (
                        <p className="text-sm text-gray-400 py-6 text-center">No sub admin activity yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {subAdmins.map((admin) => {
                                const isSelected = selectedAdmin?.id === admin.id;
                                const pct = Math.max((admin.created / maxCreated) * 100, 3);
                                return (
                                    <button
                                        key={admin.id}
                                        onClick={() => setSelectedAdmin(admin)}
                                        className={`w-full text-left rounded-lg p-3 transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{admin.name}</p>
                                                {admin.email && <p className="text-xs text-gray-400">{admin.email}</p>}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{admin.created}</p>
                                                <p className="text-xs text-gray-400">created / updated</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Online Status</h2>
                    {subAdmins.length === 0 ? (
                        <p className="text-sm text-gray-400 py-6 text-center">No sub admins yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {subAdmins.map((admin) => (
                                <div key={admin.id} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{admin.name}</span>
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${admin.status === "ONLINE"
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        {admin.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== SUB ADMIN ACTIVITY TABLE ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Sub Admin Activity Table</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-100">
                                <th className="px-6 py-3 font-medium">Sub-admin</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Events</th>
                                <th className="px-6 py-3 font-medium">Organizers</th>
                                <th className="px-6 py-3 font-medium">Exhibitors</th>
                                <th className="px-6 py-3 font-medium">Speakers</th>
                                <th className="px-6 py-3 font-medium">Bulk</th>
                                <th className="px-6 py-3 font-medium">Created</th>
                                <th className="px-6 py-3 font-medium">Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-10 text-center text-gray-400">
                                        No activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                subAdmins.map((admin) => (
                                    <tr
                                        key={admin.id}
                                        onClick={() => setSelectedAdmin(admin)}
                                        className={`cursor-pointer hover:bg-gray-50 ${selectedAdmin?.id === admin.id ? "bg-blue-50/50" : ""
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{admin.name}</p>
                                            {admin.email && <p className="text-xs text-gray-400">{admin.email}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-md text-xs font-semibold ${admin.status === "ONLINE"
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : "bg-gray-100 text-gray-500"
                                                    }`}
                                            >
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{admin.events}</td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {admin.organizersTotal > 0
                                                ? `${admin.organizersDone} / ${admin.organizersTotal}`
                                                : admin.organizersDone}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{admin.exhibitors}</td>
                                        <td className="px-6 py-4 text-gray-700">{admin.speakers}</td>
                                        <td className="px-6 py-4 text-gray-700">{admin.bulkImports}</td>
                                        <td className="px-6 py-4 text-gray-900 font-medium">{admin.created}</td>
                                        <td className="px-6 py-4 text-blue-600 font-semibold">{admin.updated}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== SUB ADMIN PERFORMANCE ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900">Sub Admin Performance</h2>
                    {selectedAdmin ? (
                        <span className="text-sm text-blue-600">
                            {selectedAdmin.name} {selectedAdmin.email && `(${selectedAdmin.email})`}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400">No sub admin selected</span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Calendar */}
                    <div className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <button onClick={goToPrevMonth} className="text-gray-400 hover:text-gray-600">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-semibold text-gray-800">
                                {formatMonthLabel(calYear, calMonth)}
                            </span>
                            <button onClick={goToNextMonth} className="text-gray-400 hover:text-gray-600">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                <div key={d}>{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {leadingBlanks.map((b) => (
                                <div key={`blank-${b}`} />
                            ))}
                            {monthDays.map((day) => {
                                const dateStr = `${calYear}-${pad(calMonth + 1)}-${pad(day)}`;
                                const isSelected = dateStr === selectedDate;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`text-xs rounded-md py-1.5 ${isSelected
                                                ? "bg-gray-900 text-white font-semibold"
                                                : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
                            <Sparkles size={12} />
                            Click a highlighted date to see exact uploads
                        </p>
                    </div>

                    {/* Stat tiles */}
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <PerfCard label="Events" value={selectedAdmin?.events ?? 0} icon={<Activity size={15} className="text-emerald-500" />} />
                        <PerfCard
                            label="Organizers"
                            value={
                                selectedAdmin && selectedAdmin.organizersTotal > 0
                                    ? `${selectedAdmin.organizersDone} / ${selectedAdmin.organizersTotal}`
                                    : selectedAdmin?.organizersDone ?? 0
                            }
                            icon={<Users size={15} className="text-blue-500" />}
                        />
                        <PerfCard label="Exhibitors" value={selectedAdmin?.exhibitors ?? 0} icon={<Users size={15} className="text-purple-500" />} />
                        <PerfCard label="Speakers" value={selectedAdmin?.speakers ?? 0} icon={<Users size={15} className="text-orange-500" />} />
                        <PerfCard label="Bulk Imports" value={selectedAdmin?.bulkImports ?? 0} icon={<Upload size={15} className="text-blue-500" />} />
                        <PerfCard label="Total Created" value={selectedAdmin?.created ?? 0} icon={<Globe size={15} className="text-gray-500" />} />
                        <PerfCard label="Total Updated" value={selectedAdmin?.updated ?? 0} icon={<Pencil size={15} className="text-purple-500" />} />

                        {/* Selected date panel */}
                        <div className="sm:col-span-3 border border-gray-100 rounded-xl p-4">
                            <p className="text-sm font-semibold text-gray-800 mb-1">
                                Selected Date: {selectedDate}
                            </p>
                            <p className="text-sm text-gray-400">No activity on this date.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ================= SMALL CARD COMPONENTS ================= */

function SummaryCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{label}</p>
                {icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );
}

function PerfCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
    return (
        <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{label}</p>
                {icon}
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );
}
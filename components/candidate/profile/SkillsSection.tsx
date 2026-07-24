"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, ThumbsUp } from "lucide-react";
import {
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/lib/api/candidate/skills";

type Skill = {
  id: number;
  name: string;
  level?: string;
  endorsementsCount?: number;
};

interface SkillsSectionProps {
  editable?: boolean;
  skills: Skill[];
  onEditClick?: () => void;
}

export default function SkillsSection({
  editable = false,
  skills: initialSkills = [],
  onEditClick,
}: SkillsSectionProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [loading, setLoading] = useState(false);
  const [endorsedIds, setEndorsedIds] = useState<Record<number, boolean>>({});

  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const [name, setName] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    setSkills(initialSkills);
    setLoading(false);
  }, [initialSkills]);

  function openAddModal() {
    setEditingSkill(null);
    setName("");
    setLevel("");
    setShowModal(true);
  }

  function openEditModal(skill: Skill) {
    setEditingSkill(skill);
    setName(skill.name);
    setLevel(skill.level || "");
    setShowModal(true);
  }

  async function saveSkill() {
    try {
      if (!name.trim()) return;

      if (editingSkill) {
        await updateSkill(editingSkill.id, {
          name,
          level,
        });
      } else {
        await createSkill({
          name,
          level,
        });
      }

      setShowModal(false);
      if (onEditClick) onEditClick();
    } catch (err) {
      console.error(err);
    }
  }

  async function removeSkill(id: number) {
    if (!confirm("Delete this skill?")) return;

    try {
      await deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      if (onEditClick) onEditClick();
    } catch (err) {
      console.error(err);
    }
  }

  const toggleEndorse = (id: number) => {
    setEndorsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 shadow-sm relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#000000]">
          Skills {skills.length > 0 && <span className="text-[#5A5F69] font-normal">({skills.length})</span>}
        </h2>

        {!editable && onEditClick && (
          <button
            onClick={onEditClick}
            title="Edit Skills"
            className="text-[#5A5F69] hover:text-[#0F5B78] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <Pencil size={16} />
          </button>
        )}

        {editable && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-full border border-[#0F5B78] text-[#0F5B78] px-3.5 py-1 text-xs font-semibold hover:bg-[#0F5B78]/10 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Add Skill
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && <p className="text-xs text-[#5A5F69]">Loading skills...</p>}

      {/* Empty */}
      {!loading && skills.length === 0 && (
        <p className="text-sm text-[#5A5F69] italic">No skills added yet.</p>
      )}

      {/* Skills Vertical List (LinkedIn Layout) */}
      {!loading && skills.length > 0 && (
        <div className="divide-y divide-gray-100">
          {skills.map((skill) => {
            const isEndorsed = endorsedIds[skill.id];
            return (
              <div key={skill.id} className="py-3 font-medium first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-[#000000]">{skill.name}</h3>
                  {skill.level && (
                    <p className="text-xs text-[#5A5F69] mt-0.5 font-medium">
                      Level: {skill.level}
                    </p>
                  )}
                </div>

                {editable && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(skill)}
                      className="text-[#5A5F69] hover:text-[#0F5B78] p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="text-[#5A5F69] hover:text-[#B40F24] p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-[#000000]">
                {editingSkill ? "Edit Skill" : "Add Skill"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#5A5F69] hover:text-[#000000] p-1 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-semibold text-[#000000] block mb-1">Skill Name</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0F5B78]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. React.js, Collaborative Solutions"
                />
              </div>

              <div>
                <label className="font-semibold text-[#000000] block mb-1">Proficiency Level</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0F5B78]"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="">Select Level</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-full font-semibold text-xs text-[#5A5F69] hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveSkill}
                className="bg-[#0F5B78] hover:bg-[#0b445a] text-white px-5 py-2 rounded-full font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
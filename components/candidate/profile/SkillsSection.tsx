"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/lib/api/candidate/skills";

type Skill = {
  id: number;
  name: string;
  level?: string;
};

interface SkillsSectionProps {
  editable?: boolean;
  skills: Skill[];
  onEditClick?: () => void; // Add this
}

export default function SkillsSection({
  editable = false,
  skills: initialSkills = [],
  onEditClick, // Add this
}: SkillsSectionProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">Skills</h2>

        {/* Edit button for non-editable mode */}
        {!editable && onEditClick && (
          <button
            onClick={onEditClick}
            className="flex items-center gap-2 rounded-full border border-blue-600 text-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-50"
          >
            <Pencil size={16} />
            Edit Skills
          </button>
        )}

        {editable && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-full border border-blue-600 text-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-50"
          >
            <Plus size={16} />
            Add Skill
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {/* Empty */}
      {!loading && skills.length === 0 && (
        <div className="border rounded-lg p-10 text-center text-gray-500">
          No skills added yet.
        </div>
      )}

      {/* Skills */}
      {!loading && skills.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-2 border border-blue-600 rounded-full px-4 py-2"
            >
              <span className="text-sm font-medium">{skill.name}</span>
              {skill.level && (
                <span className="text-xs text-gray-500">({skill.level})</span>
              )}
              {editable && (
                <>
                  <button
                    onClick={() => openEditModal(skill)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">
                {editingSkill ? "Edit Skill" : "Add Skill"}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Skill</label>
                <input
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Level</label>
                <select
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="">Select</option>
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
                className="border rounded-md px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={saveSkill}
                className="bg-blue-600 text-white rounded-md px-4 py-2 flex items-center gap-2"
              >
                <Check size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
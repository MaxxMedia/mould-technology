"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Plus, Trash2, Loader2 } from "lucide-react";

export interface Skill {
  id?: number;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert" | string;
}

interface Props {
  initialValues: Skill[];
  loading?: boolean;
  onSubmit: (values: Skill[]) => Promise<void>;
}

const validationSchema = Yup.object({
  skills: Yup.array().of(
    Yup.object({
      name: Yup.string().required("Skill name is required"),
      level: Yup.string(),
    })
  ),
});

export default function SkillsForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  const sanitizedInitialValues = (initialValues.length > 0 ? initialValues : [
    { name: "", level: "Intermediate" }
  ]).map((s) => ({
    ...s,
    name: s.name || "",
    level: s.level || "Intermediate",
  }));

  return (
    <Formik
      initialValues={{ skills: sanitizedInitialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.skills);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="space-y-6">
          <FieldArray name="skills">
            {({ push, remove }) => (
              <>
                <div className="space-y-4">
                  {values.skills.map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 items-end p-3.5 bg-white border border-gray-200 rounded-xl shadow-2xs"
                    >
                      <div className="col-span-6">
                        <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1">
                          Skill Name *
                        </label>
                        <Field
                          name={`skills.${index}.name`}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
                          placeholder="e.g. React.js, Project Management"
                        />
                        <ErrorMessage
                          name={`skills.${index}.name`}
                          component="p"
                          className="text-red-500 text-xs mt-1 font-medium"
                        />
                      </div>

                      <div className="col-span-5">
                        <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1">
                          Proficiency Level
                        </label>
                        <Field
                          as="select"
                          name={`skills.${index}.level`}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-[#000000] bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </Field>
                      </div>

                      <div className="col-span-1 flex justify-center pb-2">
                        {values.skills.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-[#5A5F69] hover:text-[#B40F24] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                            title="Remove Skill"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    push({
                      name: "",
                      level: "Intermediate",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5B78] hover:underline cursor-pointer pt-1"
                >
                  <Plus size={16} />
                  Add another skill
                </button>
              </>
            )}
          </FieldArray>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="bg-[#0F5B78] hover:bg-[#0b445a] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {(loading || isSubmitting) && <Loader2 size={16} className="animate-spin" />}
              Save
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
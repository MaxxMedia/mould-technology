"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import { Plus, Trash2, Loader2 } from "lucide-react";

export interface Project {
  id?: number;
  title: string;
  description: string;
  technologies: string;
  projectUrl: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
}

interface Props {
  initialValues: Project[];
  loading?: boolean;
  onSubmit: (values: Project[]) => Promise<void>;
}

const validationSchema = Yup.object({
  projects: Yup.array().of(
    Yup.object({
      title: Yup.string().required("Project title is required"),
      description: Yup.string(),
      technologies: Yup.string(),
      projectUrl: Yup.string().url("Invalid URL"),
      imageUrl: Yup.string().url("Invalid URL"),
      startDate: Yup.string(),
      endDate: Yup.string(),
    })
  ),
});

export default function ProjectsForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  const sanitizedInitialValues = (initialValues.length > 0 ? initialValues : [
    {
      title: "",
      description: "",
      technologies: "",
      projectUrl: "",
      imageUrl: "",
      startDate: "",
      endDate: "",
    }
  ]).map((p) => ({
    ...p,
    title: p.title || "",
    description: p.description || "",
    technologies: p.technologies || "",
    projectUrl: p.projectUrl || "",
    imageUrl: p.imageUrl || "",
    startDate: p.startDate || "",
    endDate: p.endDate || "",
  }));

  return (
    <Formik
      initialValues={{ projects: sanitizedInitialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.projects);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="space-y-6">
          <FieldArray name="projects">
            {({ push, remove }) => (
              <>
                <div className="space-y-6">
                  {values.projects.map((_, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-white relative space-y-4 shadow-2xs">
                      {values.projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#B40F24] transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                          title="Remove Project"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      <h4 className="font-bold text-sm text-[#000000]">
                        Project #{index + 1}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Input
                            label="Project Title *"
                            name={`projects.${index}.title`}
                            placeholder="e.g. Mold Design System Automation"
                          />
                        </div>

                        <Input
                          label="Technologies / Skill Keywords"
                          name={`projects.${index}.technologies`}
                          placeholder="e.g. CAD, SolidWorks, React, Node.js"
                        />

                        <Input
                          label="Project URL"
                          name={`projects.${index}.projectUrl`}
                          placeholder="https://github.com/username/project"
                        />

                        <Input
                          label="Project Image / Cover URL"
                          name={`projects.${index}.imageUrl`}
                          placeholder="https://example.com/cover.png"
                        />

                        <Input
                          type="date"
                          label="Start Date"
                          name={`projects.${index}.startDate`}
                        />

                        <Input
                          type="date"
                          label="End Date"
                          name={`projects.${index}.endDate`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
                          Description
                        </label>
                        <Field
                          as="textarea"
                          rows={4}
                          name={`projects.${index}.description`}
                          placeholder="Detail your key role, project architecture, problem solved, or outcomes achieved..."
                          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
                        />
                        <ErrorMessage
                          name={`projects.${index}.description`}
                          component="p"
                          className="text-red-500 text-xs mt-1 font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    push({
                      title: "",
                      description: "",
                      technologies: "",
                      projectUrl: "",
                      imageUrl: "",
                      startDate: "",
                      endDate: "",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5B78] hover:underline cursor-pointer pt-1"
                >
                  <Plus size={16} />
                  Add another project
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

function Input({
  label,
  name,
  type = "text",
  placeholder = "",
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  const [field, meta] = useField(name);

  let value = field.value || "";
  if (type === "date" && value && value.includes("T")) {
    value = value.split("T")[0];
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        {...field}
        type={type}
        value={value}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
      />
      {meta.touched && meta.error && (
        <p className="text-red-500 text-xs mt-1 font-medium">{meta.error}</p>
      )}
    </div>
  );
}
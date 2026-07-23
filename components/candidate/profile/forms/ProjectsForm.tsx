"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";

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
      title: Yup.string().required("Title is required"),
      description: Yup.string(),
      technologies: Yup.string(),
      projectUrl: Yup.string().url("Invalid URL"),
      imageUrl: Yup.string().url("Invalid URL"),
      startDate: Yup.string(),
      endDate: Yup.string(),
    })
  ),
});

// Custom Input component using useField
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
  
  return (
    <div>
      <label className="font-medium">{label}</label>
      <input
        {...field}
        type={type}
        value={field.value || ""}
        placeholder={placeholder}
        className="mt-2 w-full border rounded-lg p-3"
      />
      {meta.touched && meta.error && (
        <p className="text-red-500 text-sm mt-1">{meta.error}</p>
      )}
    </div>
  );
}

// Custom Textarea component using useField
function Textarea({
  label,
  name,
  rows = 4,
  placeholder = "",
}: {
  label: string;
  name: string;
  rows?: number;
  placeholder?: string;
}) {
  const [field, meta] = useField(name);
  
  return (
    <div>
      <label className="font-medium">{label}</label>
      <textarea
        {...field}
        value={field.value || ""}
        rows={rows}
        placeholder={placeholder}
        className="mt-2 w-full border rounded-lg p-3"
      />
      {meta.touched && meta.error && (
        <p className="text-red-500 text-sm mt-1">{meta.error}</p>
      )}
    </div>
  );
}

export default function ProjectsForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  // Ensure all fields have default values
  const sanitizedValues = initialValues.map(item => ({
    id: item.id,
    title: item.title || "",
    description: item.description || "",
    technologies: item.technologies || "",
    projectUrl: item.projectUrl || "",
    imageUrl: item.imageUrl || "",
    startDate: item.startDate || "",
    endDate: item.endDate || "",
  }));

  return (
    <Formik
      initialValues={{ projects: sanitizedValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.projects);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="bg-white rounded-xl border shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Projects</h2>
          </div>

          <FieldArray name="projects">
            {({ push, remove }) => (
              <>
                <div className="space-y-8">
                  {values.projects.map((_, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-5 relative"
                    >
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-4 right-4 text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Project Title"
                          name={`projects.${index}.title`}
                          placeholder="Enter project title"
                        />

                        <Input
                          label="Technologies"
                          name={`projects.${index}.technologies`}
                          placeholder="React, Node.js, etc."
                        />

                        <Input
                          label="Project URL"
                          name={`projects.${index}.projectUrl`}
                          placeholder="https://example.com"
                        />

                        <Input
                          label="Image URL"
                          name={`projects.${index}.imageUrl`}
                          placeholder="https://example.com/image.jpg"
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

                      <div className="mt-4">
                        <Textarea
                          label="Description"
                          name={`projects.${index}.description`}
                          rows={4}
                          placeholder="Describe your project..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-6 flex items-center gap-2 text-blue-600"
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
                >
                  <Plus size={18} />
                  Add Project
                </button>
              </>
            )}
          </FieldArray>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              {loading || isSubmitting ? "Saving..." : "Save Projects"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
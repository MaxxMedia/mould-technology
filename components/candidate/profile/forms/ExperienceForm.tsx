"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";

export interface Experience {
  id?: number;
  title: string;
  company: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

interface Props {
  initialValues: Experience[];
  loading?: boolean;
  onSubmit: (values: Experience[]) => Promise<void>;
}

const validationSchema = Yup.object({
  experiences: Yup.array().of(
    Yup.object({
      title: Yup.string().required("Job title is required"),
      company: Yup.string().required("Company is required"),
      employmentType: Yup.string().required("Employment type is required"),
      location: Yup.string().required("Location is required"),
      startDate: Yup.string().required("Start date is required"),
      endDate: Yup.string().when("currentlyWorking", {
        is: false,
        then: (schema) => schema.required("End date is required"),
      }),
      currentlyWorking: Yup.boolean(),
      description: Yup.string(),
    })
  ),
});

export default function ExperienceForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  // Ensure all values have default strings to prevent controlled/uncontrolled issues
  const sanitizedInitialValues = initialValues.map((exp) => ({
    ...exp,
    title: exp.title || "",
    company: exp.company || "",
    employmentType: exp.employmentType || "",
    location: exp.location || "",
    startDate: exp.startDate || "",
    endDate: exp.endDate || "",
    currentlyWorking: exp.currentlyWorking || false,
    description: exp.description || "",
  }));

  return (
    <Formik
      initialValues={{ experiences: sanitizedInitialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.experiences);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="bg-white rounded-xl border shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Experience</h2>
          </div>

          <FieldArray name="experiences">
            {({ push, remove }) => (
              <>
                <div className="space-y-8">
                  {values.experiences.map((_, index) => (
                    <div key={index} className="border rounded-lg p-5 relative">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-4 right-4 text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Job Title"
                          name={`experiences.${index}.title`}
                        />

                        <Input
                          label="Company"
                          name={`experiences.${index}.company`}
                        />

                        <Select
                          label="Employment Type"
                          name={`experiences.${index}.employmentType`}
                          options={[
                            "Full-time",
                            "Part-time",
                            "Internship",
                            "Contract",
                            "Freelance",
                          ]}
                        />

                        <Input
                          label="Location"
                          name={`experiences.${index}.location`}
                        />

                        <Input
                          type="date"
                          label="Start Date"
                          name={`experiences.${index}.startDate`}
                        />

                        <Input
                          type="date"
                          label="End Date"
                          name={`experiences.${index}.endDate`}
                        />
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Field
                          type="checkbox"
                          name={`experiences.${index}.currentlyWorking`}
                        />
                        <span className="text-sm">I currently work here</span>
                      </div>

                      <div className="mt-4">
                        <label className="font-medium">Description</label>
                        <Field
                          as="textarea"
                          rows={4}
                          name={`experiences.${index}.description`}
                          className="mt-2 w-full border rounded-lg p-3"
                        />
                        <ErrorMessage
                          name={`experiences.${index}.description`}
                          component="p"
                          className="text-red-500 text-sm"
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
                      company: "",
                      employmentType: "",
                      location: "",
                      startDate: "",
                      endDate: "",
                      currentlyWorking: false,
                      description: "",
                    })
                  }
                  className="mt-6 flex items-center gap-2 text-blue-600"
                >
                  <Plus size={18} />
                  Add Experience
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
              {loading || isSubmitting ? "Saving..." : "Save Experience"}
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
}: {
  label: string;
  name: string;
  type?: string;
}) {
  const [field, meta] = useField(name);
  
  return (
    <div>
      <label className="font-medium">{label}</label>
      <input
        {...field}
        type={type}
        value={field.value || ""}
        className="mt-2 w-full border rounded-lg p-3"
      />
      {meta.touched && meta.error && (
        <p className="text-red-500 text-sm mt-1">{meta.error}</p>
      )}
    </div>
  );
}

function Select({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  const [field, meta] = useField(name);
  
  return (
    <div>
      <label className="font-medium">{label}</label>
      <select
        {...field}
        value={field.value || ""}
        className="mt-2 w-full border rounded-lg p-3"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {meta.touched && meta.error && (
        <p className="text-red-500 text-sm mt-1">{meta.error}</p>
      )}
    </div>
  );
}
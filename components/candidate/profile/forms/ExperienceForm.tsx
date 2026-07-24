"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import { Plus, Trash2, Loader2 } from "lucide-react";

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
  const sanitizedInitialValues = (initialValues.length > 0 ? initialValues : [
    {
      title: "",
      company: "",
      employmentType: "Full-time",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    }
  ]).map((exp) => ({
    ...exp,
    title: exp.title || "",
    company: exp.company || "",
    employmentType: exp.employmentType || "Full-time",
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
        <Form className="space-y-6">
          <FieldArray name="experiences">
            {({ push, remove }) => (
              <>
                <div className="space-y-6">
                  {values.experiences.map((exp, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-white relative space-y-4 shadow-2xs">
                      {values.experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#B40F24] transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                          title="Remove Experience"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      <h4 className="font-bold text-sm text-[#000000]">
                        Experience #{index + 1}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Job Title *"
                          name={`experiences.${index}.title`}
                          placeholder="e.g. Associate Application Developer"
                        />

                        <Input
                          label="Company Name *"
                          name={`experiences.${index}.company`}
                          placeholder="e.g. Orbit Core Tech"
                        />

                        <Select
                          label="Employment Type *"
                          name={`experiences.${index}.employmentType`}
                          options={[
                            "Full-time",
                            "Part-time",
                            "Self-employed",
                            "Freelance",
                            "Contract",
                            "Internship",
                            "Apprenticeship",
                          ]}
                        />

                        <Input
                          label="Location *"
                          name={`experiences.${index}.location`}
                          placeholder="e.g. Bengaluru, Karnataka, India"
                        />

                        <Input
                          type="date"
                          label="Start Date *"
                          name={`experiences.${index}.startDate`}
                        />

                        {!exp.currentlyWorking && (
                          <Input
                            type="date"
                            label="End Date *"
                            name={`experiences.${index}.endDate`}
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Field
                          type="checkbox"
                          id={`experiences.${index}.currentlyWorking`}
                          name={`experiences.${index}.currentlyWorking`}
                          className="w-4 h-4 text-[#0F5B78] border-gray-300 rounded focus:ring-[#0F5B78]"
                        />
                        <label
                          htmlFor={`experiences.${index}.currentlyWorking`}
                          className="text-xs font-semibold text-[#000000] cursor-pointer"
                        >
                          I am currently working in this role
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
                          Description
                        </label>
                        <Field
                          as="textarea"
                          rows={4}
                          name={`experiences.${index}.description`}
                          placeholder="Summarize your key responsibilities, campaign management, or achievements..."
                          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
                        />
                        <ErrorMessage
                          name={`experiences.${index}.description`}
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
                      company: "",
                      employmentType: "Full-time",
                      location: "",
                      startDate: "",
                      endDate: "",
                      currentlyWorking: false,
                      description: "",
                    })
                  }
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0F5B78] hover:underline cursor-pointer pt-1"
                >
                  <Plus size={16} />
                  Add another experience
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
      <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <select
        {...field}
        value={field.value || ""}
        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-[#000000] bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
      >
        <option value="">Select Employment Type</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {meta.touched && meta.error && (
        <p className="text-red-500 text-xs mt-1 font-medium">{meta.error}</p>
      )}
    </div>
  );
}
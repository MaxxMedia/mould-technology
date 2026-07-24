"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import { Plus, Trash2, Loader2 } from "lucide-react";

export interface Education {
  id?: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  grade: string;
  startYear: string;
  endYear: string;
  description: string;
}

interface Props {
  initialValues: Education[];
  loading?: boolean;
  onSubmit: (values: Education[]) => Promise<void>;
}

const validationSchema = Yup.object({
  education: Yup.array().of(
    Yup.object({
      institution: Yup.string().required("School or University is required"),
      degree: Yup.string().required("Degree is required"),
      fieldOfStudy: Yup.string().required("Field of study is required"),
      grade: Yup.string(),
      startYear: Yup.string().required("Start year is required"),
      endYear: Yup.string().required("End year is required"),
      description: Yup.string(),
    })
  ),
});

export default function EducationForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  const sanitizedInitialValues = (initialValues.length > 0 ? initialValues : [
    {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      grade: "",
      startYear: "",
      endYear: "",
      description: "",
    }
  ]).map((edu) => ({
    ...edu,
    institution: edu.institution || "",
    degree: edu.degree || "",
    fieldOfStudy: edu.fieldOfStudy || "",
    grade: edu.grade || "",
    startYear: edu.startYear ? String(edu.startYear) : "",
    endYear: edu.endYear ? String(edu.endYear) : "",
    description: edu.description || "",
  }));

  return (
    <Formik
      initialValues={{ education: sanitizedInitialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.education);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="space-y-6">
          <FieldArray name="education">
            {({ push, remove }) => (
              <>
                <div className="space-y-6">
                  {values.education.map((_, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-white relative space-y-4 shadow-2xs">
                      {values.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#B40F24] transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                          title="Remove Education"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      <h4 className="font-bold text-sm text-[#000000]">
                        Education #{index + 1}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="School / University *"
                          name={`education.${index}.institution`}
                          placeholder="e.g. Stanford University, VTU"
                        />

                        <Input
                          label="Degree *"
                          name={`education.${index}.degree`}
                          placeholder="e.g. Bachelor of Engineering (B.E.)"
                        />

                        <Input
                          label="Field of Study *"
                          name={`education.${index}.fieldOfStudy`}
                          placeholder="e.g. Computer Science & Engineering"
                        />

                        <Input
                          label="Grade / CGPA"
                          name={`education.${index}.grade`}
                          placeholder="e.g. 8.5 CGPA or First Class"
                        />

                        <Input
                          label="Start Year *"
                          name={`education.${index}.startYear`}
                          placeholder="e.g. 2020"
                        />

                        <Input
                          label="End Year *"
                          name={`education.${index}.endYear`}
                          placeholder="e.g. 2024"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
                          Activities and Societies / Description
                        </label>
                        <Field
                          as="textarea"
                          rows={3}
                          name={`education.${index}.description`}
                          placeholder="Activities, societies, coursework, or honors..."
                          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
                        />
                        <ErrorMessage
                          name={`education.${index}.description`}
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
                      institution: "",
                      degree: "",
                      fieldOfStudy: "",
                      grade: "",
                      startYear: "",
                      endYear: "",
                      description: "",
                    })
                  }
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0F5B78] hover:underline cursor-pointer pt-1"
                >
                  <Plus size={16} />
                  Add another education
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
  placeholder = "",
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  const [field, meta] = useField(name);

  return (
    <div>
      <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        {...field}
        value={field.value || ""}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
      />
      {meta.touched && meta.error && (
        <p className="text-red-500 text-xs mt-1 font-medium">{meta.error}</p>
      )}
    </div>
  );
}
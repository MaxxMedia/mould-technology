"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";

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
      institution: Yup.string().required("Institution is required"),
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
  return (
    <Formik
      initialValues={{ education: initialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.education);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="bg-white rounded-xl border shadow p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Education</h2>
          </div>

          <FieldArray name="education">
            {({ push, remove }) => (
              <>
                <div className="space-y-8">
                  {values.education.map((_, index) => (
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
                          label="Institution"
                          name={`education.${index}.institution`}
                        />

                        <Input
                          label="Degree"
                          name={`education.${index}.degree`}
                        />

                        <Input
                          label="Field of Study"
                          name={`education.${index}.fieldOfStudy`}
                        />

                        <Input
                          label="Grade / CGPA"
                          name={`education.${index}.grade`}
                        />

                        <Input
                          type="number"
                          label="Start Year"
                          name={`education.${index}.startYear`}
                        />

                        <Input
                          type="number"
                          label="End Year"
                          name={`education.${index}.endYear`}
                        />

                      </div>

                      <div className="mt-4">
                        <label className="font-medium">
                          Description
                        </label>

                        <Field
                          as="textarea"
                          rows={4}
                          name={`education.${index}.description`}
                          className="mt-2 w-full border rounded-lg p-3"
                        />

                        <ErrorMessage
                          name={`education.${index}.description`}
                          component="p"
                          className="text-red-500 text-sm"
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
                      institution: "",
                      degree: "",
                      fieldOfStudy: "",
                      grade: "",
                      startYear: "",
                      endYear: "",
                      description: "",
                    })
                  }
                >
                  <Plus size={18} />
                  Add Education
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
              {loading || isSubmitting
                ? "Saving..."
                : "Save Education"}
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
  return (
    <div>
      <label className="font-medium">{label}</label>

      <Field
        name={name}
        type={type}
        className="mt-2 w-full border rounded-lg p-3"
      />

      <ErrorMessage
        name={name}
        component="p"
        className="text-red-500 text-sm"
      />
    </div>
  );
}
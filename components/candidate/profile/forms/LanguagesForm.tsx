"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";

export interface Language {
  id?: number;
  language: string;
  proficiency: "Beginner" | "Intermediate" | "Professional" | "Native";
}

interface Props {
  initialValues: Language[];
  loading?: boolean;
  onSubmit: (values: Language[]) => Promise<void>;
}

const validationSchema = Yup.object({
  languages: Yup.array().of(
    Yup.object({
      language: Yup.string().required("Language is required"),
      proficiency: Yup.string().required("Proficiency is required"),
    })
  ),
});

export default function LanguagesForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  return (
    <Formik
      initialValues={{ languages: initialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.languages);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="bg-white rounded-xl border shadow p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Languages
            </h2>
          </div>

          <FieldArray name="languages">
            {({ push, remove }) => (
              <>
                <div className="space-y-5">

                  {values.languages.map((_, index) => (

                    <div
                      key={index}
                      className="grid md:grid-cols-12 gap-4 items-start border rounded-lg p-4"
                    >

                      <div className="md:col-span-5">

                        <label className="font-medium">
                          Language
                        </label>

                        <Field
                          name={`languages.${index}.language`}
                          className="mt-2 w-full border rounded-lg p-3"
                          placeholder="English"
                        />

                        <ErrorMessage
                          name={`languages.${index}.language`}
                          component="p"
                          className="text-red-500 text-sm"
                        />

                      </div>

                      <div className="md:col-span-5">

                        <label className="font-medium">
                          Proficiency
                        </label>

                        <Field
                          as="select"
                          name={`languages.${index}.proficiency`}
                          className="mt-2 w-full border rounded-lg p-3"
                        >
                          <option value="">
                            Select
                          </option>

                          <option value="Beginner">
                            Beginner
                          </option>

                          <option value="Intermediate">
                            Intermediate
                          </option>

                          <option value="Professional">
                            Professional
                          </option>

                          <option value="Native">
                            Native
                          </option>

                        </Field>

                        <ErrorMessage
                          name={`languages.${index}.proficiency`}
                          component="p"
                          className="text-red-500 text-sm"
                        />

                      </div>

                      <div className="md:col-span-2 flex justify-end pt-8">

                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

                <button
                  type="button"
                  className="mt-6 flex items-center gap-2 text-blue-600"
                  onClick={() =>
                    push({
                      language: "",
                      proficiency: "Beginner",
                    })
                  }
                >
                  <Plus size={18} />
                  Add Language
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
                : "Save Languages"}
            </button>
          </div>

        </Form>
      )}
    </Formik>
  );
}
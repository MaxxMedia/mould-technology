"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";

export interface Skill {
  id?: number;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

interface Props {
  initialValues: Skill[];
  loading?: boolean;
  onSubmit: (values: Skill[]) => Promise<void>;
}

const validationSchema = Yup.object({
  skills: Yup.array().of(
    Yup.object({
      name: Yup.string().required("Skill is required"),
      level: Yup.string().required("Level is required"),
    })
  ),
});

export default function SkillsForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  return (
    <Formik
      initialValues={{ skills: initialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.skills);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="bg-white rounded-xl border shadow p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Skills
            </h2>
          </div>

          <FieldArray name="skills">
            {({ push, remove }) => (
              <>
                <div className="space-y-4">

                  {values.skills.map((_, index) => (

                    <div
                      key={index}
                      className="grid grid-cols-12 gap-4 items-start"
                    >

                      <div className="col-span-6">

                        <label className="text-sm font-medium">
                          Skill
                        </label>

                        <Field
                          name={`skills.${index}.name`}
                          className="mt-1 w-full rounded-lg border p-3"
                          placeholder="React"
                        />

                        <ErrorMessage
                          name={`skills.${index}.name`}
                          component="p"
                          className="text-red-500 text-sm"
                        />

                      </div>

                      <div className="col-span-4">

                        <label className="text-sm font-medium">
                          Level
                        </label>

                        <Field
                          as="select"
                          name={`skills.${index}.level`}
                          className="mt-1 w-full rounded-lg border p-3"
                        >
                          <option value="">
                            Select
                          </option>

                          <option>
                            Beginner
                          </option>

                          <option>
                            Intermediate
                          </option>

                          <option>
                            Advanced
                          </option>

                          <option>
                            Expert
                          </option>

                        </Field>

                      </div>

                      <div className="col-span-2 flex justify-end pt-8">

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
                  onClick={() =>
                    push({
                      name: "",
                      level: "Beginner",
                    })
                  }
                  className="mt-6 flex items-center gap-2 text-blue-600 font-medium"
                >
                  <Plus size={18} />
                  Add Skill
                </button>

              </>
            )}
          </FieldArray>

          <div className="flex justify-end mt-8">

            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {loading || isSubmitting
                ? "Saving..."
                : "Save Skills"}
            </button>

          </div>

        </Form>
      )}
    </Formik>
  );
}
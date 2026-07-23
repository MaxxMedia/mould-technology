"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";

export interface Achievement {
  id?: number;
  title: string;
  issuer: string;
  achievementDate: string;
  description: string;
}

interface Props {
  initialValues: Achievement[];
  loading?: boolean;
  onSubmit: (values: Achievement[]) => Promise<void>;
}

const validationSchema = Yup.object({
  achievements: Yup.array().of(
    Yup.object({
      title: Yup.string().required("Title is required"),
      issuer: Yup.string().required("Issuer is required"),
      achievementDate: Yup.string().required("Date is required"),
      description: Yup.string(),
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

export default function AchievementsForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  // Ensure all fields have default values
  const sanitizedValues = initialValues.map(item => ({
    id: item.id,
    title: item.title || "",
    issuer: item.issuer || "",
    achievementDate: item.achievementDate || "",
    description: item.description || "",
  }));

  return (
    <Formik
      initialValues={{ achievements: sanitizedValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.achievements);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="bg-white rounded-xl border shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Achievements</h2>
          </div>

          <FieldArray name="achievements">
            {({ push, remove }) => (
              <>
                <div className="space-y-6">
                  {values.achievements.map((_, index) => (
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
                          label="Achievement Title"
                          name={`achievements.${index}.title`}
                          placeholder="Enter achievement title"
                        />

                        <Input
                          label="Issuer"
                          name={`achievements.${index}.issuer`}
                          placeholder="Enter issuer name"
                        />

                        <Input
                          type="date"
                          label="Achievement Date"
                          name={`achievements.${index}.achievementDate`}
                        />
                      </div>

                      <div className="mt-4">
                        <Textarea
                          label="Description"
                          name={`achievements.${index}.description`}
                          rows={4}
                          placeholder="Enter achievement description"
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
                      issuer: "",
                      achievementDate: "",
                      description: "",
                    })
                  }
                >
                  <Plus size={18} />
                  Add Achievement
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
              {loading || isSubmitting ? "Saving..." : "Save Achievements"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
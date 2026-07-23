"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";

export interface Interest {
  id?: number;
  name: string;
  category: string;
  followersCount?: number;
  imageUrl?: string;
}

interface Props {
  initialValues: Interest[];
  loading?: boolean;
  onSubmit: (values: Interest[]) => Promise<void>;
}

const validationSchema = Yup.object({
  interests: Yup.array().of(
    Yup.object({
      name: Yup.string().required("Interest name is required"),
      category: Yup.string().required("Category is required"),
      followersCount: Yup.number()
        .nullable()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value
        ),
      imageUrl: Yup.string().url("Invalid URL").nullable(),
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

export default function InterestsForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  // Ensure all fields have default values
  const sanitizedValues = initialValues.map(item => ({
    id: item.id,
    name: item.name || "",
    category: item.category || "",
    followersCount: item.followersCount || 0,
    imageUrl: item.imageUrl || "",
  }));

  return (
    <Formik
      initialValues={{ interests: sanitizedValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.interests);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="bg-white rounded-xl border shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Interests</h2>
          </div>

          <FieldArray name="interests">
            {({ push, remove }) => (
              <>
                <div className="space-y-6">
                  {values.interests.map((_, index) => (
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
                          label="Interest Name"
                          name={`interests.${index}.name`}
                          placeholder="Artificial Intelligence"
                        />

                        <Input
                          label="Category"
                          name={`interests.${index}.category`}
                          placeholder="Technology"
                        />

                        <Input
                          type="number"
                          label="Followers"
                          name={`interests.${index}.followersCount`}
                        />

                        <Input
                          label="Image URL"
                          name={`interests.${index}.imageUrl`}
                          placeholder="https://..."
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
                      name: "",
                      category: "",
                      followersCount: 0,
                      imageUrl: "",
                    })
                  }
                >
                  <Plus size={18} />
                  Add Interest
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
              {loading || isSubmitting ? "Saving..." : "Save Interests"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
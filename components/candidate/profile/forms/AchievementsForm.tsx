"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import { Plus, Trash2, Loader2 } from "lucide-react";

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
      issuer: Yup.string().required("Issuer or Organization is required"),
      achievementDate: Yup.string().required("Date is required"),
      description: Yup.string(),
    })
  ),
});

export default function AchievementsForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  const sanitizedInitialValues = (initialValues.length > 0 ? initialValues : [
    {
      title: "",
      issuer: "",
      achievementDate: "",
      description: "",
    }
  ]).map((ach) => ({
    ...ach,
    title: ach.title || "",
    issuer: ach.issuer || "",
    achievementDate: ach.achievementDate || "",
    description: ach.description || "",
  }));

  return (
    <Formik
      initialValues={{ achievements: sanitizedInitialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.achievements);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="space-y-6">
          <FieldArray name="achievements">
            {({ push, remove }) => (
              <>
                <div className="space-y-6">
                  {values.achievements.map((_, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-white relative space-y-4 shadow-2xs">
                      {values.achievements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#B40F24] transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                          title="Remove Accomplishment"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      <h4 className="font-bold text-sm text-[#000000]">
                        Accomplishment #{index + 1}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Title / Honor *"
                          name={`achievements.${index}.title`}
                          placeholder="e.g. Employee of the Month, Hackathon First Prize"
                        />

                        <Input
                          label="Issuer / Organization *"
                          name={`achievements.${index}.issuer`}
                          placeholder="e.g. Tech Corp, IEEE"
                        />

                        <div className="md:col-span-2">
                          <Input
                            type="date"
                            label="Date Associated *"
                            name={`achievements.${index}.achievementDate`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
                          Description
                        </label>
                        <Field
                          as="textarea"
                          rows={3}
                          name={`achievements.${index}.description`}
                          placeholder="Describe your achievement, award criteria, or key accomplishments..."
                          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
                        />
                        <ErrorMessage
                          name={`achievements.${index}.description`}
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
                      issuer: "",
                      achievementDate: "",
                      description: "",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5B78] hover:underline cursor-pointer pt-1"
                >
                  <Plus size={16} />
                  Add another accomplishment
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
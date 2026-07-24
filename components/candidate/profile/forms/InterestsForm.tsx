"use client";

import { Formik, Form, FieldArray, useField } from "formik";
import * as Yup from "yup";
import { Plus, Trash2, Loader2 } from "lucide-react";

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
      category: Yup.string(),
      followersCount: Yup.number()
        .nullable()
        .transform((value, originalValue) => (originalValue === "" ? null : value)),
      imageUrl: Yup.string().url("Invalid URL").nullable(),
    })
  ),
});

export default function InterestsForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  const sanitizedInitialValues = (initialValues.length > 0 ? initialValues : [
    { name: "", category: "Industry", followersCount: undefined, imageUrl: "" }
  ]).map((i) => ({
    ...i,
    name: i.name || "",
    category: i.category || "Industry",
    followersCount: i.followersCount !== undefined ? i.followersCount : undefined,
    imageUrl: i.imageUrl || "",
  }));

  return (
    <Formik
      initialValues={{ interests: sanitizedInitialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.interests);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="space-y-6">
          <FieldArray name="interests">
            {({ push, remove }) => (
              <>
                <div className="space-y-5">
                  {values.interests.map((_, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-5 bg-white relative space-y-4 shadow-2xs"
                    >
                      {values.interests.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#B40F24] transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                          title="Remove Interest"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      <h4 className="font-bold text-sm text-[#000000]">
                        Interest #{index + 1}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Interest Name *"
                          name={`interests.${index}.name`}
                          placeholder="e.g. Artificial Intelligence, Mould Technology"
                        />

                        <Input
                          label="Category / Industry"
                          name={`interests.${index}.category`}
                          placeholder="e.g. Technology, Manufacturing"
                        />

                        <Input
                          label="Followers Count"
                          name={`interests.${index}.followersCount`}
                          type="number"
                          placeholder="e.g. 15000"
                        />

                        <Input
                          label="Image / Logo URL"
                          name={`interests.${index}.imageUrl`}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    push({
                      name: "",
                      category: "Industry",
                      followersCount: undefined,
                      imageUrl: "",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5B78] hover:underline cursor-pointer pt-1"
                >
                  <Plus size={16} />
                  Add another interest
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

  return (
    <div>
      <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        {...field}
        type={type}
        value={field.value !== undefined && field.value !== null ? field.value : ""}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
      />
      {meta.touched && meta.error && (
        <p className="text-red-500 text-xs mt-1 font-medium">{meta.error}</p>
      )}
    </div>
  );
}
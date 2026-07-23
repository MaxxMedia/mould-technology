"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";

export interface SocialLink {
  id?: number;
  platform: string;
  url: string;
  username?: string;
}

interface Props {
  initialValues: SocialLink[];
  loading?: boolean;
  onSubmit: (values: SocialLink[]) => Promise<void>;
}

const validationSchema = Yup.object({
  socials: Yup.array().of(
    Yup.object({
      platform: Yup.string().required("Platform is required"),
      url: Yup.string()
        .url("Enter a valid URL")
        .required("URL is required"),
      username: Yup.string(),
    })
  ),
});

const platforms = [
  "LinkedIn",
  "GitHub",
  "Portfolio",
  "Website",
  "Twitter",
  "X",
  "Instagram",
  "Facebook",
  "YouTube",
  "Medium",
  "Behance",
  "Dribbble",
  "Other",
];

export default function SocialLinksForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  return (
    <Formik
      initialValues={{ socials: initialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.socials);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="bg-white rounded-xl border shadow p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Social Links
            </h2>
          </div>

          <FieldArray name="socials">
            {({ push, remove }) => (
              <>
                <div className="space-y-6">

                  {values.socials.map((_, index) => (

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

                      <div className="grid md:grid-cols-3 gap-4">

                        <div>
                          <label className="font-medium">
                            Platform
                          </label>

                          <Field
                            as="select"
                            name={`socials.${index}.platform`}
                            className="mt-2 w-full border rounded-lg p-3"
                          >
                            <option value="">
                              Select Platform
                            </option>

                            {platforms.map((platform) => (
                              <option
                                key={platform}
                                value={platform}
                              >
                                {platform}
                              </option>
                            ))}
                          </Field>

                          <ErrorMessage
                            name={`socials.${index}.platform`}
                            component="p"
                            className="text-red-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="font-medium">
                            Username
                          </label>

                          <Field
                            name={`socials.${index}.username`}
                            className="mt-2 w-full border rounded-lg p-3"
                            placeholder="@username"
                          />
                        </div>

                        <div>
                          <label className="font-medium">
                            URL
                          </label>

                          <Field
                            name={`socials.${index}.url`}
                            className="mt-2 w-full border rounded-lg p-3"
                            placeholder="https://..."
                          />

                          <ErrorMessage
                            name={`socials.${index}.url`}
                            component="p"
                            className="text-red-500 text-sm"
                          />
                        </div>

                      </div>

                    </div>

                  ))}

                </div>

                <button
                  type="button"
                  className="mt-6 flex items-center gap-2 text-blue-600"
                  onClick={() =>
                    push({
                      platform: "",
                      username: "",
                      url: "",
                    })
                  }
                >
                  <Plus size={18} />
                  Add Social Link
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
                : "Save Social Links"}
            </button>

          </div>

        </Form>
      )}
    </Formik>
  );
}
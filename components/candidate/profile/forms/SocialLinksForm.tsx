"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Plus, Trash2, Loader2 } from "lucide-react";

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
      url: Yup.string().url("Enter a valid URL").required("URL is required"),
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
  const sanitizedInitialValues = (initialValues.length > 0 ? initialValues : [
    { platform: "LinkedIn", username: "", url: "" }
  ]).map((s) => ({
    ...s,
    platform: s.platform || "LinkedIn",
    username: s.username || "",
    url: s.url || "",
  }));

  return (
    <Formik
      initialValues={{ socials: sanitizedInitialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.socials);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="space-y-6">
          <FieldArray name="socials">
            {({ push, remove }) => (
              <>
                <div className="space-y-4">
                  {values.socials.map((_, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-white relative space-y-4 shadow-2xs">
                      {values.socials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#B40F24] transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                          title="Remove Social Link"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      <h4 className="font-bold text-sm text-[#000000]">
                        Contact & Social Link #{index + 1}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
                            Platform *
                          </label>
                          <Field
                            as="select"
                            name={`socials.${index}.platform`}
                            className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-[#000000] bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
                          >
                            <option value="">Select Platform</option>
                            {platforms.map((platform) => (
                              <option key={platform} value={platform}>
                                {platform}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name={`socials.${index}.platform`}
                            component="p"
                            className="text-red-500 text-xs mt-1 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
                            Username / Handle
                          </label>
                          <Field
                            name={`socials.${index}.username`}
                            className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
                            placeholder="@username"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
                            Full URL *
                          </label>
                          <Field
                            name={`socials.${index}.url`}
                            className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
                            placeholder="https://linkedin.com/in/username"
                          />
                          <ErrorMessage
                            name={`socials.${index}.url`}
                            component="p"
                            className="text-red-500 text-xs mt-1 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    push({
                      platform: "LinkedIn",
                      username: "",
                      url: "",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5B78] hover:underline cursor-pointer pt-1"
                >
                  <Plus size={16} />
                  Add another social link
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
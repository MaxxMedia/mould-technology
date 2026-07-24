"use client";

import { Formik, Form, FieldArray, useField } from "formik";
import * as Yup from "yup";
import { Plus, Trash2, Loader2 } from "lucide-react";

export interface Certification {
  id?: number;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate: string;
  credentialUrl: string;
}

interface Props {
  initialValues: Certification[];
  loading?: boolean;
  onSubmit: (values: Certification[]) => Promise<void>;
}

const validationSchema = Yup.object({
  certifications: Yup.array().of(
    Yup.object({
      name: Yup.string().required("Certificate name is required"),
      issuingOrganization: Yup.string().required("Issuing organization is required"),
      issueDate: Yup.string().required("Issue date is required"),
      expirationDate: Yup.string(),
      credentialUrl: Yup.string().url("Invalid URL"),
    })
  ),
});

export default function CertificationsForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  const sanitizedInitialValues = (initialValues.length > 0 ? initialValues : [
    {
      name: "",
      issuingOrganization: "",
      issueDate: "",
      expirationDate: "",
      credentialUrl: "",
    }
  ]).map((cert) => ({
    ...cert,
    name: cert.name || "",
    issuingOrganization: cert.issuingOrganization || "",
    issueDate: cert.issueDate || "",
    expirationDate: cert.expirationDate || "",
    credentialUrl: cert.credentialUrl || "",
  }));

  return (
    <Formik
      initialValues={{ certifications: sanitizedInitialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.certifications);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="space-y-6">
          <FieldArray name="certifications">
            {({ push, remove }) => (
              <>
                <div className="space-y-6">
                  {values.certifications.map((_, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-white relative space-y-4 shadow-2xs">
                      {values.certifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-4 right-4 text-[#5A5F69] hover:text-[#B40F24] transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                          title="Remove Certification"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      <h4 className="font-bold text-sm text-[#000000]">
                        License & Certification #{index + 1}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Certification Name *"
                          name={`certifications.${index}.name`}
                          placeholder="e.g. AWS Certified Solutions Architect"
                        />

                        <Input
                          label="Issuing Organization *"
                          name={`certifications.${index}.issuingOrganization`}
                          placeholder="e.g. Amazon Web Services, Microsoft"
                        />

                        <Input
                          type="date"
                          label="Issue Date *"
                          name={`certifications.${index}.issueDate`}
                        />

                        <Input
                          type="date"
                          label="Expiration Date"
                          name={`certifications.${index}.expirationDate`}
                        />

                        <div className="md:col-span-2">
                          <Input
                            label="Credential URL"
                            name={`certifications.${index}.credentialUrl`}
                            placeholder="https://example.com/credentials/123"
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
                      name: "",
                      issuingOrganization: "",
                      issueDate: "",
                      expirationDate: "",
                      credentialUrl: "",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5B78] hover:underline cursor-pointer pt-1"
                >
                  <Plus size={16} />
                  Add another certification
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
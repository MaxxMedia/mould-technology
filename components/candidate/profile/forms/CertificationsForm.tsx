"use client";

import { Formik, Form, FieldArray, useField } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";

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
      issuingOrganization: Yup.string().required("Organization is required"),
      issueDate: Yup.string().required("Issue date is required"),
      expirationDate: Yup.string(),
      credentialUrl: Yup.string().url("Invalid URL"),
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
  
  // Format the value for date inputs
  let value = field.value || "";
  if (type === "date" && value && value.includes('T')) {
    value = value.split('T')[0];
  }
  
  return (
    <div>
      <label className="font-medium">{label}</label>
      <input
        {...field}
        type={type}
        value={value}
        placeholder={placeholder}
        className="mt-2 w-full border rounded-lg p-3"
      />
      {meta.touched && meta.error && (
        <p className="text-red-500 text-sm mt-1">{meta.error}</p>
      )}
    </div>
  );
}

export default function CertificationsForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  // Ensure all fields have default values and format dates
  const sanitizedValues = initialValues.map(item => ({
    id: item.id,
    name: item.name || "",
    issuingOrganization: item.issuingOrganization || "",
    issueDate: item.issueDate ? (item.issueDate.includes('T') ? item.issueDate.split('T')[0] : item.issueDate) : "",
    expirationDate: item.expirationDate ? (item.expirationDate.includes('T') ? item.expirationDate.split('T')[0] : item.expirationDate) : "",
    credentialUrl: item.credentialUrl || "",
  }));

  return (
    <Formik
      initialValues={{ certifications: sanitizedValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values.certifications);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="bg-white rounded-xl border shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Certifications</h2>
          </div>

          <FieldArray name="certifications">
            {({ push, remove }) => (
              <>
                <div className="space-y-8">
                  {values.certifications.map((_, index) => (
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
                          label="Certificate Name"
                          name={`certifications.${index}.name`}
                          placeholder="Enter certificate name"
                        />

                        <Input
                          label="Issuing Organization"
                          name={`certifications.${index}.issuingOrganization`}
                          placeholder="Enter issuing organization"
                        />

                        <Input
                          type="date"
                          label="Issue Date"
                          name={`certifications.${index}.issueDate`}
                        />

                        <Input
                          type="date"
                          label="Expiration Date"
                          name={`certifications.${index}.expirationDate`}
                        />

                        <Input
                          label="Credential URL"
                          name={`certifications.${index}.credentialUrl`}
                          placeholder="https://example.com/credential"
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
                      issuingOrganization: "",
                      issueDate: "",
                      expirationDate: "",
                      credentialUrl: "",
                    })
                  }
                >
                  <Plus size={18} />
                  Add Certification
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
              {loading || isSubmitting ? "Saving..." : "Save Certifications"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Camera } from "lucide-react";

export interface BasicInfoValues {
  firstName: string;
  lastName: string;
  headline: string;
  currentPosition: string;
  company: string;
  location: string;
  website: string;
  phone: string;
  email: string;
  about: string;
  avatar?: string;
}

interface Props {
  initialValues: BasicInfoValues;
  loading?: boolean;
  onSubmit: (
    values: BasicInfoValues
  ) => Promise<void>;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  headline: Yup.string().required("Required"),
  currentPosition: Yup.string().required("Required"),
  company: Yup.string(),
  location: Yup.string().required("Required"),
  website: Yup.string().url("Invalid URL"),
  phone: Yup.string(),
  email: Yup.string()
    .email("Invalid email")
    .required("Required"),
  about: Yup.string().max(1000),
});

export default function BasicInfoForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  const [preview, setPreview] = useState(
    initialValues.avatar || ""
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form className="bg-white rounded-xl shadow border p-6 space-y-8">

          {/* Avatar */}

          <div className="flex items-center gap-6">

            <div className="relative">

              <img
                src={
                  preview ||
                  "/images/default-avatar.png"
                }
                alt=""
                className="w-28 h-28 rounded-full object-cover border"
              />

              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer">

                <Camera size={16} />

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (!file) return;

                    const url =
                      URL.createObjectURL(file);

                    setPreview(url);

                    setFieldValue(
                      "avatar",
                      file
                    );
                  }}
                />

              </label>

            </div>

            <div>

              <h2 className="font-semibold text-lg">
                Profile Photo
              </h2>

              <p className="text-sm text-gray-500">
                JPG, PNG up to 5 MB
              </p>

            </div>

          </div>

          {/* Personal */}

          <div className="grid md:grid-cols-2 gap-5">

            <Input
              name="firstName"
              label="First Name"
            />

            <Input
              name="lastName"
              label="Last Name"
            />

            <Input
              name="headline"
              label="Headline"
            />

            <Input
              name="currentPosition"
              label="Current Position"
            />

            <Input
              name="company"
              label="Company"
            />

            <Input
              name="location"
              label="Location"
            />

            <Input
              name="website"
              label="Website"
            />

            <Input
              name="phone"
              label="Phone"
            />

            <Input
              name="email"
              label="Email"
              type="email"
            />

          </div>

          {/* About */}

          <div>

            <label className="font-medium">
              About
            </label>

            <Field
              as="textarea"
              rows={6}
              name="about"
              className="mt-2 w-full rounded-lg border p-3"
            />

            <ErrorMessage
              name="about"
              component="p"
              className="text-red-500 text-sm mt-1"
            />

          </div>

          {/* Buttons */}

          <div className="flex justify-end gap-3">

            <button
              type="reset"
              className="px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              disabled={
                loading || isSubmitting
              }
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              {loading || isSubmitting
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </Form>
      )}
    </Formik>
  );
}

interface InputProps {
  label: string;
  name: string;
  type?: string;
}

function Input({
  label,
  name,
  type = "text",
}: InputProps) {
  return (
    <div>

      <label className="font-medium">
        {label}
      </label>

      <Field
        name={name}
        type={type}
        className="mt-2 w-full rounded-lg border p-3"
      />

      <ErrorMessage
        name={name}
        component="p"
        className="text-red-500 text-sm mt-1"
      />

    </div>
  );
}
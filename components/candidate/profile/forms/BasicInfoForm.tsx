"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Camera, Loader2 } from "lucide-react";

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
  onSubmit: (values: BasicInfoValues) => Promise<void>;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  headline: Yup.string().required("Headline is required"),
  currentPosition: Yup.string(),
  company: Yup.string(),
  location: Yup.string().required("Location is required"),
  website: Yup.string().url("Invalid URL"),
  phone: Yup.string(),
  email: Yup.string().email("Invalid email").required("Email is required"),
  about: Yup.string().max(2000),
});

export default function BasicInfoForm({
  initialValues,
  onSubmit,
  loading = false,
}: Props) {
  const [preview, setPreview] = useState(initialValues.avatar || "");

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form className="space-y-5">
          {/* Avatar Photo Section */}
          <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="relative shrink-0">
              <img
                src={preview || "/images/default-avatar.png"}
                alt="Profile photo"
                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <label className="absolute bottom-0 right-0 bg-[#0F5B78] hover:bg-[#0b445a] text-white rounded-full p-1.5 cursor-pointer transition-colors shadow-sm">
                <Camera size={14} />
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setPreview(url);
                    setFieldValue("avatar", file);
                  }}
                />
              </label>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#000000]">Profile Photo</h4>
              <p className="text-xs text-[#5A5F69] mt-0.5">JPG, PNG up to 5 MB</p>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="firstName" label="First Name *" />
            <Input name="lastName" label="Last Name *" />
            <div className="md:col-span-2">
              <Input name="headline" label="Headline *" placeholder="e.g. Senior Software Engineer at Tech Corp" />
            </div>
            <Input name="currentPosition" label="Current Position" />
            <Input name="company" label="Company" />
            <Input name="location" label="Location *" placeholder="e.g. Bengaluru, Karnataka, India" />
            <Input name="website" label="Website" placeholder="https://yourwebsite.com" />
            <Input name="email" label="Email *" type="email" />
            <Input name="phone" label="Phone Number" />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              disabled={loading || isSubmitting}
              type="submit"
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

interface InputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}

function Input({ label, name, type = "text", placeholder = "" }: InputProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#5A5F69] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <Field
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent transition-all"
      />
      <ErrorMessage name={name} component="p" className="text-red-500 text-xs mt-1 font-medium" />
    </div>
  );
}
"use client";
import { CheckCircle2, FileText, ExternalLink } from "lucide-react";
import React from "react";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function PolicyItem({ text }: { text: string }) {
  return (
    <div className="flex gap-4">
      <CheckCircle2
        className="text-blue-600 mt-1 flex-shrink-0"
        size={22}
      />
      <p className="text-lg leading-8">
        {text}
      </p>
    </div>
  );
}

export default function ContentSubmissionPolicy({
  checked,
  onChange,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Before Submit Card */}
      <div className="rounded-2xl border border-blue-200 bg-white p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="flex-1 border-t border-gray-200" />
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={28} />
            <h2 className="text-3xl font-bold">
              Before You Submit
            </h2>
          </div>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <PolicyItem text="Article information is accurate and up to date." />
            <PolicyItem text="You own or have permission to upload all images." />
            <PolicyItem text="Content is original and copyright compliant." />
          </div>

          <div className="space-y-6 border-l border-gray-200 pl-8">
            <PolicyItem text="Duplicate or misleading content is prohibited." />
            <PolicyItem text="Articles are reviewed before publication." />
            <PolicyItem text="Follow the Content Submission Policy." />
          </div>
        </div>

        <hr className="my-8 border-gray-200" />

        <a
          href="/content-submission-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 font-medium hover:underline w-fit"
        >
          <FileText size={20} />
          View Full Content Submission Policy
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Checkbox */}
      <div className="rounded-2xl border bg-gray-50 p-5">
        <label className="flex items-center gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-gray-700">
            I have read and agree to the Content Submission Policy.
          </span>
        </label>
      </div>
    </div>
  );
}
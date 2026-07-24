"use client";

import {
    Award,
    ExternalLink,
    Pencil,
} from "lucide-react";

type Certification = {
    id: number;
    name: string;
    issuingOrganization: string;
    issueDate?: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
};

interface Props {
    editable?: boolean;
    certifications: Certification[];
    onEditClick?: () => void;
}

export default function CertificationsSection({
    editable = false,
    certifications,
    onEditClick,
}: Props) {

    return (
        <div className="bg-[#ffffff] rounded-lg border border-[#e0e0e0] p-6 shadow-sm relative">

            {(!editable && onEditClick) && (
                <button
                    onClick={onEditClick}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                    title="Edit Certifications"
                >
                    <Pencil size={16} />
                </button>
            )}

            {editable && (
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer">
                    <Pencil
                        size={16}
                    />
                </button>
            )}

            <h2 className="text-lg font-semibold mb-5">
                Certifications
            </h2>

            {certifications.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No certifications added.
                </p>
            ) : (
                <div className="space-y-5">

                    {certifications.map((cert) => (

                        <div
                            key={cert.id}
                            className="flex gap-4 border-b last:border-none pb-5"
                        >

                            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">

                                <Award
                                    className="text-yellow-700"
                                    size={22}
                                />

                            </div>

                            <div className="flex-1">

                                <h3 className="font-semibold">
                                    {cert.name}
                                </h3>

                                <p className="text-sm text-gray-600">
                                    {cert.issuingOrganization}
                                </p>

                                {cert.issueDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Issued {new Date(cert.issueDate).getFullYear()}
                                    </p>
                                )}

                                {cert.credentialId && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Credential ID: {cert.credentialId}
                                    </p>
                                )}

                                {cert.credentialUrl && (
                                    <a
                                        href={cert.credentialUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-[#0a66c2] mt-2 hover:underline"
                                    >
                                        Show Credential
                                        <ExternalLink size={14} />
                                    </a>
                                )}

                            </div>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}
// components/recruiter/PlanGatedSection.tsx - FULL COMPLETE VERSION

"use client";

export function PlanGatedSection({
    allowed,
    upgradeMessage,
    children,
}: {
    allowed: boolean;
    upgradeMessage: string;
    children: React.ReactNode;
}) {
    if (!allowed) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                {upgradeMessage}
            </div>
        );
    }
    return <>{children}</>;
}
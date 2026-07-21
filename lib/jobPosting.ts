export type JobPostingEligibility = {
  canPost: boolean;
  plan?: string;
  planLabel?: string;
  activeJobs?: number;
  baseLimit?: number | "Unlimited";
  bonusCredits?: number;
  effectiveLimit?: number | "Unlimited";
  remaining?: number | null;
  isUnlimited?: boolean;
  upgradeRequired?: boolean;
  message?: string;
};

export type JobPostingEligibilityResponse = JobPostingEligibility & {
  job: JobPostingEligibility;
  internship: JobPostingEligibility;
};

export async function fetchJobPostingEligibility(
  token: string
): Promise<JobPostingEligibilityResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/recruiter/posting-eligibility`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to load job posting eligibility");
  }

  return res.json();
}

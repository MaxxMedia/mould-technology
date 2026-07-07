import PackagesHero from "./PackagesHero"

type Section = {
  id: string
  title: string
  content: (string | string[])[]
}

const sections: Section[] = [
  {
    id: "eligibility",
    title: "1. Eligibility",
    content: [
      "Employers using the Job Portal must:",
      [
        "Be legally registered businesses, organizations, educational institutions, or government entities, where applicable",
        "Have the authority to recruit for the advertised position",
        "Provide accurate business and contact information",
        "Comply with all applicable employment and labour laws",
      ],
      "Recruitment agencies may use the Platform only with proper authorization and must clearly identify themselves when posting jobs on behalf of clients.",
    ],
  },
  {
    id: "permitted-job-postings",
    title: "2. Permitted Job Postings",
    content: [
      "Employers may post genuine employment opportunities, including:",
      [
        "Full-Time Positions",
        "Part-Time Positions",
        "Contract Roles",
        "Temporary Employment",
        "Apprenticeships",
        "Internships",
        "Graduate Trainee Programs",
        "Freelance Opportunities",
        "Consulting Assignments (where applicable)",
      ],
      "All vacancies must represent actual hiring requirements.",
    ],
  },
  {
    id: "job-listing-requirements",
    title: "3. Job Listing Requirements",
    content: [
      "Each job posting should include, where applicable:",
      [
        "Job Title",
        "Company Name",
        "Job Location",
        "Employment Type",
        "Department",
        "Job Description",
        "Required Qualifications",
        "Required Skills",
        "Experience Level",
        "Salary or Salary Range (recommended)",
        "Benefits (if applicable)",
        "Application Deadline",
        "Application Method",
        "Contact Information (where appropriate)",
      ],
      "Job titles and descriptions should accurately reflect the role being offered.",
    ],
  },
  {
    id: "employer-responsibilities",
    title: "4. Employer Responsibilities",
    content: [
      "Employers are responsible for ensuring that:",
      [
        "Job postings are truthful and accurate",
        "Information is kept up to date",
        "Vacancies are removed or closed once filled",
        "Candidates are treated professionally and fairly",
        "Recruitment activities comply with applicable employment, labour, anti-discrimination, and privacy laws",
      ],
      "Employers must maintain the confidentiality of applicant information and use it solely for legitimate recruitment purposes.",
    ],
  },
  {
    id: "prohibited-job-postings",
    title: "5. Prohibited Job Postings",
    content: [
      "The following are strictly prohibited:",
      [
        "Fake or non-existent job opportunities",
        "Pyramid schemes or multi-level marketing (MLM) recruitment",
        "Jobs requiring illegal activities",
        "Positions designed solely to collect personal information",
        "Misleading salary or benefit claims",
        "Duplicate postings intended to manipulate search results",
        "Jobs that violate labour laws or workplace safety requirements",
        "Recruitment for unlawful products or services",
      ],
      "ToolingTrends.com may remove any posting that violates these standards.",
    ],
  },
  {
    id: "equal-opportunity",
    title: "6. Equal Opportunity and Non-Discrimination",
    content: [
      "Employers are encouraged to promote equal employment opportunities.",
      "Job postings must not unlawfully discriminate based on characteristics protected under applicable law, including race, colour, religion, sex, age, disability, national origin, or other legally protected grounds.",
      "Any lawful occupational requirements must be clearly justified and comply with applicable regulations.",
    ],
  },
  {
    id: "salary-and-benefits",
    title: "7. Salary and Benefits",
    content: [
      "Where possible, employers are encouraged to provide:",
      [
        "Salary or salary range",
        "Incentives",
        "Bonuses",
        "Benefits",
        "Working hours",
        "Leave entitlements",
        "Other employment conditions",
      ],
      "Providing transparent compensation information helps candidates make informed decisions.",
    ],
  },
  {
    id: "recruitment-agencies",
    title: "8. Recruitment Agencies",
    content: [
      "Recruitment consultants and staffing agencies must:",
      [
        "Clearly identify themselves",
        "Have authorization to recruit for advertised positions",
        "Avoid posting duplicate advertisements",
        "Respect candidate privacy",
        "Not misrepresent employer identities",
      ],
      "Where confidentiality is required, agencies should provide sufficient information to allow candidates to understand the nature of the opportunity.",
    ],
  },
  {
    id: "candidate-privacy",
    title: "9. Candidate Privacy",
    content: [
      "Employers agree that resumes, applications, and candidate information obtained through ToolingTrends.com shall:",
      [
        "Be used solely for recruitment purposes",
        "Not be sold, rented, or transferred without appropriate authorization",
        "Be protected against unauthorized access",
        "Be retained only as long as reasonably necessary for recruitment or legal compliance",
      ],
      "Employers are responsible for complying with applicable privacy and data protection laws.",
    ],
  },
  {
    id: "resume-database-access",
    title: "10. Resume Database Access",
    content: [
      "Where resume database access is provided under a subscription plan, employers may search candidate profiles, contact candidates regarding relevant employment opportunities, and shortlist suitable applicants.",
      "Employers may not:",
      [
        "Harvest resumes for unrelated marketing",
        "Share candidate data with unauthorized third parties",
        "Build external databases from downloaded resumes",
        "Contact candidates for non-employment purposes",
      ],
      "Misuse of resume data may result in immediate suspension of access.",
    ],
  },
  {
    id: "application-process",
    title: "11. Application Process",
    content: [
      "Applications may be submitted through:",
      [
        "The ToolingTrends.com platform",
        "Employer career pages",
        "Applicant Tracking Systems (ATS)",
        "Official company email addresses",
        "Other approved application methods",
      ],
      "Employers should acknowledge applications where practicable and communicate recruitment outcomes in a timely and professional manner.",
    ],
  },
  {
    id: "verification-and-moderation",
    title: "12. Verification and Moderation",
    content: [
      "ToolingTrends.com reserves the right to:",
      [
        "Verify employer identity",
        "Request proof of business registration",
        "Confirm job authenticity",
        "Review job content before publication",
        "Edit formatting or categorization for consistency",
        "Reject or remove listings that violate this Policy",
      ],
      "Verification does not constitute endorsement of any employer or guarantee the authenticity of every recruitment opportunity.",
    ],
  },
  {
    id: "fees-and-paid-services",
    title: "13. Fees and Paid Services",
    content: [
      "Certain recruitment services may require payment, including:",
      [
        "Premium Job Listings",
        "Featured Job Posts",
        "Resume Database Access",
        "Employer Branding Pages",
        "Recruitment Advertising Packages",
      ],
      "All payments are subject to our Refund & Cancellation Policy.",
    ],
  },
  {
    id: "intellectual-property",
    title: "14. Intellectual Property",
    content: [
      "Employers retain ownership of the content they submit.",
      "By posting a job, employers grant ToolingTrends.com a non-exclusive, worldwide, royalty-free license to display, distribute, and promote the job listing through the Website, newsletters, social media channels, and other approved marketing platforms for the duration of the listing.",
    ],
  },
  {
    id: "disclaimer",
    title: "15. Disclaimer",
    content: [
      "ToolingTrends.com acts solely as a platform connecting employers and job seekers.",
      "We do not:",
      [
        "Guarantee the accuracy of job postings",
        "Verify every qualification claimed by candidates",
        "Guarantee employment outcomes",
        "Participate in hiring decisions",
        "Act as an employer or recruitment agency unless expressly stated",
      ],
      "Employers and candidates are responsible for conducting appropriate due diligence before entering into any employment relationship.",
    ],
  },
  {
    id: "policy-violations",
    title: "16. Policy Violations",
    content: [
      "If an employer violates this Policy, ToolingTrends.com may, at its sole discretion:",
      [
        "Reject a job posting",
        "Remove published vacancies",
        "Suspend recruitment privileges",
        "Restrict access to candidate databases",
        "Terminate employer accounts",
        "Report unlawful activities to the appropriate authorities where required",
      ],
      "Serious or repeated violations may result in permanent removal from the Platform.",
    ],
  },
  {
    id: "changes-to-this-policy",
    title: "17. Changes to This Policy",
    content: [
      "We may update this Job Posting Policy from time to time.",
      "Any revised version will be published on the Website with an updated Effective Date.",
      "Continued use of the recruitment services after such updates constitutes acceptance of the revised Policy.",
    ],
  },
  {
    id: "contact-us",
    title: "18. Contact Us",
    content: [
      "For questions regarding this Job Posting Policy or to report a suspected fraudulent job listing, please contact:",
    ],
  },
]

function renderBlock(block: string | string[], key: number) {
  if (Array.isArray(block)) {
    return (
      <ul key={key} className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {block.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm leading-relaxed text-[#616C74]"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004d73]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p key={key} className="mt-3 text-sm leading-relaxed text-[#616C74] sm:text-base">
      {block}
    </p>
  )
}

export default function JobPostingPolicyPageClient() {
  return (
    <main className="w-full bg-white">
      <PackagesHero
        title="Job Posting Policy"
        description="This policy governs the publication of job opportunities and the use of recruitment services on ToolingTrends.com."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <div className="rounded-2xl border border-[#e5e9ef] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#004d73]">
              Effective Date: July 6, 2026
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#616C74] sm:text-base">
              Welcome to ToolingTrends.com, owned and operated by Maxx Business Media
              Private Limited.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#616C74] sm:text-base">
              ToolingTrends.com provides a professional recruitment platform
              connecting employers with skilled professionals in the tooling, die
              &amp; mould, machine tools, manufacturing, precision engineering,
              metrology, industrial automation, additive manufacturing, CAD/CAM,
              quality assurance, and related industries.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#616C74] sm:text-base">
              This Job Posting Policy outlines the rules governing the publication
              of job opportunities and the use of our recruitment services. By
              posting a job or using our recruitment services, you agree to comply
              with this Policy.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fb] py-4 sm:py-8">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid gap-6 pb-16 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-[#e5e9ef] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2a3d47]">
                  On this page
                </h2>
                <nav className="mt-4 space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm leading-relaxed text-[#004d73] hover:text-blue-600 hover:underline"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="space-y-6">
              {sections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 rounded-2xl border border-[#e5e9ef] bg-white p-6 shadow-sm sm:p-8"
                >
                  <h2 className="text-lg font-semibold text-[#121213] sm:text-xl">
                    {section.title}
                  </h2>
                  <div className="mt-1 h-[2px] w-10 bg-blue-600" />
                  {section.content.map((block, index) => renderBlock(block, index))}

                  {section.id === "contact-us" && (
                    <div className="mt-4 rounded-xl bg-[#f8f9fb] p-4 text-sm leading-relaxed text-[#2a3d47]">
                      <p className="font-medium">Maxx Business Media Private Limited</p>
                      <p>ToolingTrends.com</p>
                      <p>Bengaluru, Karnataka, India</p>
                      <p className="mt-2">
                        Email:{" "}
                        <a
                          href="mailto:careers@toolingtrends.com"
                          className="text-[#004d73] hover:underline"
                        >
                          careers@toolingtrends.com
                        </a>
                      </p>
                      <p>
                        Website:{" "}
                        <a
                          href="https://www.toolingtrends.com"
                          className="text-[#004d73] hover:underline"
                        >
                          https://www.toolingtrends.com
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

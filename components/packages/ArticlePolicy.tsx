import Link from "next/link";
import PackagesHero from "./PackagesHero";

type Section = {
  id: string;
  title: string;
  content: (string | string[])[];
};

const SECTIONS: Section[] = [
  {
    id: "purpose",
    title: "1. Purpose",
    content: [
      "Our content platform aims to:",
      [
        "Share valuable industry knowledge",
        "Promote innovation and technology",
        "Support manufacturers and suppliers",
        "Publish business news",
        "Highlight product launches",
        "Promote industrial events",
        "Encourage technical discussions",
        "Foster professional networking",
      ],
      "We welcome high-quality, relevant, and informative content that benefits the manufacturing community.",
    ],
  },
  {
    id: "content-types",
    title: "2. Types of Content Accepted",
    content: [
      "ToolingTrends.com may accept the following content:",
      [
        "Editorial Articles",
        "Manufacturing Trends",
        "Industry Insights",
        "Technology Updates",
        "Best Practices",
        "Market Analysis",
        "Expert Opinions",
        "Thought Leadership",
      ],
      "Technical Content:",
      [
        "Technical Papers",
        "White Papers",
        "Research Articles",
        "Case Studies",
        "Engineering Guides",
        "Application Notes",
      ],
      "Business Content:",
      [
        "Company News",
        "Business Announcements",
        "Expansion News",
        "Awards & Achievements",
        "Partnerships",
        "Acquisitions",
        "Success Stories",
      ],
      "Product Content:",
      [
        "Product Launches",
        "Product Catalogues",
        "Product Demonstrations",
        "Product Videos",
        "Product Specifications",
        "Product Reviews",
      ],
      "Event Content:",
      [
        "Trade Fair Announcements",
        "Conference Updates",
        "Webinar Promotions",
        "Seminar Information",
        "Workshop Announcements",
      ],
      "Multimedia:",
      [
        "Images",
        "Videos",
        "Infographics",
        "Presentations",
        "Brochures",
        "Technical Drawings",
      ],
    ],
  },
  {
    id: "submission-requirements",
    title: "3. Submission Requirements",
    content: [
      "All submitted content should:",
      [
        "Be accurate and factual",
        "Be relevant to our audience",
        "Be professionally written",
        "Be free from offensive language",
        "Comply with applicable laws",
        "Be submitted in good faith",
        "Be complete and ready for editorial review",
      ],
      "Submissions may be returned for clarification or additional information if required.",
    ],
  },
  {
    id: "originality",
    title: "4. Originality",
    content: [
      "Unless clearly identified as licensed or previously published with permission, submitted content should be original.",
      "Contributors confirm that:",
      [
        "They own the content or have the necessary rights to submit it",
        "The content does not infringe any copyright, trademark, patent, trade secret, or other intellectual property right",
        "Appropriate permissions have been obtained for third-party material",
        "AI-assisted content, if used, has been reviewed for accuracy and originality",
      ],
      "Plagiarism or unauthorized copying is strictly prohibited.",
    ],
  },
  {
    id: "editorial-review",
    title: "5. Editorial Review",
    content: [
      "All submissions are subject to editorial review.",
      "ToolingTrends.com may:",
      [
        "Review submissions for quality and relevance",
        "Edit grammar, spelling, punctuation, and formatting",
        "Improve headings or formatting for readability and consistency",
        "Request revisions or supporting information",
        "Decline publication without providing a reason",
      ],
      "Editorial review does not constitute verification of every factual claim made by contributors.",
    ],
  },
  {
    id: "sponsored-content",
    title: "6. Sponsored Content",
    content: [
      "Sponsored submissions may include:",
      [
        "Sponsored Articles",
        "Press Releases",
        "Product Promotions",
        "Company Profiles",
        "Interviews",
        "Brand Stories",
        "Marketing Campaigns",
      ],
      'Sponsored content may be identified with labels such as "Sponsored," "Partner Content," or similar wording to maintain transparency with readers.',
      "Acceptance of sponsored content is subject to our Advertising Policy.",
    ],
  },
  {
    id: "prohibited-content",
    title: "7. Prohibited Content",
    content: [
      "The following content is not permitted:",
      [
        "False or misleading information",
        "Defamatory or libelous material",
        "Hate speech or discriminatory content",
        "Obscene or sexually explicit material",
        "Violence or graphic content unrelated to industry",
        "Malware or malicious code",
        "Fraudulent schemes",
        "Illegal products or services",
        "Copyright-infringing material",
        "Confidential information disclosed without authorization",
        "Spam, keyword stuffing, or deceptive SEO practices",
        "Content intended solely to manipulate search engine rankings",
      ],
      "We reserve the right to reject or remove any prohibited content.",
    ],
  },
  {
    id: "multimedia",
    title: "8. Images, Videos, and Documents",
    content: [
      "When submitting multimedia content, contributors must ensure that:",
      [
        "They own the content or have permission to use it",
        "The content is of good quality",
        "It does not infringe intellectual property rights",
        "It does not contain misleading edits or manipulated information intended to deceive",
      ],
      "ToolingTrends.com may optimize file sizes or formats for website performance while preserving the integrity of the content.",
    ],
  },
  {
    id: "contributor-responsibilities",
    title: "9. Contributor Responsibilities",
    content: [
      "Contributors are responsible for:",
      [
        "The accuracy of submitted information",
        "Obtaining necessary permissions",
        "Ensuring compliance with applicable laws",
        "Respecting privacy and confidentiality",
        "Responding promptly to editorial queries when clarification is required",
      ],
      "Contributors remain responsible for the content even after publication.",
    ],
  },
  {
    id: "license",
    title: "10. License Granted to ToolingTrends.com",
    content: [
      "By submitting content, you grant Maxx Business Media Private Limited a non-exclusive, worldwide, royalty-free, transferable, and sublicensable license to:",
      [
        "Publish the content",
        "Display it on ToolingTrends.com",
        "Reproduce and distribute it",
        "Archive it",
        "Include it in newsletters and email campaigns",
        "Share it through our official social media channels",
        "Feature it in promotional materials related to the Platform",
        "Make reasonable formatting or technical adjustments without changing the intended meaning",
      ],
      "This license enables us to operate and promote the Platform while you retain ownership of your original content.",
    ],
  },
  {
    id: "removal",
    title: "11. Removal of Content",
    content: [
      "ToolingTrends.com reserves the right to remove or modify content if:",
      [
        "It violates this Policy",
        "It infringes intellectual property rights",
        "It becomes inaccurate or misleading",
        "Required legal documentation cannot be provided",
        "Removal is required by law or a court order",
        "Continued publication could expose the Platform or users to legal or security risks",
      ],
      "Requests for voluntary removal will be considered but may not always be granted, particularly where content forms part of archived publications or legal records.",
    ],
  },
  {
    id: "no-guarantee",
    title: "12. No Guarantee of Publication",
    content: [
      "Submission of content does not guarantee publication.",
      "Publication decisions are based on factors such as:",
      [
        "Relevance",
        "Editorial quality",
        "Accuracy",
        "Audience interest",
        "Available publishing schedules",
        "Compliance with our policies",
      ],
    ],
  },
  {
    id: "limitation-of-liability",
    title: "13. Limitation of Liability",
    content: [
      "ToolingTrends.com is not responsible for:",
      [
        "Business outcomes resulting from published content",
        "Errors supplied by contributors",
        "Third-party reliance on submitted material",
        "Disputes between contributors and readers",
      ],
      "Contributors agree to indemnify Maxx Business Media Private Limited against claims arising from content they submit, including claims relating to intellectual property infringement, defamation, or unlawful content.",
    ],
  },
  {
    id: "changes-to-policy",
    title: "14. Changes to This Policy",
    content: [
      "We may revise this Content Submission Policy from time to time.",
      "Updated versions will be published on the Website with a revised Effective Date.",
      "Continued submission of content after changes become effective constitutes acceptance of the revised Policy.",
    ],
  },
  {
    id: "contact",
    title: "15. Contact Us",
    content: [
      "If you have questions regarding this Content Submission Policy or wish to submit editorial content, please contact:",
    ],
  },
];

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
    );
  }

  return (
    <p key={key} className="mt-3 text-sm leading-relaxed text-[#616C74] sm:text-base">
      {block}
    </p>
  );
}

export default function ContentSubmissionPolicyPageClient() {
  return (
    <main className="w-full bg-white">
      <PackagesHero title="Content Submission Policy" />

      {/* Intro + Table of contents */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <div className="rounded-2xl border border-[#e5e9ef] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm leading-relaxed text-[#616C74] sm:text-base">
              Welcome to ToolingTrends.com (&ldquo;Website&rdquo;,
              &ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or
              &ldquo;us&rdquo;), owned and operated by Maxx Business Media
              Private Limited.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#616C74] sm:text-base">
              ToolingTrends.com is a leading digital platform serving the
              tooling, die &amp; mould, machine tools, precision engineering,
              manufacturing, metrology, industrial automation, additive
              manufacturing, CAD/CAM, and related industries.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#616C74] sm:text-base">
              This Content Submission Policy explains the rules and
              requirements for submitting articles, press releases, company
              news, product information, event announcements, images, videos,
              documents, and other content to the Platform.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#616C74] sm:text-base">
              By submitting content to ToolingTrends.com, you agree to comply
              with this Policy.
            </p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="bg-[#f8f9fb] py-4 sm:py-8">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid gap-6 pb-16 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-[#e5e9ef] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2a3d47]">
                  On this page
                </h2>
                <nav className="mt-4 space-y-2">
                  {SECTIONS.map((section) => (
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
              {SECTIONS.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 rounded-2xl border border-[#e5e9ef] bg-white p-6 shadow-sm sm:p-8"
                >
                  <h2 className="text-lg font-semibold text-[#121213] sm:text-xl">
                    {section.title}
                  </h2>
                  <div className="mt-1 h-[2px] w-10 bg-blue-600" />
                  {section.content.map((block, i) => renderBlock(block, i))}

                  {section.id === "contact" && (
                    <div className="mt-4 rounded-xl bg-[#f8f9fb] p-4 text-sm leading-relaxed text-[#2a3d47]">
                      <p className="font-medium">Editorial Team</p>
                      <p>ToolingTrends.com</p>
                      <p>A Division of Maxx Business Media Private Limited</p>
                      <p>Bengaluru, Karnataka, India</p>
                      <p className="mt-2">
                        Editorial Email:{" "}
                        <a
                          href="mailto:editor@toolingtrends.com"
                          className="text-[#004d73] hover:underline"
                        >
                          editor@toolingtrends.com
                        </a>
                      </p>
                      <p>
                        General Email:{" "}
                        <a
                          href="mailto:support@toolingtrends.com"
                          className="text-[#004d73] hover:underline"
                        >
                          support@toolingtrends.com
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
  );
}
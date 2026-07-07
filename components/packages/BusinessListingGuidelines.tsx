import PackagesHero from "./PackagesHero"

type Section = {
  id: string
  title: string
  content: (string | string[])[]
}

const sections: Section[] = [
  {
    id: "purpose",
    title: "1. Purpose",
    content: [
      "The Business Directory is designed to help users discover trusted industrial businesses, promote products and services, connect buyers with suppliers, increase business visibility, support networking within the manufacturing ecosystem, and facilitate business enquiries and collaborations.",
      "All listings should contribute to a professional and reliable directory.",
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: [
      "Businesses eligible for listing include, but are not limited to:",
      [
        "Manufacturers",
        "OEMs (Original Equipment Manufacturers)",
        "Tool Rooms",
        "Die & Mould Makers",
        "Machine Tool Manufacturers",
        "Cutting Tool Manufacturers",
        "Metrology Equipment Suppliers",
        "CAD/CAM Software Providers",
        "Industrial Automation Companies",
        "Robotics Companies",
        "Additive Manufacturing Providers",
        "Material Suppliers",
        "Industrial Distributors",
        "Engineering Service Providers",
        "Training Institutes",
        "Research Organizations",
        "Industry Associations",
        "Trade Fair Organizers",
        "Logistics Providers",
        "Financial and business service providers serving the manufacturing sector",
      ],
      "Businesses should operate lawfully and, where applicable, be properly registered under the laws of their jurisdiction.",
    ],
  },
  {
    id: "requirements",
    title: "3. Business Information Requirements",
    content: [
      "Each listing should include accurate and complete information where applicable, such as:",
      [
        "Company name",
        "Company logo",
        "Business description",
        "Year established",
        "Business category",
        "Products and services",
        "Manufacturing capabilities",
        "Brands represented",
        "Certifications",
        "Company address",
        "City, state, and country",
        "Contact person",
        "Email address",
        "Phone number",
        "Website",
        "Social media links",
        "Business hours",
      ],
      "All information must be truthful and regularly updated.",
    ],
  },
  {
    id: "accuracy",
    title: "4. Accuracy of Information",
    content: [
      "Listing owners are responsible for ensuring that:",
      [
        "Company information is accurate",
        "Contact details remain current",
        "Product descriptions are truthful",
        "Certifications and awards are genuine",
        "Images accurately represent the business",
        "Website links function correctly",
      ],
      "Misleading or inaccurate information may result in the suspension or removal of the listing.",
    ],
  },
  {
    id: "images",
    title: "5. Company Logos and Images",
    content: [
      "Businesses may upload:",
      [
        "Company logos",
        "Product images",
        "Factory photographs",
        "Office photographs",
        "Team photographs",
        "Product catalogues",
        "Marketing brochures",
        "Promotional videos where supported",
      ],
      "Uploaded content must:",
      [
        "Be owned by the business or used with appropriate permission",
        "Be of reasonable quality",
        "Not contain offensive, illegal, or misleading material",
        "Not infringe the intellectual property rights of others",
      ],
      "ToolingTrends.com may resize or optimize media for display without altering its substance.",
    ],
  },
  {
    id: "products",
    title: "6. Products and Services",
    content: [
      "Businesses may showcase their products and services, provided that descriptions are:",
      [
        "Accurate",
        "Relevant",
        "Clear",
        "Non-deceptive",
        "Professionally presented",
      ],
      "Claims regarding product performance, certifications, or compliance should be supported by appropriate evidence where required.",
    ],
  },
  {
    id: "prohibited",
    title: "7. Prohibited Listings",
    content: [
      "The following are not permitted:",
      [
        "Fake companies",
        "Impersonation of another business",
        "Duplicate listings intended to manipulate search results",
        "Counterfeit or illegal products",
        "False certifications or awards",
        "Misleading contact information",
        "Fraudulent investment opportunities",
        "Adult content",
        "Gambling-related businesses prohibited by law",
        "Illegal or regulated products promoted without required authorization",
        "Content that infringes copyrights, trademarks, patents, or other intellectual property rights",
      ],
      "We reserve the right to reject or remove any listing that does not align with the purpose of the Platform.",
    ],
  },
  {
    id: "premium",
    title: "8. Featured and Premium Listings",
    content: [
      "ToolingTrends.com may offer paid enhancements, including:",
      [
        "Featured listings",
        "Premium company profiles",
        "Homepage visibility",
        "Category highlights",
        "Product showcases",
        "Verified business badges where applicable",
        "Banner advertising",
        "Sponsored articles",
        "Newsletter promotion",
      ],
      "Premium placement improves visibility but does not constitute an endorsement of the listed business.",
    ],
  },
  {
    id: "verification",
    title: "9. Verification",
    content: [
      "To enhance trust within the directory, ToolingTrends.com may verify business information.",
      "Verification may include requests for:",
      [
        "Business registration documents",
        "GST registration where applicable",
        "Company website verification",
        "Official email verification",
        "Telephone confirmation",
        "Proof of address",
        "Other supporting documentation",
      ],
      "Verification status is based on the information provided and does not guarantee the quality, reliability, or financial standing of a business.",
    ],
  },
  {
    id: "reviews",
    title: "10. Business Reviews and Ratings",
    content: [
      "Where reviews or ratings are available:",
      [
        "Reviews should reflect genuine business experiences",
        "Businesses must not submit fake reviews or encourage deceptive reviews",
        "Attempts to manipulate ratings or reviews are prohibited",
      ],
      "ToolingTrends.com reserves the right to moderate or remove reviews that violate our Community Guidelines or applicable law.",
    ],
  },
  {
    id: "enquiries",
    title: "11. Enquiries and Lead Management",
    content: [
      "Businesses receiving enquiries through the Platform should:",
      [
        "Respond professionally and promptly",
        "Provide accurate information",
        "Respect the privacy of prospective customers",
        "Use enquiry information only for legitimate business purposes",
      ],
      "Lead information must not be sold, shared, or used for unrelated marketing without appropriate consent.",
    ],
  },
  {
    id: "ip",
    title: "12. Intellectual Property",
    content: [
      "Businesses retain ownership of the content they submit.",
      "By creating a listing, you grant ToolingTrends.com a non-exclusive, worldwide, royalty-free license to:",
      [
        "Display your company profile",
        "Publish your logo and images",
        "Promote your listing through newsletters, social media, and marketing campaigns",
        "Archive listing content for operational purposes",
      ],
      "This license remains in effect for as long as your listing is active or as otherwise required for legitimate business or legal purposes.",
    ],
  },
  {
    id: "moderation",
    title: "13. Monitoring and Moderation",
    content: [
      "ToolingTrends.com reserves the right to:",
      [
        "Review submitted listings",
        "Edit formatting or categorization",
        "Request corrections",
        "Reject incomplete submissions",
        "Remove outdated or inactive listings",
        "Suspend listings that violate these Guidelines or applicable law",
      ],
      "Repeated violations may result in permanent removal from the Platform.",
    ],
  },
  {
    id: "disclaimer",
    title: "14. Disclaimer",
    content: [
      "ToolingTrends.com serves as a business directory and networking platform.",
      "We do not:",
      [
        "Guarantee the accuracy of every listing",
        "Endorse listed companies",
        "Verify every claim made by businesses",
        "Guarantee product quality or service performance",
        "Act as a party to transactions between users",
      ],
      "Users should perform their own due diligence before entering into business relationships.",
    ],
  },
  {
    id: "changes",
    title: "15. Changes to These Guidelines",
    content: [
      "We may update these Business Listing Guidelines from time to time.",
      "Revised versions will be published on the Website with an updated Effective Date.",
      "Continued use of the Business Directory after such updates constitutes acceptance of the revised Guidelines.",
    ],
  },
  {
    id: "contact",
    title: "16. Contact Us",
    content: [
      "If you have questions regarding these Business Listing Guidelines or wish to report a listing that may violate this Policy, please contact us.",
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

export default function BusinessListingGuidelinesPageClient() {
  return (
    <main className="w-full bg-white">
      <PackagesHero
        title="Business Listing Guidelines"
        description="These guidelines govern how supplier and company listings are created, reviewed, and maintained on ToolingTrends.com."
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
              ToolingTrends.com is a professional B2B platform that connects
              manufacturers, suppliers, distributors, service providers, technology
              companies, educational institutions, industry associations, consultants,
              and buyers within the tooling, die &amp; mould, precision engineering,
              machine tools, manufacturing, metrology, automation, additive
              manufacturing, and related industries.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#616C74] sm:text-base">
              These Business Listing Guidelines govern the creation, management, and
              publication of company profiles and business listings on the Platform.
              By submitting or maintaining a business listing, you agree to comply
              with these Guidelines.
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

                  {section.id === "contact" && (
                    <div className="mt-4 rounded-xl bg-[#f8f9fb] p-4 text-sm leading-relaxed text-[#2a3d47]">
                      <p className="font-medium">Maxx Business Media Private Limited</p>
                      <p>ToolingTrends.com</p>
                      <p>Bengaluru, Karnataka, India</p>
                      <p className="mt-2">
                        Email:{" "}
                        <a
                          href="mailto:listings@toolingtrends.com"
                          className="text-[#004d73] hover:underline"
                        >
                          listings@toolingtrends.com
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

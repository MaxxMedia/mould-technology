import Link from "next/link"

type Props = {
  slug: string
  active: "home" | "about" | "jobs" | "people"
}

const tabs = [
  { key: "home" as const, label: "Home", href: (slug: string) => `/company/${slug}` },
  { key: "about" as const, label: "About", href: (slug: string) => `/company/${slug}/about` },
  { key: "jobs" as const, label: "Jobs", href: (slug: string) => `/company/${slug}/jobs` },
  { key: "people" as const, label: "People", href: (slug: string) => `/company/${slug}/people` },
]

export default function CompanyTabs({ slug, active }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm px-6 py-3 flex gap-6 text-sm font-medium">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href(slug)}
          className={
            active === tab.key
              ? "text-blue-600 border-b-2 border-blue-600 pb-2"
              : "text-gray-600 hover:text-blue-600"
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MapPin, CheckCircle } from "lucide-react"
import CompanyTabs from "@/components/company/CompanyTabs"

type Person = {
  id: number
  username: string
  fullName?: string
  headline?: string
  location?: string
  avatarUrl?: string
  role?: string
  relation: "team" | "follower"
}

type Company = {
  id: number
  name: string
  slug: string
  tagline?: string
  logoUrl?: string
  isVerified: boolean
}

function profileHref(person: Person) {
  if (person.role === "candidate") return `/candidate/${person.username}`
  if (person.role === "recruiter") return `/recruiter/${person.username}`
  return `/candidate/${person.username}`
}

function PersonCard({ person }: { person: Person }) {
  return (
    <Link
      href={profileHref(person)}
      className="flex items-center gap-4 border rounded-lg p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="relative w-14 h-14 flex-shrink-0">
        <Image
          src={
            person.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(person.fullName || person.username)}`
          }
          alt={person.fullName || person.username}
          fill
          className="rounded-full object-cover"
          sizes="56px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">
          {person.fullName || person.username}
        </p>
        {person.headline && (
          <p className="text-sm text-gray-600 truncate">{person.headline}</p>
        )}
        {person.location && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={12} />
            {person.location}
          </p>
        )}
        {person.relation === "follower" && (
          <span className="inline-block mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Follower
          </span>
        )}
      </div>
    </Link>
  )
}

export default function CompanyPeoplePage() {
  const { slug } = useParams<{ slug: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [companyRes, peopleRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/${slug}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/${slug}/people`),
        ])

        if (companyRes.ok) setCompany(await companyRes.json())
        if (peopleRes.ok) {
          const data = await peopleRes.json()
          setPeople(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) load()
  }, [slug])

  if (loading) return <div className="p-10">Loading…</div>
  if (!company) return <div className="p-10 text-center">Company not found</div>

  const team = people.filter((p) => p.relation === "team")
  const followers = people.filter((p) => p.relation === "follower")

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-[1128px] mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={company.logoUrl || "https://ui-avatars.com/api/?name=Company"}
              alt={company.name}
              fill
              className="rounded-lg bg-white border object-contain"
              sizes="64px"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {company.name}
              {company.isVerified && (
                <CheckCircle size={16} className="text-blue-600" />
              )}
            </h1>
            {company.tagline && (
              <p className="text-sm text-gray-500">{company.tagline}</p>
            )}
          </div>
        </div>

        <CompanyTabs slug={company.slug} active="people" />

        <div className="bg-white rounded-lg p-6 shadow-sm space-y-8">
          {people.length === 0 ? (
            <p className="text-sm text-gray-500">
              No people yet. Follow this company to appear here.
            </p>
          ) : (
            <>
              {team.length > 0 && (
                <section>
                  <h2 className="font-semibold mb-4">Team ({team.length})</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {team.map((person) => (
                      <PersonCard key={person.id} person={person} />
                    ))}
                  </div>
                </section>
              )}

              {followers.length > 0 && (
                <section>
                  <h2 className="font-semibold mb-4">
                    Followers ({followers.length})
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {followers.map((person) => (
                      <PersonCard key={person.id} person={person} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

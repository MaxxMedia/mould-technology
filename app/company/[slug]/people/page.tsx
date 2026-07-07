"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MapPin, CheckCircle } from "lucide-react"
import CompanyTabs from "@/components/company/CompanyTabs"
import CompanyHeader from "@/components/company/CompanyHeader"

type Person = {
  id: number
  username: string
  fullName?: string
  headline?: string
  location?: string
  avatarUrl?: string
  role?: string
  relation: "team" | "follower"
  followingSince?: string
}

type Company = {
  id: number
  name: string
  slug: string
  tagline?: string
  logoUrl?: string
  isVerified: boolean
  followers: number
}

function profileHref(person: Person) {
  if (person.role === "candidate") return `/candidate/${person.username}`
  if (person.role === "recruiter") return `/recruiter/${person.username}`
  return `/candidate/${person.username}`
}

function FollowerCard({ person }: { person: Person }) {
  return (
    <div className="flex items-center justify-between border rounded-xl p-5 hover:bg-gray-50">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <Image
            src={
              person.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                person.fullName || person.username
              )}`
            }
            alt={person.fullName || person.username}
            fill
            className="rounded-full object-cover"
          />
        </div>

        <div>
          <h3 className="font-semibold text-lg">
            {person.fullName || person.username}
          </h3>

          <p className="text-gray-700">
            {person.headline}
          </p>

          <p className="text-sm text-gray-500 mt-1">
           {person.location}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {person.followingSince && (
          <div className="text-sm text-gray-500">
            <p>Following since</p>
            <p>
              {new Date(person.followingSince).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        )}

        <Link
          href={profileHref(person)}
          className="border border-blue-600 text-blue-600 rounded-lg px-5 py-2 font-medium hover:bg-blue-50"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}

export default function CompanyPeoplePage() {
  const { slug } = useParams<{ slug: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [showAllFollowers, setShowAllFollowers] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [companyRes, peopleRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/${slug}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/${slug}/people`),
        ])

        if (companyRes.ok) {
          const data = await companyRes.json()
          setCompany(data)

          // Check if user is following this company
          const token = localStorage.getItem("token")
          if (token && data.id) {
            const followStatusRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${data.id}/follow-status`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (followStatusRes.ok) {
              const statusData = await followStatusRes.json();
              setFollowing(statusData.isFollowing);
            }
          }
        }
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

  async function toggleFollow() {
    if (!company) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login required");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${company.id}/follow`,
        {
          method: following ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setFollowing(!following);
        setCompany((prev) =>
          prev
            ? {
                ...prev,
                followers: following ? prev.followers - 1 : prev.followers + 1,
              }
            : prev
        );
      } else if (response.status === 409) {
        setFollowing(true);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Action failed");
      }
    } catch (error) {
      console.error("Follow toggle error:", error);
      alert("An error occurred");
    }
  }

  if (loading) return <div className="p-10">Loading…</div>
  if (!company) return <div className="p-10 text-center">Company not found</div>

  const followers = people.filter(
    (p) => p.relation === "follower"
  )

  const displayedFollowers = showAllFollowers
    ? followers
    : followers.slice(0, 5)

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-[1128px] mx-auto px-4 py-6 space-y-6">
        <CompanyHeader 
          company={company}
          isFollowing={following}
          onFollow={toggleFollow}
        />

        <CompanyTabs slug={company.slug} active="people" />

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold">People</h2>
            <p className="text-gray-500 mt-1">
              People who follow {company.name}
            </p>
            <p className="font-semibold mt-3">
              Followers ({followers.length})
            </p>
          </div>

          <div className="space-y-4">
            {displayedFollowers.length > 0 ? (
              displayedFollowers.map((person) => (
                <FollowerCard key={person.id} person={person} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No followers yet
              </p>
            )}
          </div>

          {followers.length > 5 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAllFollowers(!showAllFollowers)}
                className="text-blue-600 font-medium hover:underline"
              >
                {showAllFollowers
                  ? "Show less"
                  : `Show all ${followers.length} followers →`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
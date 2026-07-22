"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import JobFeed from "@/components/job/JobFeed";
import LocationAutocomplete from "@/components/job/Locationautocomplete";
import Link from "next/link";
import Banner from "@/components/Banners/Banner";

export default function PublicFeedPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const [filters, setFilters] = useState({
    type: "",
    category: "",
    remote: false,
    location: "",
  });

  const handleFilterChange = (
    field: string,
    value: string | boolean
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    (document.activeElement as HTMLElement | null)?.blur();
    document
      .getElementById("job-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoadingRole(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload.role?.toLowerCase() || null);
    } catch (err) {
      console.error(err);
      setRole(null);
    } finally {
      setLoadingRole(false);
    }
  }, []);

  /* ---------------- HERO CONTENT ---------------- */

  const heroContent = {
    guest: {
      badge: "Manufacturing • Engineering • Technology",
      title1: "Manufacturing Careers",
      title2: "& Hiring Made Easy",
      description:
        "Connect skilled professionals with leading manufacturing companies. Explore exciting career opportunities or recruit top talent—all in one platform.",
    },

    candidate: {
      badge: "Find Your Dream Job",
      title1: "Find Your Next",
      title2: "Manufacturing Career",
      description:
        "Explore manufacturing, engineering, automation, CNC machining and industrial technology opportunities from trusted employers worldwide.",
    },

    recruiter: {
      badge: "Recruit Top Talent",
      title1: "Hire the Best",
      title2: "Manufacturing Talent",
      description:
        "Reach qualified engineers, CNC operators, maintenance technicians and production specialists to grow your workforce faster.",
    },
  };

  const hero =
    role === "candidate"
      ? heroContent.candidate
      : role === "recruiter"
      ? heroContent.recruiter
      : heroContent.guest;

  return (
    <div className="bg-[#f4f6f8] min-h-screen relative">

      {/* ================= HERO ================= */}

      <section className="relative bg-[#0F5B78] overflow-hidden">

        <div className="absolute inset-0">
          <Image
            src="/images/hirings.png"
            alt="Tooling Trends Hiring Platform"
            fill
            priority
            className="object-cover opacity-55"
            sizes="100vw"
          />
        </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#08384B]/92 via-[#0F5B78]/75 to-[#0F5B78]/45"></div>
<div className="relative max-w-[1200px] mx-auto px-6 py-14 md:py-16">
          {!loadingRole && (

            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 rounded-full bg-[#BE1622] px-3 py-1.5 shadow-md">                  <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>

                  <span className="text-xs md:text-sm font-semibold tracking-wide uppercase text-white">                    {hero.badge}
                  </span>
                </div>

                <h1 className="mt-7 text-5xl md:text-6xl font-extrabold leading-tight text-white">

                  {hero.title1}

                  <span className="block text-red-400">
                    {hero.title2}
                  </span>

                </h1>

                <p className="mt-4 text-base md:text-lg leading-7 text-gray-200 max-w-xl">                  {hero.description}
                </p>

              </div>

              <div className="flex flex-col sm:flex-row gap-4">

                {(!role || role === "candidate") && (

                  <Link
                    href={
                      role === "candidate"
                        ? "/jobs"
                        : "/signup?role=candidate"
                    }
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-emerald-700 transition-all"                  >
                    Apply for Jobs
                  </Link>

                )}

                {(!role || role === "recruiter") && (

                  <Link
                    href={
                      role === "recruiter"
                        ? "/recruiter/jobs/new"
                        : "/signup?role=recruiter"
                    }
                      className="inline-flex items-center justify-center rounded-lg border border-white/30 backdrop-blur-md px-6 py-3 text-white font-semibold bg-[#BE1622] hover:border-[#BE1622] transition-all"                  >
                    Post a Job
                  </Link>

                )}

              </div>

            </div>

          )}

        </div>

      </section>

            {/* ================= FILTER BAR ================= */}
      <section className="max-w-[1200px] mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-end gap-5">

            {/* Type */}
            <div className="w-full md:w-[150px]">
              <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5B78]"
              >
                <option value="">Any</option>
                <option value="full-time">Full Time</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Category */}
            <div className="w-full md:w-[170px]">
              <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  handleFilterChange("category", e.target.value)
                }
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5B78]"
              >
                <option value="">Any</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="engineering">Engineering</option>
                <option value="technology">Technology</option>
                <option value="design">Design</option>
              </select>
            </div>

            {/* Remote */}
            <div className="w-full md:w-auto">
              <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-1">
                Remote?
              </label>

              <label className="flex items-center gap-2 h-[38px] text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.remote}
                  onChange={(e) =>
                    handleFilterChange("remote", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-300 text-[#0F5B78] focus:ring-[#0F5B78]"
                />
                Yes
              </label>
            </div>

            {/* Location */}
            <div className="w-full md:flex-1">
              <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-1">
                Location
              </label>

              <LocationAutocomplete
                value={filters.location}
                onChange={(val) => handleFilterChange("location", val)}
              />
            </div>

            {/* Search */}
            <div className="w-full md:w-auto">
              <button
                onClick={handleSearch}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#0F5B78] hover:bg-[#0B4A62] text-white text-sm font-semibold px-7 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                  />
                </svg>

                Search
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ================= JOB LIST ================= */}
      <section
        id="job-results"
        className="max-w-[1200px] mx-auto px-4 py-14"
      >
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-900">
            Explore Manufacturing Jobs
          </h2>

          <p className="mt-3 text-lg text-gray-600 max-w-2xl">
            Browse the latest manufacturing, engineering, tooling,
            automation, and industrial technology opportunities from
            employers around the world.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* Job Feed */}
          <div>
            <JobFeed isPublic filters={filters} />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Banner placement="JOB_RIGHT" />
            </div>
          </aside>

        </div>
      </section>

    </div>
  );
}
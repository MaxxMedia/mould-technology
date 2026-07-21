import { NextResponse } from "next/server"

function getPlanFromEligibility(eligibility: any) {
  return String(eligibility?.plan ?? eligibility?.job?.plan ?? "").toLowerCase()
}

function getFeaturedJobRules(plan: string) {
  if (plan === "professional") {
    return { canFeature: true, durationDays: 10 }
  }

  if (plan === "enterprise") {
    return { canFeature: true, durationDays: 30 }
  }

  return { canFeature: false, durationDays: null }
}

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization")

    if (!authorization) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const isFeaturedJob = !!body.featuredJob

    const eligibilityRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/recruiter/posting-eligibility`,
      {
        headers: {
          Authorization: authorization,
        },
        cache: "no-store",
      }
    )

    if (!eligibilityRes.ok) {
      return NextResponse.json(
        { error: "Failed to verify job posting eligibility" },
        { status: 500 }
      )
    }

    const eligibility = await eligibilityRes.json()
    const plan = getPlanFromEligibility(eligibility)
    const featuredJobRules = getFeaturedJobRules(plan)

    if (isFeaturedJob && !featuredJobRules.canFeature) {
      return NextResponse.json(
        {
          error:
            "Featured Job is available only on Professional and Enterprise plans.",
        },
        { status: 403 }
      )
    }

    const payload = {
      ...body,
      featuredJob: isFeaturedJob && featuredJobRules.canFeature,
      featuredJobDurationDays: isFeaturedJob
        ? featuredJobRules.durationDays
        : null,
    }

    const upstreamRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/jobs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await upstreamRes.json()
    return NextResponse.json(data, { status: upstreamRes.status })
  } catch (error) {
    console.error("Jobs API guard failed:", error)
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    )
  }
}

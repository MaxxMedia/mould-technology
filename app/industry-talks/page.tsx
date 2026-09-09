import IndustryTalkListing from "@/components/IndustryTalkListing"

export const dynamic = "force-dynamic"

export default async function IndustryTalksPage() {
  let talks: any[] = []

  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

    let res = await fetch(
      `${baseUrl}/api/industry-talks?limit=100`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      res = await fetch(
        `${baseUrl}/api/industry-talks`,
        { cache: "no-store" }
      )
    }

    if (res.ok) {
      const response = await res.json()
      talks = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.items)
            ? response.items
            : Array.isArray(response?.posts)
              ? response.posts
              : []
    }
  } catch (error) {
    console.error("Error fetching industry talks:", error)
  }

  // Filter only published industry talks
  const publishedTalks = talks.filter(
    (talk: any) => !talk.status || talk.status.toUpperCase() === "PUBLISHED"
  )

  // Map the data to include industryName for easier access
  const posts = publishedTalks.map((talk: any) => ({
    ...talk,
    industryName: talk.industry?.name || null,
  }))

  return (
    <main className="bg-white">
      <IndustryTalkListing post={posts} />
    </main>
  )
}
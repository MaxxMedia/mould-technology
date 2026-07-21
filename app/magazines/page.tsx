// import MagazineGrid from "@/components/magazine/MagazineGrid"

// export default function MagazinesPage() {
//   return (
//     <div className="max-w-6xl mx-auto py-12 px-6">
//       <MagazineGrid />
//     </div>
//   )
// }


import MagazineWithCoverStory from "@/components/magazine/MagazineWithCoverStory"
import MagazineArchive from "@/components/magazine/MagazineArchive"
import InThisIssue from "@/components/magazine/InThisIssue"
import type { Post } from "@/types/Post"

export default async function MagazinesPage() {

  /* FETCH ISSUE POSTS DIRECTLY */
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?category=in-this-issue&limit=100`,
    { cache: "no-store" }
  )

  const data = await res.json()
  const postsSource: Post[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : []
  const posts = postsSource.sort((a: Post, b: Post) => {
    const aTime = new Date(a.createdAt || 0).getTime()
    const bTime = new Date(b.createdAt || 0).getTime()
    return bTime - aTime
  })

  return (
    <>
      {/* Top Section */}
      <MagazineWithCoverStory />

      {/* In This Issue Section */}
      <InThisIssue posts={posts} />

      {/* Archive Section */}
      <MagazineArchive />
    </>

  )
}


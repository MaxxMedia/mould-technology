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

  /* FETCH POSTS */
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`,
    { cache: "no-store" }
  )

  const data = await res.json()
  const posts: Post[] = data.data || data

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


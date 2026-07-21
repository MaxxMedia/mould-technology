// // import Header from "../components/Header"
// // import AdBanner from "../components/AdBanner"
// // import PassionOnWheels from "../components/PassionOnWheels"
// // import LatestHero from "../components/LatestHero"
// // import TrendingAd from "../components/TrendingAd"
// // import ShopTalkAd from "../components/ShopTalkAd"
// // import ManufacturingConnected from "../components/ManufacturingConnected"
// // import BasicsSection from "../components/BasicsSection"
// // import VideosSection from "../components/VideosSection"
// // import NewsProductsSection from "../components/NewsProductsSection"
// // import LatestIssues from "../components/LatestIssues"
// // import Footer from "../components/Footer"

// // import type { Post } from "../types/Post"
// // import TrendingSection from "@/components/TrendingSection"
// // import CompanyArticles from "@/components/company/CompanyArticles"

// // export default async function Home() {
// // // quick fix: ask for many posts
// // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`, {
// //   cache: "no-store",
// // })
// //   const data = await res.json()
// //   const posts: Post[] = data.data || data

// //   if (!Array.isArray(posts) || posts.length === 0) {
// //     return <div className="text-center p-10">No posts available</div>
// //   }

// //   // ✅ Safely get category slug
// //   const getCategorySlug = (post: Post) =>
// //     typeof post.category === "object"
// //       ? post.category?.slug?.toLowerCase()
// //       : String(post.category || "").toLowerCase()

// //   // ✅ Group posts by category
// //   const latestPosts = posts.filter((p) => getCategorySlug(p) === "latest")
// //   const newsPosts = posts.filter((p) => getCategorySlug(p) === "news")
// //   const videoPosts = posts.filter((p) => getCategorySlug(p) === "videos")
// //   const basicsPosts = posts.filter((p) => getCategorySlug(p) === "basics")
// //   const manufacturingPosts = posts.filter((p) => getCategorySlug(p) === "manufacturing")
// //   const productPosts = posts.filter((p) => getCategorySlug(p) === "products")

// //   // ✅ Featured posts
// //   const latestPost = latestPosts[0]
// //   const passionPost = posts.find((p) => p.slug !== latestPost?.slug)

// //   return (
// //     <>
     
// //       {/* <Header /> */}
// //        {/* <AdBanner /> */}
// //         {/* 📖 Latest Issue1 */}

// //         <CompanyArticles posts={posts} />
// //       {/* <LatestIssues /> */}

// //       {/* 📰 Latest Category Hero */}
// //      {latestPost && <LatestHero post={latestPost} posts={posts} />}
// //        <TrendingAd />

// //       {/* 🚗 Passion / Featured Story */}
// //       {/* {passionPost && <PassionOnWheels post={passionPost} />} */}

// //       <TrendingSection />

     

    

// //       {/* 📘 Basics */}
// //       <BasicsSection  />

// //       {/* <ShopTalkAd /> */}
// //       <TrendingAd />

// //       {/* 🎥 Videos */}
// //       <VideosSection />

// //         {/* 🏭 Manufacturing Section */}
// //       <ManufacturingConnected posts={manufacturingPosts.slice(0, 4)} />

// //       <TrendingAd />

     

// //       {/* 📰 News & Products 2*/}
// //       {/* <NewsProductsSection
// //         newsPosts={newsPosts.slice(0, 6)}
// //         productPosts={productPosts.slice(0, 6)}
// //       /> */}

// //       {/* <Footer /> */}
// //     </>
// //   )
// // }


// import Header from "../components/Header"
// import AdBanner from "../components/AdBanner"
// import PassionOnWheels from "../components/PassionOnWheels"
// import LatestHero from "../components/LatestHero"
// import TrendingAd from "../components/TrendingAd"
// import ShopTalkAd from "../components/ShopTalkAd"
// import ManufacturingConnected from "../components/ManufacturingConnected"
// import BasicsSection from "../components/BasicsSection"
// import VideosSection from "../components/VideosSection"
// import NewsProductsSection from "../components/NewsProductsSection"
// import LatestIssues from "../components/LatestIssues"
// import Footer from "../components/Footer"

// import type { Post } from "../types/Post"
// import TrendingSection from "@/components/TrendingSection"
// import CompanyArticles from "@/components/company/CompanyArticles"

// export default async function Home() {

//   /* ================= FETCH POSTS ================= */

//   const postsRes = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`,
//     { cache: "no-store" }
//   )

//   const postsData = await postsRes.json()
//   const posts: Post[] = postsData.data || postsData

//   if (!Array.isArray(posts) || posts.length === 0) {
//     return <div className="text-center p-10">No posts available</div>
//   }

//   /* ================= FETCH BANNER ================= */

//   const bannerRes = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/api/banners?placement=HOME_MIDDLE`,
//     { cache: "no-store" }
//   )

//   const bannerData = await bannerRes.json()

//   const banner =
//     Array.isArray(bannerData) && bannerData.length > 0
//       ? bannerData[0]
//       : null

//   /* ================= CATEGORY HELPER ================= */

//   const getCategorySlug = (post: Post) =>
//     typeof post.category === "object"
//       ? post.category?.slug?.toLowerCase()
//       : String(post.category || "").toLowerCase()

//   /* ================= GROUP POSTS ================= */

//   const latestPosts = posts.filter(
//     (p) => getCategorySlug(p) === "latest"
//   )

//   const manufacturingPosts = posts.filter(
//     (p) => getCategorySlug(p) === "manufacturing"
//   )

//   /* ================= FEATURED ================= */

//   const latestPost = latestPosts[0]

//   return (
//     <>
//       {/* <Header /> */}
//       {/* <AdBanner /> */}
//       {/* <LatestIssues /> */}

//       {/* 🏢 Company Articles */}
//       <CompanyArticles  />

//       {/* 📰 Latest Hero */}
//       {latestPost && (
//         <LatestHero post={latestPost} posts={posts} />
//       )}

//       {/* 🔥 Ad */}
//       <TrendingAd banner={banner} />

//       {/* 📈 Trending */}
//       <TrendingSection posts={posts} />

//       {/* 📘 Basics */}
//       <BasicsSection posts={posts} />

//       {/* 🔥 Ad */}
//       <TrendingAd banner={banner} />

//       {/* 🎥 Videos */}
//       <VideosSection posts={posts} />

//       {/* 🏭 Manufacturing */}
//       <ManufacturingConnected
//         posts={manufacturingPosts.slice(0, 4)}
//       />

//       {/* 🔥 Ad */}
//       <TrendingAd banner={banner} />

//       {/* <Footer /> */}
//     </>
//   )
// }


import Header from "../components/Header"
import AdBanner from "../components/AdBanner"
import PassionOnWheels from "../components/PassionOnWheels"
import LatestHero from "../components/LatestHero"
import TrendingAd from "../components/TrendingAd"
import ShopTalkAd from "../components/ShopTalkAd"
import ManufacturingConnected from "../components/ManufacturingConnected"
import BasicsSection from "../components/BasicsSection"
import VideosSection from "../components/VideosSection"
import NewsProductsSection from "../components/NewsProductsSection"
import LatestIssues from "../components/LatestIssues"
import Footer from "../components/Footer"

import type { Post } from "../types/Post"
import TrendingSection from "@/components/TrendingSection"
import CompanyArticles from "@/components/company/CompanyArticles"
import HomeCompanyArticles from "@/components/HomeCompanyArticles"
import Banner from "@/components/Banners/Banner";


export default async function Home() {
  /* ================= FETCH POSTS ================= */

  const postsRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?limit=50`,
    { cache: "no-store" }
  );

  const text = await postsRes.text();

  console.log("Posts API:", text);

  if (!text) {
    throw new Error("Posts API returned empty response");
  }

  const postsData = JSON.parse(text);

  // const postsData = await postsRes.json()
  const posts: Post[] = postsData.data || postsData

  if (!Array.isArray(posts) || posts.length === 0) {
    return <div className="text-center p-10">No posts available</div>
  }

  // Log categories of all posts
  posts.forEach((post, index) => {
    console.log(`Post ${index + 1}:`, {
      title: post.title,
      category: post.category,
      categoryType: typeof post.category,
      slug: post.slug
    });
  });

//   /* ================= FETCH BANNER ================= */

//   const bannerRes = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/api/banners?placement=HOME_MIDDLE`,
//     { cache: "no-store" }
//   )

//  const bannerText = await bannerRes.text()

// console.log("Banner Response:", bannerText)

// let bannerData = null

// try {
//   bannerData = JSON.parse(bannerText)
// } catch (err) {
//   console.error("Invalid JSON:", bannerText)
// }

//   const banner =
//     Array.isArray(bannerData) && bannerData.length > 0
//       ? bannerData[0]
//       : null

  /* ================= CATEGORY HELPER ================= */

  const getCategorySlug = (post: Post) =>
    typeof post.category === "object"
      ? post.category?.slug?.toLowerCase()
      : String(post.category || "").toLowerCase()

  /* ================= GROUP POSTS ================= */

  const latestPosts = posts.filter(
    (p) => getCategorySlug(p) === "latest"
  )

  const manufacturingPosts = posts.filter(
    (p) => getCategorySlug(p) === "manufacturing"
  )

  /* ================= FEATURED ================= */

  const latestPost = latestPosts[0]

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      {/* ================= HOME TOP BANNER ================= */}
      <Banner placement="HOME_TOP" />

      {/* 🏢 Company Articles */}
      <CompanyArticles />

      {/* 📰 Latest Hero */}
      {latestPost && <LatestHero post={latestPost} posts={posts} />}

      {/* 📈 Trending */}
      <TrendingSection posts={posts} />

      {/* 📘 Basics */}
      <BasicsSection posts={posts} />

      {/* ================= HOME MIDDLE BANNER ================= */}
      <Banner placement="HOME_MIDDLE" />

      {/* 🎥 Videos */}
      <VideosSection posts={posts} />

      {/* 🏭 Manufacturing (currently disabled) */}
      {/* <ManufacturingConnected posts={manufacturingPosts.slice(0, 4)} /> */}

      <HomeCompanyArticles posts={posts} />

      {/* ================= HOME BOTTOM BANNER ================= */}
      <Banner placement="HOME_BOTTOM" />
    </div>
  )
}
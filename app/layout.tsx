// import type { Metadata } from "next"
// import { Inter_Tight } from "next/font/google"
// import { Analytics } from "@vercel/analytics/next"
// import "remixicon/fonts/remixicon.css"

// import "./globals.css"
// import Footer from "@/components/Footer"
// import Header from "@/components/Header"
// import CTASection from "@/components/CTASection"
// import CursorBall from "@/components/ui/CursorBall"

// const interTight = Inter_Tight({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
//   variable: "--font-inter-tight",
//   display: "swap",
// })

// export const metadata: Metadata = {
//   title: "Tooling Trends - Industrial & Manufacturing Technology News",
//   description: "Industrial & Manufacturing Technology News",
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en" className={interTight.variable}>
//       <body className="antialiased">

//           {/* GLOBAL CURSOR */}
//              {/* <CursorBall /> */}
//         {/* FIXED HEADER */}
//         <Header />

//         {/* ✅ OFFSET FOR FIXED HEADER  default-90*/}
//         <main className="pt-[120px] pb-24">
//           {children}
//         </main>

//         {/* <CTASection /> */}

//         <Analytics />
//         <Footer />
//       </body>
//     </html>
//   )
// }


import type { Metadata } from "next"
import { Inter_Tight } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "remixicon/fonts/remixicon.css"

import "./globals.css"
import Footer from "@/components/Footer"
import Header from "@/components/Header"

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Tooling Trends - Industrial & Manufacturing Technology News",
  description: "Industrial & Manufacturing Technology News",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={interTight.variable}>
      <body className="antialiased">
        <Header />

        <main className="pt-[120px] pb-24">
          {children}
        </main>

        <Analytics />
        <Footer />
      </body>
    </html>
  )
}

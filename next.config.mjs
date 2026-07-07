


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       { protocol: "https", hostname: "images.unsplash.com" },
//       { protocol: "https", hostname: "source.unsplash.com" },
//       { protocol: "https", hostname: "upload.wikimedia.org" },
//       { protocol: "https", hostname: "placehold.co" },
//       { protocol: "https", hostname: "randomuser.me" },
//       { protocol: "https", hostname: "res.cloudinary.com" },
//       { protocol: "https", hostname: "i.pravatar.cc" },

//       // ✅ ADD THIS
//       { protocol: "https", hostname: "ui-avatars.com" },

//       { protocol: "http", hostname: "localhost", port: "5000" },
//     ],
//   },
// }

// export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [70, 75], // ✅ allow quality 70

    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "http", hostname: "localhost", port: "5000" },
      { protocol: "https", hostname: "example.com" },
    ],
  },
  serverExternalPackages: ["country-state-city"],
  async redirects() {
    return [
      {
        source: "/recruiter/directories/new",
        destination: "/recruiter/directory/new",
        permanent: true,
      },
      {
        source: "/recruiter/directories/:id/edit",
        destination: "/recruiter/directory/:id/edit",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
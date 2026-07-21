import Link from "next/link";
import { useState } from "react";


export default function StandOut() {
   const [showForm, setShowForm] = useState(false);
  return (
    <section
      className="relative h-[300px] overflow-hidden"
      style={{
        backgroundImage: "url('/standout-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative max-w-[1320px] mx-auto h-full flex items-center justify-between px-16">
        {/* Left */}
        <div className="max-w-[760px]">
          <h2
            className="mb-4 text-[#0DCAF0]"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "56px",
              fontWeight: 400,
              lineHeight: "1",
            }}
          >
            Stand Out
          </h2>

          <p
            className="text-white"
            style={{
              fontFamily: "Roboto, sans-serif",
              fontSize: "20px",
              lineHeight: "30px",
              fontWeight: 400,
            }}
          >
            Enhance your listing with your company logo, profile,
            social networks and unlimited product categories.
          </p>
        </div>

        {/* Right */}
        <Link href="/paid-packages">
          <button className="bg-[#D71920] hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold whitespace-nowrap transition">
            Find Out How
          </button>
        </Link>
      </div>
      {/* {showForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl bg-white">

      <button
        onClick={() => setShowForm(false)}
        className="absolute right-5 top-5 text-3xl font-bold text-gray-500 hover:text-black"
      >
        ×
      </button>

      <SupplierListingForm />

    </div>
  </div>
)} */}
    </section>
  );
}
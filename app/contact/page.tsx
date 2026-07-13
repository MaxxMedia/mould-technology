"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { sendContactMessage, ContactFormData } from "@/lib/api/contact";

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    website: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await sendContactMessage(formData);
      
      if (response.success) {
        setSuccessMessage("Thank you! Your message has been sent successfully.");
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          website: "",
          message: "",
        });
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message. Please try again."
      );
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full bg-white">
      {/* ================= HERO / BREADCRUMB ================= */}
      <section className="relative bg-[#f8f9fb] py-24 text-center">
        <h1 className="text-4xl font-semibold text-[#121213]">Contact</h1>
        <div className="mt-2 text-sm text-[#616C74]">
          <Link href="/" className="hover:text-blue-600">
            Tooling Trends
          </Link>
          <span className="mx-2">→</span>
          <span className="text-blue-600">Contact</span>
        </div>
      </section>

      {/* ================= LOCATIONS ================= */}
      <section className="py-24">
        <div className="max-w-[1320px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[
              {
                title: "California",
                img: "/images/newyork.png",
                address: "Madison Avenue, New York",
                phone: "+990 123 456 789",
              },
              {
                title: "New York City",
                img: "/images/newyork.png",
                address: "Washington Ave, Manchester, Kentucky",
                phone: "+89 (308) 555-0121",
              },
              {
                title: "New Hampshire",
                img: "/images/newyork.png",
                address: "Parker Rd. Allentown, New Mexico",
                phone: "(907) 555-0101",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl shadow-sm p-8 text-center"
              >
                <div className="relative w-full h-[220px] rounded-full overflow-hidden mx-auto mb-6">
                  <Image
                    src={item.img}
                    alt={`${item.title} office`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <h3 className="text-xl font-semibold text-[#121213]">
                  {item.title}
                </h3>

                <div className="w-10 h-[2px] bg-blue-600 mx-auto my-4" />

                <p className="text-sm text-[#616C74] leading-relaxed">
                  {item.address}
                </p>
                <p className="text-sm text-[#616C74] mt-1">
                  {item.phone}
                </p>
                <p className="text-sm text-[#616C74] mt-1">
                  toolingtrends@gmail.com
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT FORM ================= */}
      <section className="pb-32">
        <div className="max-w-[1320px] mx-auto px-6">
          <div className="bg-white rounded-[28px] border border-blue-500/20 p-10 md:p-14 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* FORM */}
            <div>
              <h2 className="text-3xl font-semibold text-[#121213] mb-8">
                Feel Free to Contact Us
              </h2>

              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-[#121213]">Full Name*</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Robot fox"
                    className="mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-[#121213]">Email Address*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="info@toolingtrends.com"
                    className="mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-[#121213]">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="(480) 555-0103"
                    className="mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-sm text-[#121213]">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="www.toolingtrends.com"
                    className="mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-[#121213]">Message*</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Type here..."
                    className="mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Message →"}
                  </button>
                </div>
              </form>
            </div>

            {/* IMAGE */}
            <div className="relative w-full h-[520px] rounded-2xl overflow-hidden">
              <Image
                src="/images/contact.png"
                alt="Customer support representative"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
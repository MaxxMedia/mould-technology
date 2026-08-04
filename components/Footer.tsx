import Link from "next/link"
import Image from "next/image"
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Mail,
  Phone,
} from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#e7eaec] text-black">
      {/* ================= FOOTER TOP ================= */}
      <div className="relative z-10 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12 lg:pb-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Mobile: Stacked Layout */}
          <div className="lg:hidden space-y-8 sm:space-y-10">
            
            {/* BRAND - Mobile */}
            <div className="text-center sm:text-left">
              <Link href="/" className="inline-block mb-4">
                <Image
                  src="/images/tooling new34 (1).png"
                  alt="Tooling Technology Logo"
                  width={300}
                  height={127}
                  className="h-[54px] sm:h-[65px] lg:h-[75px] w-auto max-w-full object-contain"
                />
              </Link>

              <p className="text-sm leading-relaxed mb-5 max-w-md mx-auto sm:mx-0">
                Tooling Technology addresses the complete life cycle of Toolingmanufacturing and maintenance—providing solutions to professionals charged with designing, building and repairing molds.
              </p>

              {/* Social Icons - Mobile */}
              <div className="flex items-center gap-3 mb-6">
                {[
                  { Icon: Linkedin, href: "#", bg: "bg-[#0A66C2]", hover: "hover:bg-[#084d94]" },
                  { Icon: Facebook, href: "#", bg: "bg-[#1877F2]", hover: "hover:bg-[#145dbf]" },
                  { Icon: Youtube, href: "#", bg: "bg-[#FF0000]", hover: "hover:bg-[#cc0000]" },
                  { Icon: Twitter, href: "#", bg: "bg-black", hover: "hover:bg-gray-800" },
                  { Icon: Instagram, href: "#", bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600", hover: "hover:opacity-90" },
                ].map(({ Icon, href, bg, hover }, i) => (
                  <Link
                    key={i}
                    href={href}
                    className={`w-11 h-11 flex items-center justify-center rounded-md text-white transition-all duration-300 transform hover:scale-110 ${bg} ${hover}`}
                    aria-label={`Social media link ${i + 1}`}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </Link>
                ))}
              </div>

              {/* App Store Buttons - Mobile */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                <Link href="#" className="inline-block">
                  <Image
                    src="/images/google-play.png"
                    alt="Download on Google Play"
                    width={135}
                    height={40}
                    style={{ width: '135px', height: 'auto' }}
                    className="hover:opacity-80 transition"
                  />
                </Link>
                <Link href="#" className="inline-block">
                  <Image
                    src="/images/apple-store.png"
                    alt="Download on App Store"
                    width={135}
                    height={40}
                    style={{ width: '135px', height: 'auto' }}
                    className="hover:opacity-80 transition"
                  />
                </Link>
              </div>
            </div>

            {/* Quick Links Grid - Mobile/Tablet */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
              {/* Topics */}
              <div>
                <h5 className="text-black text-base font-bold mb-4 uppercase tracking-wide">Topics</h5>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/topics/engineer" className="hover:text-black transition-colors">Engineer</Link></li>
                  <li><Link href="/topics/build" className="hover:text-black transition-colors">Build</Link></li>
                  <li><Link href="/topics/maintain" className="hover:text-black transition-colors">Maintain</Link></li>
                  <li><Link href="/topics/manage" className="hover:text-black transition-colors">Manage</Link></li>
                  <li><Link href="/topics" className="hover:text-black transition-colors font-semibold">View All →</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h5 className="text-black text-base font-bold mb-4 uppercase tracking-wide">Resources</h5>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/industry-talks" className="hover:text-black transition-colors">Industry Talks</Link></li>
                  <li><Link href="/videos" className="hover:text-black transition-colors">Videos</Link></li>
                  <li><Link href="/news" className="hover:text-black transition-colors">News Latter</Link></li>
                  <li><Link href="/products" className="hover:text-black transition-colors">Products</Link></li>
                  <li><Link href="/Webinars" className="hover:text-black transition-colors">Webinars</Link></li>
                </ul>
              </div>

              {/* Magazine */}
              <div>
                <h5 className="text-black text-base font-bold mb-4 uppercase tracking-wide">Magazine</h5>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/articles" className="hover:text-black transition-colors">Latest Issue</Link></li>
                  <li><Link href="/" className="hover:text-black transition-colors">Archives</Link></li>
                  <li><Link href="/subscribe" className="hover:text-black transition-colors">Subscribe</Link></li>
                  <li><Link href="/" className="hover:text-black transition-colors">Renew</Link></li>
                </ul>
              </div>

              {/* Calendar */}
              <div>
                <h5 className="text-black text-base font-bold mb-4 uppercase tracking-wide">Calendar</h5>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/webinars" className="hover:text-black transition-colors">Webinars</Link></li>
                  <li><Link href="/events" className="hover:text-black transition-colors">Events</Link></li>
                </ul>
              </div>

              {/* More */}
              <div className="col-span-2 sm:col-span-1">
                <h5 className="text-black text-base font-bold mb-4 uppercase tracking-wide">More</h5>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/packages" className="hover:text-black transition-colors">Packages &amp; Pricing</Link></li>
                  <li><Link href="/contact" className="hover:text-black transition-colors">Contact Us</Link></li>
                  <li><Link href="/suppliers" className="hover:text-black transition-colors">Find a Supplier</Link></li>
                </ul>
              </div>

              {/* Legal & Policies - Mobile */}
              <div className="col-span-2 sm:col-span-1">
                <h5 className="text-black text-base font-bold mb-4 uppercase tracking-wide">Legal &amp; Policies</h5>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/terms" className="hover:text-black transition-colors">Terms &amp; Conditions</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/disclaimer" className="hover:text-black transition-colors">Disclaimer</Link></li>
                  <li><Link href="/cookie-policy" className="hover:text-black transition-colors">Cookie Policy</Link></li>
                  <li><Link href="/advertising-policy" className="hover:text-black transition-colors">Advertising Policy</Link></li>
                  <li><Link href="/dpdp-compliance-notice" className="hover:text-black transition-colors">DPDP Act Compliance Notice</Link></li>
                  <li><Link href="/copyright-ip-policy" className="hover:text-black transition-colors">Copyright &amp; IP Policy</Link></li>
                  <li><Link href="/refund-cancellation-policy" className="hover:text-black transition-colors">Refund &amp; Cancellation Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden lg:grid lg:grid-cols-14 gap-10 xl:gap-12">
            {/* BRAND - Desktop */}
            <div className="lg:col-span-3">
              <Link href="/" className="inline-block mb-6">
                <Image
                  src="/images/tooling new34 (1).png"
                  alt="Tooling Technology Logo"
                  width={300}
                  height={127}
                  className="h-[54px] sm:h-[65px] lg:h-[75px] w-auto max-w-full object-contain"
                />
              </Link>

              <p className="text-sm leading-relaxed mb-6 max-w-sm">
                Tooling Technology addresses the complete life cycle of the manufacture and maintenance of a mold—from design to first shot—by providing solutions and strategies to Toolmaking professionals charged with designing, building and repairing molds.
              </p>

              {/* Social Icons - Desktop */}
              <div className="flex items-center gap-3 mb-6">
                {[
                  { Icon: Linkedin, href: "#", bg: "bg-[#0A66C2]", hover: "hover:bg-[#084d94]" },
                  { Icon: Facebook, href: "#", bg: "bg-[#1877F2]", hover: "hover:bg-[#145dbf]" },
                  { Icon: Youtube, href: "#", bg: "bg-[#FF0000]", hover: "hover:bg-[#cc0000]" },
                  { Icon: Twitter, href: "#", bg: "bg-black", hover: "hover:bg-gray-800" },
                  { Icon: Instagram, href: "#", bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600", hover: "hover:opacity-90" },
                ].map(({ Icon, href, bg, hover }, i) => (
                  <Link
                    key={i}
                    href={href}
                    className={`w-11 h-11 flex items-center justify-center rounded-md text-white transition-all duration-300 transform hover:scale-110 ${bg} ${hover}`}
                    aria-label={`Social media link ${i + 1}`}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </Link>
                ))}
              </div>

              {/* App Store Buttons - Desktop */}
              <div className="flex gap-3">
                <Link href="/coming-soon" className="inline-block">
                  <Image
                    src="/images/google-play.png"
                    alt="Download on Google Play"
                    width={135}
                    height={40}
                    style={{ width: '135px', height: 'auto' }}
                    className="hover:opacity-80 transition"
                  />
                </Link>
                <Link href="/coming-soon" className="inline-block">
                  <Image
                    src="/images/apple-store.png"
                    alt="Download on App Store"
                    width={135}
                    height={40}
                    style={{ width: '135px', height: 'auto' }}
                    className="hover:opacity-80 transition"
                  />
                </Link>
              </div>
            </div>

            {/* TOPICS - Desktop */}
            <div className="lg:col-span-2">
              <h5 className="text-black text-lg font-bold mb-6 uppercase tracking-wide">Topics</h5>
              <ul className="space-y-3 text-sm">
                <li><Link href="/topics/machining" className="hover:text-black hover:translate-x-1 inline-block transition-all">Machining</Link></li>
                <li><Link href="/topics/cutting-tools" className="hover:text-black hover:translate-x-1 inline-block transition-all">Cutting Tools</Link></li>
                <li><Link href="/topics/dies-moulds-tooling" className="hover:text-black hover:translate-x-1 inline-block transition-all">Dies Moulds Tooling</Link></li>
                <li><Link href="/topics/metrology-quality" className="hover:text-black hover:translate-x-1 inline-block transition-all">Metrology & Quality</Link></li>
                <li><Link href="/topics/factory-automation" className="hover:text-black hover:translate-x-1 inline-block transition-all">Factory Automation</Link></li>
                <li><Link href="/topics/cad-cam-cae" className="hover:text-black hover:translate-x-1 inline-block transition-all">CAD/CAM/CAE</Link></li>
                <li><Link href="/topics/manufacturing-technologies" className="hover:text-black hover:translate-x-1 inline-block transition-all">Manufacturing Technologies</Link></li>
                <li><Link href="/topics" className="hover:text-black hover:translate-x-1 inline-block transition-all font-semibold">View All →</Link></li>
              </ul>
            </div>

            {/* RESOURCES - Desktop */}
            <div className="lg:col-span-2">
              <h5 className="text-black text-lg font-bold mb-6 uppercase tracking-wide">Resources</h5>
              <ul className="space-y-3 text-sm">
                <li><Link href="/industry-talks" className="hover:text-black hover:translate-x-1 inline-block transition-all">Industry Talks</Link></li>
                <li><Link href="/videos" className="hover:text-black hover:translate-x-1 inline-block transition-all">Videos</Link></li>
                <li><Link href="/news" className="hover:text-black hover:translate-x-1 inline-block transition-all">News Letter</Link></li>
                <li><Link href="/products" className="hover:text-black hover:translate-x-1 inline-block transition-all">Products</Link></li>
                <li><Link href="/Webinar" className="hover:text-black hover:translate-x-1 inline-block transition-all">Webinars</Link></li>
                <li><Link href="/packages" className="hover:text-black hover:translate-x-1 inline-block transition-all">Packages &amp; Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-black hover:translate-x-1 inline-block transition-all">Contact Us</Link></li>
                <li><Link href="/suppliers" className="hover:text-black hover:translate-x-1 inline-block transition-all">Find a Supplier</Link></li>
              </ul>
            </div>

            {/* MAGAZINE - Desktop */}
            <div className="lg:col-span-2">
              <h5 className="text-black text-lg font-bold mb-6 uppercase tracking-wide">Magazine</h5>
              <ul className="space-y-3 text-sm">
                <li><Link href="/articles" className="hover:text-black hover:translate-x-1 inline-block transition-all">Latest Issue</Link></li>
                <li><Link href="/articles/issues" className="hover:text-black hover:translate-x-1 inline-block transition-all">Archives</Link></li>
                <li><Link href="/subscribe" className="hover:text-black hover:translate-x-1 inline-block transition-all">Subscribe</Link></li>
                {/* <li><Link href="/" className="hover:text-black hover:translate-x-1 inline-block transition-all">Renew Subscription</Link></li> */}
                {/* <li><Link href="/" className="hover:text-black hover:translate-x-1 inline-block transition-all">Customer Service</Link></li> */}
                <li><Link href="/blog" className="hover:text-black hover:translate-x-1 inline-block transition-all">Blogs</Link></li>
              </ul>
            </div>

            {/* LEGAL & POLICIES - Desktop */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <h5 className="text-black text-lg font-bold mb-6 uppercase tracking-wide">Legal &amp; Policies</h5>
              <div className="inline-grid grid-cols-2 gap-x-12 text-sm whitespace-nowrap">
                <ul className="space-y-3">
                  <li><Link href="/terms" className="hover:text-black hover:translate-x-1 inline-block transition-all">Terms &amp; Conditions</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-black hover:translate-x-1 inline-block transition-all">Privacy Policy</Link></li>
                  <li><Link href="/disclaimer" className="hover:text-black hover:translate-x-1 inline-block transition-all">Disclaimer</Link></li>
                  <li><Link href="/cookie-policy" className="hover:text-black hover:translate-x-1 inline-block transition-all">Cookie Policy</Link></li>
                </ul>
                <ul className="space-y-3">
                  <li><Link href="/advertising-policy" className="hover:text-black hover:translate-x-1 inline-block transition-all">Advertising Policy</Link></li>
                  <li><Link href="/dpdp-compliance-notice" className="hover:text-black hover:translate-x-1 inline-block transition-all">DPDP Act Compliance</Link></li>
                  <li><Link href="/copyright-ip-policy" className="hover:text-black hover:translate-x-1 inline-block transition-all">Copyright &amp; IP Policy</Link></li>
                  <li><Link href="/refund-cancellation-policy" className="hover:text-black hover:translate-x-1 inline-block transition-all">Refund &amp; Cancellation</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= COPYRIGHT BAR ================= */}
      <div className="border-t border-white/20 bg-[#2a3d47] backdrop-blur-md text-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <p className="text-center order-1 sm:order-2">
              Copyright © 2026 <span className="font-semibold">Tooling Trends</span>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
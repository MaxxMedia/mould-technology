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
    <footer className="relative overflow-hidden 
bg-[#e7eaec]
text-black">
  


      {/* 🔴 Radial Glow */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(254,3,64,0.12),_transparent_60%)] pointer-events-none"></div> */}

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
                  width={200}
                  height={67}
                  className="w-auto h-14 sm:h-16"
                />
              </Link>

              <p className="text-sm leading-relaxed mb-5 max-w-md mx-auto sm:mx-0">
                Tooling Technology addresses the complete life cycle of Toolingmanufacturing and maintenance—providing solutions to professionals charged with designing, building and repairing molds.
              </p>

              {/* Social Icons - Mobile */}
             <div className="flex items-center gap-3 mb-6">
  {[
    {
      Icon: Linkedin,
      href: "#",
      bg: "bg-[#0A66C2]",
      hover: "hover:bg-[#084d94]",
    },
    {
      Icon: Facebook,
      href: "#",
      bg: "bg-[#1877F2]",
      hover: "hover:bg-[#145dbf]",
    },
    {
      Icon: Youtube,
      href: "#",
      bg: "bg-[#FF0000]",
      hover: "hover:bg-[#cc0000]",
    },
    {
      Icon: Twitter,
      href: "#",
      bg: "bg-black",
      hover: "hover:bg-gray-800",
    },
    {
      Icon: Instagram,
      href: "#",
      bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
      hover: "hover:opacity-90",
    },
  ].map(({ Icon, href, bg, hover }, i) => (
    <Link
      key={i}
      href={href}
      className={`w-10 h-10 flex items-center justify-center rounded-md text-white transition-all duration-300 transform hover:scale-110 ${bg} ${hover}`}
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
                    className="h-10 w-auto hover:opacity-80 transition"
                  />
                </Link>
                <Link href="#" className="inline-block">
                  <Image
                    src="/images/apple-store.png"
                    alt="Download on App Store"
                    width={135}
                    height={40}
                    className="h-10 w-auto hover:opacity-80 transition"
                  />
                </Link>
              </div>
            </div>

            {/* Quick Links Grid - Mobile/Tablet */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Topics */}
              <div>
                <h5 className="text-black text-base font-bold mb-4 uppercase tracking-wide">
                  Topics
                </h5>
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
                <h5 className="text-black text-base font-bold mb-4 uppercase tracking-wide">
                  Resources
                </h5>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/mmtchats" className="hover:text-black transition-colors">Industry Talks</Link></li>
                  <li><Link href="/videos" className="hover:text-black transition-colors">Videos</Link></li>
                  <li><Link href="/news" className="hover:text-black transition-colors">News</Link></li>
                  <li><Link href="/products" className="hover:text-black transition-colors">Products</Link></li>
                  <li><Link href="/podcast" className="hover:text-black transition-colors">Podcast</Link></li>
                </ul>
              </div>

              {/* Magazine */}
              <div>
                <h5 className="text-black text-base font-bold mb-4 uppercase tracking-wide">
                  Magazine
                </h5>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/articles" className="hover:text-black transition-colors">Latest Issue</Link></li>
                  <li><Link href="/" className="hover:text-black transition-colors">Archives</Link></li>
                  <li><Link href="/subscribe" className="hover:text-black transition-colors">Subscribe</Link></li>
                  <li><Link href="/" className="hover:text-black transition-colors">Renew</Link></li>
                </ul>
              </div>

              {/* Calendar */}
              <div>
                <h5 className="text-black text-base font-bold mb-4 uppercase tracking-wide">
                  Calendar
                </h5>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/webinars" className="hover:text-black transition-colors">Webinars</Link></li>
                  <li><Link href="/events" className="hover:text-black transition-colors">Events</Link></li>
                </ul>
              </div>

              {/* More */}
              <div className="col-span-2 sm:col-span-1">
                <h5 className="text-black text-base font-bold mb-4 uppercase tracking-wide">
                  More
                </h5>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/contact" className="hover:text-black transition-colors">Contact Us</Link></li>
                  <li><Link href="/suppliers" className="hover:text-black transition-colors">Find a Supplier</Link></li>
                </ul>
              </div>

            </div>

          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-10 xl:gap-12">

            {/* BRAND - Desktop */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-block mb-6">
                <Image
                  src="/images/tooling new34 (1).png"
                  alt="Tooling Technology Logo"
                  width={240}
                  height={80}
                  className="w-auto h-20"
                />
              </Link>

              <p className="text-sm leading-relaxed mb-6 max-w-sm">
                Tooling Technology addresses the complete life cycle of the manufacture and maintenance of a mold—from design to first shot—by providing solutions and strategies to Toolmaking professionals charged with designing, building and repairing molds.
              </p>

              {/* Social Icons - Desktop */}
            <div className="flex items-center gap-3 mb-6">
  {[
    {
      Icon: Linkedin,
      href: "#",
      bg: "bg-[#0A66C2]",
      hover: "hover:bg-[#084d94]",
    },
    {
      Icon: Facebook,
      href: "#",
      bg: "bg-[#1877F2]",
      hover: "hover:bg-[#145dbf]",
    },
    {
      Icon: Youtube,
      href: "#",
      bg: "bg-[#FF0000]",
      hover: "hover:bg-[#cc0000]",
    },
    {
      Icon: Twitter,
      href: "#",
      bg: "bg-black",
      hover: "hover:bg-gray-800",
    },
    {
      Icon: Instagram,
      href: "#",
      bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
      hover: "hover:opacity-90",
    },
  ].map(({ Icon, href, bg, hover }, i) => (
    <Link
      key={i}
      href={href}
      className={`w-10 h-10 flex items-center justify-center rounded-md text-white transition-all duration-300 transform hover:scale-110 ${bg} ${hover}`}
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
                    className="hover:opacity-80 transition"
                  />
                </Link>
                <Link href="/coming-soon" className="inline-block">
                  <Image
                    src="/images/apple-store.png"
                    alt="Download on App Store"
                    width={135}
                    height={40}
                    className="hover:opacity-80 transition"
                  />
                </Link>
              </div>
            </div>

            {/* TOPICS - Desktop */}
            <div className="lg:col-span-2">
              <h5 className="text-black text-lg font-bold mb-6 uppercase tracking-wide">
                Topics
              </h5>
              <ul className="space-y-3 text-sm">
                <li><Link href="/topics/machining" className="hover:text-black hover:translate-x-1 inline-block transition-all">Machining</Link></li>
                <li><Link href="/topics/cutting-tools" className="hover:text-black hover:translate-x-1 inline-block transition-all">Cutting Tools</Link></li>
                <li><Link href="/topics/surface-engineering" className="hover:text-black hover:translate-x-1 inline-block transition-all">Surface Engineering</Link></li>
                <li><Link href="/topics/smart-manufacturing" className="hover:text-black hover:translate-x-1 inline-block transition-all">Smart Manufacturing</Link></li>
                <li><Link href="/topics/advanced-manufacturing" className="hover:text-black hover:translate-x-1 inline-block transition-all">Advanced Manufacturing</Link></li>
                <li><Link href="/topics/maintenance&operations" className="hover:text-black hover:translate-x-1 inline-block transition-all">Maintenance & Operations</Link></li>
                <li><Link href="/topics" className="hover:text-black hover:translate-x-1 inline-block transition-all font-semibold">View All →</Link></li>
              </ul>
            </div>

            {/* RESOURCES - Desktop */}
            <div className="lg:col-span-2">
              <h5 className="text-black text-lg font-bold mb-6 uppercase tracking-wide">
                Resources
              </h5>
              <ul className="space-y-3 text-sm">
                <li><Link href="/mmtchats" className="hover:text-black hover:translate-x-1 inline-block transition-all">Industry Talks</Link></li>
                <li><Link href="/videos" className="hover:text-black hover:translate-x-1 inline-block transition-all">Videos</Link></li>
                <li><Link href="/news" className="hover:text-black hover:translate-x-1 inline-block transition-all">News</Link></li>
                <li><Link href="/products" className="hover:text-black hover:translate-x-1 inline-block transition-all">Products</Link></li>
                <li><Link href="/podcast" className="hover:text-black hover:translate-x-1 inline-block transition-all">Podcast</Link></li>
              </ul>
            </div>

            {/* MAGAZINE - Desktop */}
            <div className="lg:col-span-2">
              <h5 className="text-black text-lg font-bold mb-6 uppercase tracking-wide">
                Magazine
              </h5>
              <ul className="space-y-3 text-sm">
                <li><Link href="/articles" className="hover:text-black hover:translate-x-1 inline-block transition-all">Latest Issue</Link></li>
                <li><Link href="/" className="hover:text-black hover:translate-x-1 inline-block transition-all">Archives</Link></li>
                <li><Link href="/subscribe" className="hover:text-black hover:translate-x-1 inline-block transition-all">Subscribe</Link></li>
                <li><Link href="/" className="hover:text-black hover:translate-x-1 inline-block transition-all">Renew Subscription</Link></li>
                <li><Link href="/" className="hover:text-black hover:translate-x-1 inline-block transition-all">Customer Service</Link></li>
              </ul>
            </div>

            {/* MORE + CALENDAR - Desktop */}
            <div className="lg:col-span-2">
              <h5 className="text-black text-lg font-bold mb-6 uppercase tracking-wide">
                More
              </h5>
              <ul className="space-y-3 text-sm mb-8">
                <li><Link href="/contact" className="hover:text-black hover:translate-x-1 inline-block transition-all">Contact Us</Link></li>
                <li><Link href="/suppliers" className="hover:text-black hover:translate-x-1 inline-block transition-all">Find a Supplier</Link></li>
              </ul>

              <h5 className="text-black text-lg font-bold mb-6 uppercase tracking-wide">
                Calendar
              </h5>
              <ul className="space-y-3 text-sm">
                {/* <li><Link href="/webinars" className="hover:text-black hover:translate-x-1 inline-block transition-all">Webinars</Link></li> */}
                <li><Link href="/events" className="hover:text-black hover:translate-x-1 inline-block transition-all">Events</Link></li>
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* ================= COPYRIGHT BAR ================= */}
      <div className="border-t border-white/20 bg-[#2a3d47] backdrop-blur-md text-white">


        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm">
            
            <Link 
              href="/terms" 
              className="hover:text-white transition-colors order-2 sm:order-1"
            >
              Terms & Agreements
            </Link>

            <p className="text-center order-1 sm:order-2">
              Copyright © 2026 <span className="font-semibold">Tooling Trends</span>. All rights reserved.
            </p>

            <Link 
              href="/privacy-policy" 
              className="hover:text-white transition-colors order-3"
            >
              Privacy Policy
            </Link>
            
          </div>
        </div>
      </div>
    </footer>
  )
}
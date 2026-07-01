// banner.tsx
import Image from "next/image";
import Link from "next/link";

type BannerProps = {
  placement:
    | "HOME_TOP"
    | "HOME_MIDDLE"
    | "HOME_BOTTOM"
    | "ARTICLE_TOP"
    | "ARTICLE_MIDDLE"
    | "ARTICLE_BOTTOM"
    | "SUPPLIER_TOP"
    | "SUPPLIER_AFTER_VIDEO"
    | "SIDEBAR"
    | "FOOTER";
};

export default async function Banner({ placement }: BannerProps) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/banners?placement=${placement}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();

    const banner = Array.isArray(data)
      ? data[0]
      : Array.isArray(data.data)
      ? data.data[0]
      : null;

    if (!banner) return null;

    // HOME_TOP and ARTICLE_TOP: fixed 728x90 (responsive below 728px)
    if (placement === "HOME_TOP" || placement === "ARTICLE_TOP") {
      return (
        <section className="py-6">
          <div className="w-full flex justify-center px-6">
            <div
              className="relative overflow-hidden w-full"
              style={{ maxWidth: "728px", aspectRatio: "728 / 90" }}
            >
              
              <Link
                href={banner.targetUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  priority
                  sizes="(max-width: 728px) 100vw, 728px"
                  className="object-cover"
                />
              </Link>
            </div>
          </div>
        </section>
      );
    }

    // // SIDEBAR: fixed 300x250, never changes
    // if (placement === "SIDEBAR") {
    //   return (
    //     <section className="py-6">
    //       <div className="flex justify-center">
    //         <Link
    //           href={banner.targetUrl || "#"}
    //           target="_blank"
    //           rel="noopener noreferrer"
    //         >
    //           <div
    //             className="relative overflow-hidden"
    //             style={{ width: "300px", height: "250px" }}
    //           >
    //             <Image
    //               src={banner.imageUrl}
    //               alt={banner.title}
    //               fill
    //               priority
    //               sizes="300px"
    //               className="object-cover"
    //             />
    //           </div>
    //         </Link>
    //       </div>
    //     </section>
    //   );
    // }

    // HOME_MIDDLE, HOME_BOTTOM, ARTICLE_MIDDLE, ARTICLE_BOTTOM: background block
    if (
      placement === "HOME_MIDDLE" ||
      placement === "HOME_BOTTOM" ||
      placement === "ARTICLE_MIDDLE" ||
      placement === "ARTICLE_BOTTOM"
    ) {
      return (
        <section className="py-10 px-6" style={{ backgroundColor: "#F8F9FA" }}>
          <div className="max-w-[970px] w-full mx-auto flex justify-center">
            <Link
              href={banner.targetUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                className="relative overflow-hidden"
                style={{ width: "970px", height: "250px" }}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  priority
                  sizes="970px"
                  className="object-cover"
                />
              </div>
            </Link>
          </div>
        </section>
      );
    }

    // Everything else: 970x250 leaderboard
    return (
      <section className="py-6">
        <div className="max-w-[970px] w-full mx-auto px-6 flex justify-center">
          <Link
            href={banner.targetUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div
              className="relative overflow-hidden"
              style={{ width: "970px", height: "250px" }}
            >
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                priority
                sizes="970px"
                className="object-cover"
              />
            </div>
          </Link>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Banner Error:", error);
    return null;
  }
}
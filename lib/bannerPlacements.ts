export const BANNER_PLACEMENTS = [
  { value: "HOME_TOP", label: "Home – Top" },
  { value: "HOME_MIDDLE", label: "Home – Middle" },
  { value: "HOME_BOTTOM", label: "Home – Bottom" },
  { value: "ARTICLE_TOP", label: "Article – Top" },
  { value: "ARTICLE_MIDDLE", label: "Article – Middle" },
  { value: "ARTICLE_BOTTOM", label: "Article – Bottom" },
  { value: "SUPPLIER_AFTER_VIDEO", label: "Supplier – After Video" },
  { value: "SIDEBAR", label: "Sidebar" },
  { value: "FOOTER", label: "Footer" },
] as const;

export type BannerPlacement =
  (typeof BANNER_PLACEMENTS)[number]["value"];
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
  { value: "EVENT_RIGHT", label: "Event" },
  { value: "SUPPLIER_RIGHT", label: "Supplier" },
  { value: "JOB_RIGHT", label: "Job" },
  { value: "INDUSTRY_TALKS_RIGHT", label: "Industry Talks" },
  { value: "MAGAZINE_RIGHT", label: "Magazine" },
  { value: "Archive", label: "Archive" },

] as const;

export type BannerPlacement =
  (typeof BANNER_PLACEMENTS)[number]["value"];
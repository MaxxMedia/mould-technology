export const BANNER_PLACEMENTS = [
  { value: "HOME_TOP", label: "Home – Top", dimensions: "728 × 90 px", recommended: "1456 × 180 px", aspect: "728:90" },
  { value: "HOME_MIDDLE", label: "Home – Middle", dimensions: "970 × 250 px", recommended: "1940 × 500 px", aspect: "970:250" },
  { value: "HOME_BOTTOM", label: "Home – Bottom", dimensions: "970 × 250 px", recommended: "1940 × 500 px", aspect: "970:250" },
  { value: "ARTICLE_TOP", label: "Article – Top", dimensions: "728 × 90 px", recommended: "1456 × 180 px", aspect: "728:90" },
  { value: "ARTICLE_MIDDLE", label: "Article – Middle", dimensions: "970 × 250 px", recommended: "1940 × 500 px", aspect: "970:250" },
  { value: "ARTICLE_BOTTOM", label: "Article – Bottom", dimensions: "970 × 250 px", recommended: "1940 × 500 px", aspect: "970:250" },
  { value: "SUPPLIER_AFTER_VIDEO", label: "Supplier – After Video", dimensions: "970 × 250 px", recommended: "1940 × 500 px", aspect: "970:250" },
  { value: "SIDEBAR", label: "Sidebar", dimensions: "300 × 250 px", recommended: "600 × 500 px", aspect: "6:5" },
  { value: "FOOTER", label: "Footer", dimensions: "970 × 250 px", recommended: "1940 × 500 px", aspect: "970:250" },
  { value: "EVENT_RIGHT", label: "Event", dimensions: "300 × 250 px", recommended: "600 × 500 px", aspect: "6:5" },
  { value: "SUPPLIER_RIGHT", label: "Supplier", dimensions: "300 × 250 px", recommended: "600 × 500 px", aspect: "6:5" },
  { value: "JOB_RIGHT", label: "Job", dimensions: "300 × 250 px", recommended: "600 × 500 px", aspect: "6:5" },
  { value: "INDUSTRY_TALKS_RIGHT", label: "Industry Talks", dimensions: "300 × 250 px", recommended: "600 × 500 px", aspect: "6:5" },
  { value: "MAGAZINE_RIGHT", label: "Magazine", dimensions: "300 × 250 px", recommended: "600 × 500 px", aspect: "6:5" },
  { value: "Archive", label: "Archive", dimensions: "300 × 250 px", recommended: "600 × 500 px", aspect: "6:5" },
] as const;

export type BannerPlacement =
  (typeof BANNER_PLACEMENTS)[number]["value"];

export function getBannerPlacementInfo(placement: string) {
  return BANNER_PLACEMENTS.find((p) => p.value === placement);
}
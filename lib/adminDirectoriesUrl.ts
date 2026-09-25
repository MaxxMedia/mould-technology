export function adminDirectoriesListHref(search?: {
  page?: string | number | null
  filter?: string | null
}) {
  const params = new URLSearchParams()
  const page = Number(search?.page)
  if (Number.isInteger(page) && page > 1) {
    params.set("page", String(page))
  }
  const filter = String(search?.filter || "")
  if (filter && filter !== "all") {
    params.set("filter", filter)
  }
  const qs = params.toString()
  return qs ? `/admin/directories?${qs}` : "/admin/directories"
}

export function adminDirectoryEditHref(
  id: number | string,
  search?: { page?: string | number | null; filter?: string | null }
) {
  const list = adminDirectoriesListHref(search)
  const query = list.includes("?") ? list.slice(list.indexOf("?")) : ""
  return `/admin/directories/${id}/edit${query}`
}

export function adminDirectoryReviewHref(
  id: number | string,
  search?: { page?: string | number | null; filter?: string | null }
) {
  const list = adminDirectoriesListHref(search)
  const query = list.includes("?") ? list.slice(list.indexOf("?")) : ""
  return `/admin/directories/${id}${query}`
}

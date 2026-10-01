export type DirectoryListSearch = {
  page?: string | number | null
  filter?: string | null
  q?: string | null
  sort?: string | null
  status?: string | null
  letter?: string | null
}

export function directoryListSearchFromParams(searchParams: {
  get: (key: string) => string | null
}): DirectoryListSearch {
  return {
    page: searchParams.get("page"),
    filter: searchParams.get("filter"),
    q: searchParams.get("q"),
    sort: searchParams.get("sort"),
    status: searchParams.get("status"),
    letter: searchParams.get("letter"),
  }
}

export function adminDirectoriesListHref(search?: DirectoryListSearch) {
  const params = new URLSearchParams()
  const page = Number(search?.page)
  if (Number.isInteger(page) && page > 1) {
    params.set("page", String(page))
  }
  const filter = String(search?.filter || "")
  if (filter && filter !== "all") {
    params.set("filter", filter)
  }
  const q = String(search?.q || "").trim()
  if (q) {
    params.set("q", q)
  }
  const sort = String(search?.sort || "")
  if (sort && sort !== "latest") {
    params.set("sort", sort)
  }
  const status = String(search?.status || "")
  if (status && status !== "all") {
    params.set("status", status)
  }
  const letter = String(search?.letter || "").toUpperCase()
  if (/^[A-Z#]$/.test(letter)) {
    params.set("letter", letter)
  }
  const qs = params.toString()
  return qs ? `/admin/directories?${qs}` : "/admin/directories"
}

export function adminDirectoryEditHref(
  id: number | string,
  search?: DirectoryListSearch
) {
  const list = adminDirectoriesListHref(search)
  const query = list.includes("?") ? list.slice(list.indexOf("?")) : ""
  return `/admin/directories/${id}/edit${query}`
}

export function adminDirectoryReviewHref(
  id: number | string,
  search?: DirectoryListSearch
) {
  const list = adminDirectoriesListHref(search)
  const query = list.includes("?") ? list.slice(list.indexOf("?")) : ""
  return `/admin/directories/${id}${query}`
}

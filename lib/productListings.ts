export function normalizeProductSupplies(
  productSupplies: unknown
): string[] {
  if (!productSupplies) return []
  if (typeof productSupplies === "string") {
    try {
      return normalizeProductSupplies(JSON.parse(productSupplies))
    } catch {
      return []
    }
  }
  if (!Array.isArray(productSupplies)) return []
  return productSupplies.map((item) => {
    if (typeof item === "string") return item
    if (item && typeof item === "object" && "name" in item) {
      return String((item as { name?: string }).name ?? "")
    }
    return String(item ?? "")
  })
}

export function countFilledProducts(productSupplies: unknown = []) {
  return normalizeProductSupplies(productSupplies).filter(
    (item) => item.trim().length > 0
  ).length
}

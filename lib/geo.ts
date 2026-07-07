type GeoModule = typeof import("country-state-city")

let geoModule: GeoModule | null = null

export async function loadGeo(): Promise<GeoModule> {
  if (!geoModule) {
    geoModule = await import("country-state-city")
  }
  return geoModule
}

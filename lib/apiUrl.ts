const PRODUCTION_API_URL = "https://api.toolingtrends.com"
const DEV_API_URL = "http://localhost:5000"

/**
 * Canonical backend origin. Never return an empty string — that becomes
 * `undefined/api/...` in the browser and hits the Next.js 404 HTML page.
 */
export function getApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (raw && raw !== "undefined") {
    return raw.replace(/\/$/, "")
  }
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_API_URL
  }
  return DEV_API_URL
}

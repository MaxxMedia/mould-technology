"use client"

import { useEffect, useRef } from "react"

export default function EventViewTracker({ slug }: { slug: string }) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${slug}/view`, {
      method: "POST",
    }).catch(() => {
      // silent — view tracking should never block or affect the page
    })
  }, [slug])

  return null
}
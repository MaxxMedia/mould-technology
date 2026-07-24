"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type CalendarEvent = { startDate: string; endDate: string }

export default function EventCalendar({ events }: { events: CalendarEvent[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedDate = searchParams.get("date")

  const [viewDate, setViewDate] = useState(() => (selectedDate ? new Date(selectedDate) : new Date()))
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  // Every calendar day (as a date string) that falls inside some event's start–end range
  const eventDates = useMemo(() => {
    const set = new Set<string>()
    events.forEach(({ startDate, endDate }) => {
      const cur = new Date(startDate)
      const end = new Date(endDate)
      while (cur <= end) {
        set.add(cur.toDateString())
        cur.setDate(cur.getDate() + 1)
      }
    })
    return set
  }, [events])

  const startOffset = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const cells = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startOffset + 1
    return { date: new Date(year, month, dayNum), inMonth: dayNum >= 1 && dayNum <= daysInMonth }
  })

  function goToMonth(offset: number) {
    setViewDate(new Date(year, month + offset, 1))
  }

  function selectDate(date: Date) {
    const iso = date.toISOString().slice(0, 10)
    const params = new URLSearchParams(searchParams.toString())
    if (selectedDate === iso) params.delete("date")
    else params.set("date", iso)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-[#0f5b78] text-white text-sm font-semibold px-4 py-3">Event Calendar</div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => goToMonth(-1)} aria-label="Previous month">
            <ChevronLeft size={16} className="text-gray-400 hover:text-gray-700" />
          </button>
          <span className="text-sm font-medium">{monthLabel}</span>
          <button onClick={() => goToMonth(1)} aria-label="Next month">
            <ChevronRight size={16} className="text-gray-400 hover:text-gray-700" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {cells.map(({ date, inMonth }, i) => {
            const iso = date.toISOString().slice(0, 10)
            const isToday = inMonth && date.toDateString() === today.toDateString()
            const isSelected = inMonth && selectedDate === iso
            const hasEvent = inMonth && eventDates.has(date.toDateString())
            return (
              <button
                key={i}
                type="button"
                disabled={!inMonth}
                onClick={() => selectDate(date)}
                className={`relative h-7 flex items-center justify-center rounded-full ${
                  isSelected
                    ? "bg-[#b30f24] text-white"
                    : isToday
                    ? "bg-[#0f5b78] text-white"
                    : inMonth
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-gray-300"
                }`}
              >
                {date.getDate()}
                {hasEvent && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#b30f24]" />
                )}
              </button>
            )
          })}
        </div>

        {selectedDate && (
          <button
            type="button"
            onClick={() => selectDate(new Date(selectedDate))}
            className="w-full mt-4 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear Date Filter
          </button>
        )}
      </div>
    </div>
  )
}
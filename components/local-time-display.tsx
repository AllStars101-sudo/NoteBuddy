"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export function LocalTimeDisplay() {
  const [currentTime, setCurrentTime] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<string>("")
  const [timezone, setTimezone] = useState<string>("")

  useEffect(() => {
    // Function to update the time
    const updateTime = () => {
      const now = new Date()

      // Format time: HH:MM:SS
      setCurrentTime(
        now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )

      // Format date: Weekday, Month Day, Year
      setCurrentDate(
        now.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      )

      // Get timezone name
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }

    // Update immediately
    updateTime()

    // Update every second
    const intervalId = setInterval(updateTime, 1000)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  if (!currentTime) return null

  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Clock className="mr-2 h-4 w-4" />
      <div>
        <div>{currentTime}</div>
        <div className="text-xs">{currentDate}</div>
        <div className="text-xs opacity-70">{timezone}</div>
      </div>
    </div>
  )
}


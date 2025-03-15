/**
 * Format a date in a user-friendly way
 * @param date The date to format
 * @param includeTime Whether to include the time
 * @returns A formatted date string
 */
export function formatDate(date: string | Date | undefined | null, includeTime = false): string {
  if (!date) return "Unknown date"

  const dateObj = typeof date === "string" ? new Date(date) : date

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return "Unknown date"
  }

  // Format relative time
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()

  // Ensure diffMs is positive (in case of clock skew)
  if (diffMs < 0) {
    return dateObj.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: includeTime ? "2-digit" : undefined,
      minute: includeTime ? "2-digit" : undefined,
    })
  }

  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  // Only show "Just now" for very recent changes (less than 30 seconds ago)
  if (diffSecs < 30) {
    return "Just now"
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  } else {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }

    if (includeTime) {
      options.hour = "2-digit"
      options.minute = "2-digit"
    }

    return dateObj.toLocaleDateString(undefined, options)
  }
}

/**
 * Format a date for display in the sync status tooltip
 * @param date The date to format
 * @returns A formatted date and time string
 */
export function formatSyncTime(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return ""

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}


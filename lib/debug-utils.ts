/**
 * Debug utility to log date information
 * @param date The date to debug
 * @param label Optional label for the log
 */
export function debugDate(date: any, label = "Date debug"): void {
  if (process.env.NODE_ENV !== "production") {
    console.group(label)
    console.log("Original value:", date)
    console.log("Type:", typeof date)

    if (date instanceof Date) {
      console.log("Is Date instance: true")
      console.log("ISO string:", date.toISOString())
      console.log("Local string:", date.toString())
      console.log("Time value:", date.getTime())
      console.log("Is valid date:", !isNaN(date.getTime()))
    } else if (typeof date === "string") {
      console.log("Is Date instance: false")
      const parsedDate = new Date(date)
      console.log("Parsed as Date:", parsedDate)
      console.log("ISO string:", parsedDate.toISOString())
      console.log("Local string:", parsedDate.toString())
      console.log("Time value:", parsedDate.getTime())
      console.log("Is valid date:", !isNaN(parsedDate.getTime()))
    } else {
      console.log("Is Date instance: false")
      console.log("Cannot parse as date")
    }
    console.groupEnd()
  }
}


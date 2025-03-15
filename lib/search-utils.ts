import Fuse from "fuse.js"
import type { Note } from "@/lib/types"

// Define the search result type with highlighted content
export type SearchResultWithHighlight = {
  note: Note
  preview: string
  matches: {
    indices: [number, number][]
    key: string
    value: string
  }[]
}

// Configure Fuse.js options for optimal note searching
const fuseOptions = {
  includeScore: true,
  includeMatches: true, // Important for highlighting
  threshold: 0.4, // Lower threshold for more precise matches
  keys: [
    { name: "title", weight: 2 }, // Title matches are more important
    { name: "content", weight: 1 },
  ],
  // Options to improve partial matching
  ignoreLocation: true,
  findAllMatches: true,
  minMatchCharLength: 2,
  useExtendedSearch: true,
  distance: 200, // Allow matches to be spread out
}

/**
 * Create a search index for a collection of notes
 */
export function createSearchIndex(notes: Note[]): Fuse<Note> {
  return new Fuse(notes, fuseOptions)
}

/**
 * Search notes and return results with highlighted previews
 */
export function searchNotes(searchIndex: Fuse<Note>, query: string, limit = 10): SearchResultWithHighlight[] {
  if (!query.trim()) return []

  // Perform the search
  const results = searchIndex.search(query, { limit })

  // Process results to include highlighted previews
  return results.map((result) => {
    const note = result.item
    const matches = result.matches || []

    // Generate preview with highlighted content
    const preview = generateHighlightedPreview(note, matches, query)

    return {
      note,
      preview,
      matches,
    }
  })
}

/**
 * Generate a preview of the note content with matched terms highlighted
 */
function generateHighlightedPreview(note: Note, matches: Fuse.FuseResultMatch[], query: string): string {
  // Find content matches
  const contentMatches = matches.find((match) => match.key === "content")

  if (!contentMatches || !contentMatches.indices.length) {
    // If no content matches, return a simple preview
    return (
      note.content
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .substring(0, 150) + "..."
    )
  }

  // Get the first match for preview context
  const firstMatch = contentMatches.indices[0]
  const content = note.content.replace(/<[^>]*>/g, "") // Remove HTML tags

  // Calculate preview window around the match
  const previewStart = Math.max(0, firstMatch[0] - 60)
  const previewEnd = Math.min(content.length, firstMatch[1] + 60)

  // Extract preview text
  let preview = content.substring(previewStart, previewEnd)

  // Add ellipsis if needed
  if (previewStart > 0) preview = "..." + preview
  if (previewEnd < content.length) preview = preview + "..."

  // Highlight all matches within the preview
  const allMatches = contentMatches.indices
    .filter(([start, end]) => {
      // Only include matches that are within our preview window
      return start >= previewStart && end <= previewEnd
    })
    .map(([start, end]) => {
      // Adjust indices to be relative to the preview
      return [start - previewStart, end - previewStart] as [number, number]
    })
    .sort((a, b) => b[0] - a[0]) // Sort in reverse order to avoid index shifting

  // Apply highlighting by wrapping matches in <mark> tags
  let highlightedPreview = preview
  allMatches.forEach(([start, end]) => {
    highlightedPreview =
      highlightedPreview.substring(0, start) +
      `<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">${highlightedPreview.substring(start, end + 1)}</mark>` +
      highlightedPreview.substring(end + 1)
  })

  return highlightedPreview
}

/**
 * Highlight all occurrences of a search term in text
 */
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text

  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  // Create a regex that matches the query (case insensitive)
  const regex = new RegExp(`(${escapedQuery})`, "gi")

  // Replace matches with highlighted version
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>')
}


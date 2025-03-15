import Fuse from "fuse.js"
import type { Note } from "@/lib/types"

// Define the types of searchable items
export type SearchableItem = {
  id: string
  type: "note" | "file"
  title: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
  metadata?: Record<string, any>
}

// Convert a Note to a SearchableItem
export function noteToSearchableItem(note: Note): SearchableItem {
  // Ensure we have valid data
  if (!note) {
    throw new Error("Cannot convert null or undefined note to SearchableItem")
  }

  return {
    id: note.id || `note-${Date.now()}`,
    type: "note",
    title: note.title || "Untitled", // Ensure title is never empty
    content: note.content ? note.content.replace(/<[^>]*>/g, " ") : "", // Strip HTML tags
    createdAt: note.createdAt || new Date(),
    updatedAt: note.updatedAt || new Date(),
    metadata: {
      isFavorite: note.isFavorite || false,
    },
  }
}

// Convert a file to a SearchableItem
export function fileToSearchableItem(file: any): SearchableItem {
  // Ensure we have valid data
  if (!file) {
    throw new Error("Cannot convert null or undefined file to SearchableItem")
  }

  // Extract filename from pathname if name is not available
  let fileName = file.name
  if (!fileName && file.pathname) {
    const pathParts = file.pathname.split("/")
    fileName = pathParts[pathParts.length - 1]
  }

  // Create searchable content from file properties
  let searchableContent = ""
  if (file.contentType) searchableContent += file.contentType + " "
  if (fileName) searchableContent += fileName + " "
  if (file.pathname) searchableContent += file.pathname

  return {
    id: file.url || file.id || `file-${Date.now()}`,
    type: "file",
    title: fileName || "Unnamed file", // Ensure title is never empty
    content: searchableContent.trim(),
    createdAt: file.uploadedAt || new Date(),
    updatedAt: file.uploadedAt || new Date(),
    metadata: {
      size: file.size || 0,
      contentType: file.contentType || "",
      url: file.url || "",
      pathname: file.pathname || "",
    },
  }
}

// Configure Fuse.js options for fuzzy search with improved partial matching
const defaultFuseOptions = {
  includeScore: true,
  threshold: 0.6, // Even higher threshold to allow more fuzzy matches
  keys: [
    { name: "title", weight: 3 }, // Prioritize title matches
    { name: "content", weight: 1 },
  ],
  // Options to improve partial matching
  ignoreLocation: true,
  useExtendedSearch: true,
  findAllMatches: true,
  minMatchCharLength: 1, // Match even with just 1 character
  isCaseSensitive: false, // Ensure case-insensitive matching
  distance: 1000, // Allow matches to be far apart
}

// Create a search index for a collection of items
export function createSearchIndex(items: SearchableItem[], options = defaultFuseOptions) {
  return new Fuse(items, options)
}

// Search function that returns results with highlighting
export function search(
  fuse: Fuse<SearchableItem>,
  query: string,
  limit = 30, // Increased limit to show more results
): Array<{ item: SearchableItem; score: number; matches: any[] }> {
  if (!query.trim()) return []

  // Try different search strategies
  let results = fuse.search(query, { limit })

  // If no results, try with a more permissive search
  if (results.length === 0) {
    // Create a more permissive search configuration
    const permissiveOptions = {
      ...defaultFuseOptions,
      threshold: 0.8, // Very high threshold to catch almost anything
    }

    const permissiveFuse = new Fuse(
      fuse
        .getIndex()
        .toJSON()
        .records.map((r) => r.v),
      permissiveOptions,
    )

    results = permissiveFuse.search(query, { limit })
  }

  return results
}

// Extract highlighted snippets from content based on search matches
export function extractSnippet(content: string, matches: any[], maxLength = 150): string {
  if (!content) return ""

  if (!matches || matches.length === 0) {
    return content.substring(0, maxLength) + (content.length > maxLength ? "..." : "")
  }

  // Find content matches
  const contentMatches = matches.filter((match) => match.key === "content")
  if (contentMatches.length === 0) {
    return content.substring(0, maxLength) + (content.length > maxLength ? "..." : "")
  }

  try {
    // Get the first match indices
    const match = contentMatches[0]
    const indices = match.indices[0]

    // Calculate snippet start and end positions
    let start = Math.max(0, indices[0] - 50)
    let end = Math.min(content.length, indices[1] + 50)

    // Adjust to fit within maxLength
    if (end - start > maxLength) {
      const middle = (indices[0] + indices[1]) / 2
      start = Math.max(0, middle - maxLength / 2)
      end = Math.min(content.length, start + maxLength)
    }

    // Add ellipsis if needed
    const prefix = start > 0 ? "..." : ""
    const suffix = end < content.length ? "..." : ""

    return prefix + content.substring(start, end) + suffix
  } catch (error) {
    console.error("Error extracting snippet:", error)
    return content.substring(0, maxLength) + (content.length > maxLength ? "..." : "")
  }
}

// Filter search results by type
export function filterResultsByType(
  results: Array<{ item: SearchableItem; score: number; matches: any[] }>,
  type: "note" | "file",
): Array<{ item: SearchableItem; score: number; matches: any[] }> {
  return results.filter((result) => result.item.type === type)
}

// Sort search results by date or relevance
export function sortResults(
  results: Array<{ item: SearchableItem; score: number; matches: any[] }>,
  sortBy: "relevance" | "date" = "relevance",
): Array<{ item: SearchableItem; score: number; matches: any[] }> {
  if (sortBy === "date") {
    return [...results].sort((a, b) => {
      const dateA = new Date(a.item.updatedAt).getTime()
      const dateB = new Date(b.item.updatedAt).getTime()
      return dateB - dateA
    })
  }

  // Default sort by relevance (score)
  return results
}


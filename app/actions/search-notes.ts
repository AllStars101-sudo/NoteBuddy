"use server"

import { getAuthSession } from "@/lib/auth"
import { listUserNotes } from "@/lib/blob-storage"
import Fuse from "fuse.js"

// Define the search result type
export type NoteSearchResult = {
  id: string
  title: string
  preview: string
  updatedAt: string | Date
  isFavorite: boolean
  score: number
}

// Configure Fuse.js options
const fuseOptions = {
  includeScore: true,
  includeMatches: true,
  threshold: 0.4,
  keys: [
    { name: "title", weight: 2 },
    { name: "content", weight: 1 },
  ],
  ignoreLocation: true,
  findAllMatches: true,
  minMatchCharLength: 2,
  useExtendedSearch: true,
}

export async function searchUserNotes(
  query: string,
  limit = 20,
): Promise<{ results: NoteSearchResult[] } | { error: string }> {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  try {
    // For empty queries, return empty results
    if (!query.trim()) {
      return { results: [] }
    }

    // Get all user notes
    const notes = await listUserNotes(session.user.id)

    // Create search index
    const fuse = new Fuse(notes, fuseOptions)

    // Perform search
    const searchResults = fuse.search(query, { limit })

    // Format results
    const formattedResults: NoteSearchResult[] = searchResults.map((result) => {
      const note = result.item
      const matches = result.matches || []

      // Generate preview with highlighted content
      let preview = ""
      const contentMatches = matches.find((match) => match.key === "content")

      if (contentMatches && contentMatches.indices.length) {
        const firstMatch = contentMatches.indices[0]
        const content = note.content.replace(/<[^>]*>/g, "") // Remove HTML tags

        // Calculate preview window
        const previewStart = Math.max(0, firstMatch[0] - 60)
        const previewEnd = Math.min(content.length, firstMatch[1] + 60)

        // Extract preview text
        preview = content.substring(previewStart, previewEnd)

        // Add ellipsis if needed
        if (previewStart > 0) preview = "..." + preview
        if (previewEnd < content.length) preview = preview + "..."
      } else {
        // If no content matches, use the beginning of the content
        preview = note.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
      }

      return {
        id: note.id,
        title: note.title || "Untitled",
        preview,
        updatedAt: note.updatedAt,
        isFavorite: note.isFavorite,
        score: 1 - (result.score || 0), // Convert to a 0-1 scale where 1 is best
      }
    })

    return { results: formattedResults }
  } catch (error) {
    console.error("Error searching notes:", error)
    return { error: "Failed to search notes: " + (error instanceof Error ? error.message : String(error)) }
  }
}


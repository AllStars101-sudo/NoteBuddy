"use server"

import { getAuthSession } from "@/lib/auth"
import { listUserNotes } from "@/lib/blob-storage"
import { listFiles } from "@/app/actions/list-files"
import {
  createSearchIndex,
  noteToSearchableItem,
  fileToSearchableItem,
  search as performSearch,
  type SearchableItem,
} from "@/lib/search"

export type SearchResult = {
  id: string
  type: "note" | "file"
  title: string
  content: string
  snippet: string
  score: number
  updatedAt: string | Date
  metadata?: Record<string, any>
}

export type SearchOptions = {
  types?: ("note" | "file")[]
  sortBy?: "relevance" | "date"
  limit?: number
}

export async function searchContent(
  query: string,
  options: SearchOptions = {},
): Promise<{ results: SearchResult[] } | { error: string }> {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id
  const { types = ["note", "file"], sortBy = "relevance", limit = 20 } = options

  try {
    // For empty queries, return empty results
    if (!query.trim()) {
      return { results: [] }
    }

    // Normalize the query (trim, lowercase)
    const normalizedQuery = query.trim().toLowerCase()
    console.log(`[SEARCH] Starting search for "${normalizedQuery}" with options:`, options)

    // Collect all searchable items
    const searchableItems: SearchableItem[] = []
    let notesCount = 0
    let filesCount = 0

    // Get notes if included in types
    if (types.includes("note")) {
      console.log(`[SEARCH] Fetching notes for user ${userId}`)
      try {
        const notes = await listUserNotes(userId)
        notesCount = notes.length
        console.log(`[SEARCH] Found ${notesCount} notes`)

        // Ensure titles are properly processed for search
        searchableItems.push(
          ...notes.map((note) => {
            const searchableNote = noteToSearchableItem(note)
            // Make sure title is a string and not empty
            searchableNote.title = searchableNote.title || "Untitled"
            return searchableNote
          }),
        )
      } catch (noteError) {
        console.error("[SEARCH] Error fetching notes:", noteError)
        // Continue with files even if notes fail
      }
    }

    // Get files if included in types
    if (types.includes("file")) {
      console.log(`[SEARCH] Fetching files for user ${userId}`)
      try {
        const filesResult = await listFiles()

        if ("error" in filesResult) {
          console.error(`[SEARCH] Error in listFiles:`, filesResult.error)
        } else if ("files" in filesResult && Array.isArray(filesResult.files)) {
          filesCount = filesResult.files.length
          console.log(`[SEARCH] Found ${filesCount} files`)

          // Log the first file for debugging
          if (filesCount > 0) {
            console.log(`[SEARCH] Sample file:`, JSON.stringify(filesResult.files[0]))
          }

          const fileItems = filesResult.files
            .map((file) => {
              try {
                const searchableFile = fileToSearchableItem(file)
                // Make sure title is a string and not empty
                searchableFile.title = searchableFile.title || "Unnamed file"
                return searchableFile
              } catch (fileConversionError) {
                console.error(`[SEARCH] Error converting file to searchable item:`, fileConversionError, file)
                // Return null for failed conversions
                return null
              }
            })
            .filter(Boolean) as SearchableItem[] // Filter out nulls

          searchableItems.push(...fileItems)
        } else {
          console.error(`[SEARCH] Unexpected response from listFiles:`, filesResult)
        }
      } catch (fileError) {
        console.error("[SEARCH] Error fetching files:", fileError)
        // Continue with notes even if files fail
      }
    }

    console.log(`[SEARCH] Total searchable items: ${searchableItems.length} (${notesCount} notes, ${filesCount} files)`)

    // If no items to search, return empty results
    if (searchableItems.length === 0) {
      console.log(`[SEARCH] No searchable items found, returning empty results`)
      return { results: [] }
    }

    // Create search index
    const searchIndex = createSearchIndex(searchableItems)

    // Perform search
    console.log(`[SEARCH] Performing search with query "${normalizedQuery}"`)
    const searchResults = performSearch(searchIndex, normalizedQuery, limit)
    console.log(`[SEARCH] Found ${searchResults.length} results`)

    // Sort results if needed
    let sortedResults = searchResults
    if (sortBy === "date") {
      sortedResults = sortedResults.sort((a, b) => {
        const dateA = new Date(a.item.updatedAt).getTime()
        const dateB = new Date(b.item.updatedAt).getTime()
        return dateB - dateA
      })
    }

    // Format results
    const formattedResults: SearchResult[] = sortedResults.map((result) => {
      try {
        // Extract a relevant snippet from the content based on matches
        let snippet = ""
        const contentMatches = result.matches.filter((match) => match.key === "content")

        if (contentMatches.length > 0) {
          const match = contentMatches[0]
          const content = result.item.content

          // Get the first match indices
          const indices = match.indices[0]

          // Calculate snippet start and end positions
          const start = Math.max(0, indices[0] - 50)
          const end = Math.min(content.length, indices[1] + 50)

          // Add ellipsis if needed
          const prefix = start > 0 ? "..." : ""
          const suffix = end < content.length ? "..." : ""

          snippet = prefix + content.substring(start, end) + suffix
        } else {
          // If no content matches, use the beginning of the content
          snippet = result.item.content.substring(0, 150) + (result.item.content.length > 150 ? "..." : "")
        }

        return {
          id: result.item.id,
          type: result.item.type,
          title: result.item.title,
          content: result.item.content,
          snippet,
          score: 1 - (result.score || 0), // Convert to a 0-1 scale where 1 is best
          updatedAt: result.item.updatedAt,
          metadata: result.item.metadata,
        }
      } catch (formatError) {
        console.error(`[SEARCH] Error formatting search result:`, formatError, result)
        // Return a simplified result if formatting fails
        return {
          id: result.item.id || "unknown",
          type: result.item.type || "unknown",
          title: result.item.title || "Unknown Item",
          content: "",
          snippet: "Error extracting content snippet",
          score: 0,
          updatedAt: new Date(),
        }
      }
    })

    console.log(`[SEARCH] Returning ${formattedResults.length} formatted results`)
    return { results: formattedResults }
  } catch (error) {
    console.error("[SEARCH] Critical error in searchContent:", error)
    return { error: "Failed to search content: " + (error instanceof Error ? error.message : String(error)) }
  }
}

// Get recent searches from server (could be stored in a database)
export async function getRecentSearches(): Promise<{ searches: string[] } | { error: string }> {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  // This would typically come from a database
  // For now, we'll return a static list
  return {
    searches: ["meeting notes", "project ideas", "todo list"],
  }
}

// Save a search query to recent searches
export async function saveSearchQuery(query: string): Promise<{ success: boolean } | { error: string }> {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  try {
    // In a real implementation, this would save to a database
    console.log(`Saving search query: ${query}`)
    return { success: true }
  } catch (error) {
    console.error("Error saving search query:", error)
    return { error: "Failed to save search query" }
  }
}


import { put, list, del } from "@vercel/blob"
import type { Note } from "@/lib/types"

// Base path for notes in blob storage
const NOTES_PATH = "notes"
const ALLOWED_FILE_TYPES = [
  "application/pdf", // PDF
  "text/plain", // TXT
  "image/jpeg", // JPG, JPEG
  "image/png", // PNG
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
]

export const ALLOWED_FILE_EXTENSIONS = [".pdf", ".txt", ".jpg", ".jpeg", ".png", ".docx"]

/**
 * Converts a Note object to Markdown format with YAML frontmatter
 */
function noteToMarkdown(note: Note): string {
  // Ensure dates are valid before converting to ISO string
  const createdAtDate = note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt)
  const updatedAtDate = note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt)

  // Validate that the dates are valid
  const validCreatedAt = !isNaN(createdAtDate.getTime()) ? createdAtDate : new Date()
  const validUpdatedAt = !isNaN(updatedAtDate.getTime()) ? updatedAtDate : new Date()

  const frontmatter = [
    "---",
    `id: ${note.id}`,
    `title: ${note.title}`,
    `userId: ${note.userId}`,
    `createdAt: ${validCreatedAt.toISOString()}`,
    `updatedAt: ${validUpdatedAt.toISOString()}`,
    `isFavorite: ${note.isFavorite}`,
    "---",
    "",
    // Add the content after the frontmatter
    note.content,
  ].join("\n")

  return frontmatter
}

/**
 * Parses a Markdown file with YAML frontmatter into a Note object
 */
function markdownToNote(markdown: string): Note | null {
  try {
    // Check if the markdown has frontmatter (between --- markers)
    if (!markdown.startsWith("---")) {
      throw new Error("Invalid markdown format: missing frontmatter")
    }

    // Find the end of the frontmatter
    const endOfFrontmatter = markdown.indexOf("---", 3)
    if (endOfFrontmatter === -1) {
      throw new Error("Invalid markdown format: unclosed frontmatter")
    }

    // Extract frontmatter and content
    const frontmatter = markdown.substring(3, endOfFrontmatter).trim()
    const content = markdown.substring(endOfFrontmatter + 3).trim()

    // Parse frontmatter into key-value pairs
    const metadata: Record<string, string> = {}
    frontmatter.split("\n").forEach((line) => {
      const colonIndex = line.indexOf(":")
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        const value = line.substring(colonIndex + 1).trim()
        if (key && value) {
          metadata[key] = value
        }
      }
    })

    // Create Note object from metadata and content
    // Ensure dates are valid by checking and providing fallbacks
    let createdAt: Date
    let updatedAt: Date

    try {
      createdAt = metadata.createdAt ? new Date(metadata.createdAt) : new Date()
      // Validate that the date is valid
      if (isNaN(createdAt.getTime())) {
        createdAt = new Date()
      }
    } catch (e) {
      createdAt = new Date()
    }

    try {
      updatedAt = metadata.updatedAt ? new Date(metadata.updatedAt) : new Date()
      // Validate that the date is valid
      if (isNaN(updatedAt.getTime())) {
        updatedAt = new Date()
      }
    } catch (e) {
      updatedAt = new Date()
    }

    return {
      id: metadata.id || "",
      title: metadata.title || "Untitled",
      content: content,
      userId: metadata.userId || "",
      createdAt: createdAt,
      updatedAt: updatedAt,
      isFavorite: metadata.isFavorite === "true",
    }
  } catch (error) {
    console.error("Error parsing markdown to note:", error)
    return null
  }
}

// Save a note to blob storage as a Markdown file
export async function saveNoteToBlob(note: Note): Promise<string> {
  try {
    const markdownContent = noteToMarkdown(note)
    const notePath = `${NOTES_PATH}/${note.userId}/${note.id}.md`

    // Ensure dates are valid
    const createdAtDate = note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt)
    const updatedAtDate = note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt)

    // Validate the dates
    const validCreatedAt = !isNaN(createdAtDate.getTime()) ? createdAtDate : new Date()
    const validUpdatedAt = !isNaN(updatedAtDate.getTime()) ? updatedAtDate : new Date()

    const blob = await put(notePath, markdownContent, {
      access: "public",
      addRandomSuffix: false,
      contentType: "text/markdown",
      metadata: {
        createdAt: validCreatedAt.toISOString(),
        updatedAt: validUpdatedAt.toISOString(),
        userId: note.userId,
        isFavorite: note.isFavorite.toString(),
      },
    })

    return blob.url
  } catch (error) {
    console.error("Error saving note to blob:", error)
    throw new Error(`Failed to save note: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Get a note from blob storage
export async function getNoteFromBlob(userId: string, noteId: string): Promise<Note | null> {
  try {
    const notePath = `${NOTES_PATH}/${userId}/${noteId}.md`
    const { blobs } = await list({ prefix: notePath })

    if (blobs.length === 0) {
      console.log(`No note found with path: ${notePath}`)
      return null
    }

    const blob = blobs[0]
    const response = await fetch(blob.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch note: ${response.statusText}`)
    }

    const markdownContent = await response.text()
    const note = markdownToNote(markdownContent)

    if (!note) {
      console.error(`Failed to parse note from markdown: ${blob.url}`)
      return null
    }

    // Use blob metadata for dates if available
    if (blob.metadata) {
      if (blob.metadata.createdAt) {
        note.createdAt = new Date(blob.metadata.createdAt)
      }
      if (blob.metadata.updatedAt) {
        note.updatedAt = new Date(blob.metadata.updatedAt)
      }
    }
    // Fallback to blob uploadedAt if metadata is not available
    else if (blob.uploadedAt) {
      if (!note.createdAt || isNaN(new Date(note.createdAt).getTime())) {
        note.createdAt = new Date(blob.uploadedAt)
      }
      if (!note.updatedAt || isNaN(new Date(note.updatedAt).getTime())) {
        note.updatedAt = new Date(blob.uploadedAt)
      }
    }

    return note
  } catch (error) {
    console.error("Error fetching note from blob:", error)
    return null
  }
}

// List all notes for a user
export async function listUserNotes(userId: string): Promise<Note[]> {
  try {
    const userNotesPath = `${NOTES_PATH}/${userId}/`
    const { blobs } = await list({ prefix: userNotesPath })

    // Filter to only include .md files
    const markdownBlobs = blobs.filter((blob) => blob.pathname.endsWith(".md"))

    const notes: Note[] = []

    for (const blob of markdownBlobs) {
      try {
        const response = await fetch(blob.url)
        if (response.ok) {
          const markdownContent = await response.text()
          const note = markdownToNote(markdownContent)
          if (note) {
            // Use blob metadata for dates if available
            if (blob.metadata) {
              if (blob.metadata.createdAt) {
                note.createdAt = new Date(blob.metadata.createdAt)
              }
              if (blob.metadata.updatedAt) {
                note.updatedAt = new Date(blob.metadata.updatedAt)
              }
            }
            // Fallback to blob uploadedAt if metadata is not available
            else if (blob.uploadedAt) {
              if (!note.createdAt || isNaN(new Date(note.createdAt).getTime())) {
                note.createdAt = new Date(blob.uploadedAt)
              }
              if (!note.updatedAt || isNaN(new Date(note.updatedAt).getTime())) {
                note.updatedAt = new Date(blob.uploadedAt)
              }
            }

            notes.push(note)
          }
        }
      } catch (error) {
        console.error(`Error processing note ${blob.url}:`, error)
        // Continue with other notes even if one fails
      }
    }

    // Sort notes by updatedAt (most recent first)
    return notes.sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt)
      const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt)
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error("Error listing user notes:", error)
    return []
  }
}

// Delete a note from blob storage
export async function deleteNoteFromBlob(userId: string, noteId: string): Promise<boolean> {
  try {
    const notePath = `${NOTES_PATH}/${userId}/${noteId}.md`
    const { blobs } = await list({ prefix: notePath })

    if (blobs.length === 0) {
      return false
    }

    await del(blobs[0].url)
    return true
  } catch (error) {
    console.error("Error deleting note from blob:", error)
    return false
  }
}

// Check if a file type is allowed
export function isFileTypeAllowed(fileType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(fileType)
}

// Check if a file extension is allowed
export function isFileExtensionAllowed(fileName: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."))
  return ALLOWED_FILE_EXTENSIONS.includes(extension)
}


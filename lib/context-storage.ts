import { put, list, del } from "@vercel/blob"
import { getNoteFromBlob, saveNoteToBlob } from "@/lib/blob-storage"
import type { Note } from "@/lib/types"

// Base path for context storage in blob storage
const CONTEXT_PATH = "context"

export type FileContext = {
  fileName: string
  fileUrl: string
  content: string
  addedAt: string
}

/**
 * Save extracted file content as context for a note
 */
export async function saveFileContextToNote(
  userId: string,
  noteId: string,
  fileName: string,
  fileUrl: string,
  content: string,
): Promise<boolean> {
  try {
    // First, get the existing note to update its metadata
    const note = await getNoteFromBlob(userId, noteId)
    if (!note) return false

    // Create a context object
    const context: FileContext = {
      fileName,
      fileUrl,
      content,
      addedAt: new Date().toISOString(),
    }

    // Save context to blob storage
    const contextPath = `${CONTEXT_PATH}/${userId}/${noteId}/${fileName.replace(/[^a-z0-9.]/gi, "_")}.json`
    await put(contextPath, JSON.stringify(context), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    })

    // Update note metadata to indicate it has context
    const updatedNote: Note = {
      ...note,
      hasFileContext: true,
    }

    // Save the updated note
    await saveNoteToBlob(updatedNote)

    return true
  } catch (error) {
    console.error("Error saving file context:", error)
    return false
  }
}

/**
 * Get all file contexts for a note
 */
export async function getFileContextsForNote(userId: string, noteId: string): Promise<FileContext[]> {
  try {
    const contextPath = `${CONTEXT_PATH}/${userId}/${noteId}/`
    const { blobs } = await list({ prefix: contextPath })

    const contexts: FileContext[] = []

    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url)
        if (response.ok) {
          const context = await response.json()
          contexts.push(context)
        }
      } catch (error) {
        console.error(`Error processing context ${blob.url}:`, error)
      }
    }

    return contexts
  } catch (error) {
    console.error("Error getting file contexts:", error)
    return []
  }
}

/**
 * Delete a file context
 */
export async function deleteFileContext(userId: string, noteId: string, fileName: string): Promise<boolean> {
  try {
    const contextPath = `${CONTEXT_PATH}/${userId}/${noteId}/${fileName.replace(/[^a-z0-9.]/gi, "_")}.json`
    const { blobs } = await list({ prefix: contextPath })

    if (blobs.length === 0) return false

    await del(blobs[0].url)

    // Check if there are any remaining contexts
    const remainingContexts = await getFileContextsForNote(userId, noteId)

    // If no contexts remain, update the note metadata
    if (remainingContexts.length === 0) {
      const note = await getNoteFromBlob(userId, noteId)
      if (note) {
        const updatedNote: Note = {
          ...note,
          hasFileContext: false,
        }
        await saveNoteToBlob(updatedNote)
      }
    }

    return true
  } catch (error) {
    console.error("Error deleting file context:", error)
    return false
  }
}

/**
 * Get combined context content for AI
 */
export async function getCombinedContextForAI(userId: string, noteId: string): Promise<string> {
  try {
    const contexts = await getFileContextsForNote(userId, noteId)

    if (contexts.length === 0) return ""

    // Combine all context content with file names
    return contexts.map((ctx) => `--- Content from ${ctx.fileName} ---\n${ctx.content}\n`).join("\n\n")
  } catch (error) {
    console.error("Error getting combined context:", error)
    return ""
  }
}


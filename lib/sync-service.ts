import type { Note } from "@/lib/types"
import { getNoteFromLocalStorage, isLocalStorageAvailable } from "@/lib/local-storage"
import { getNoteFromBlob } from "@/lib/blob-storage"

/**
 * Check for conflicts between local and remote versions of a note
 */
export async function checkForConflicts(
  userId: string,
  noteId: string,
): Promise<{
  hasConflict: boolean
  localNote: Note | null
  remoteNote: Note | null
  newerVersion: "local" | "remote" | null
}> {
  try {
    const localNote = getNoteFromLocalStorage(noteId)
    const remoteNote = await getNoteFromBlob(userId, noteId)

    if (!localNote || !remoteNote) {
      return {
        hasConflict: false,
        localNote,
        remoteNote,
        newerVersion: localNote ? "local" : remoteNote ? "remote" : null,
      }
    }

    // Compare last updated timestamps
    const localUpdated = localNote.updatedAt instanceof Date ? localNote.updatedAt : new Date(localNote.updatedAt)
    const remoteUpdated = remoteNote.updatedAt instanceof Date ? remoteNote.updatedAt : new Date(remoteNote.updatedAt)

    // Check if there's a significant difference (more than 5 seconds)
    const timeDiff = Math.abs(localUpdated.getTime() - remoteUpdated.getTime())
    const hasConflict = timeDiff > 5000 && localNote.content !== remoteNote.content

    // Determine which version is newer
    const newerVersion = localUpdated > remoteUpdated ? "local" : "remote"

    return { hasConflict, localNote, remoteNote, newerVersion }
  } catch (error) {
    console.error(`Error checking for conflicts for note ${noteId}:`, error)
    return { hasConflict: false, localNote: null, remoteNote: null, newerVersion: null }
  }
}

/**
 * Get the most up-to-date version of a note, prioritizing local storage if available
 */
export async function getMostUpToDateNote(userId: string, noteId: string): Promise<Note | null> {
  try {
    // First check localStorage
    if (isLocalStorageAvailable()) {
      const localNote = getNoteFromLocalStorage(noteId)
      if (localNote) {
        return localNote
      }
    }

    // If not in localStorage, get from Vercel Blob
    return await getNoteFromBlob(userId, noteId)
  } catch (error) {
    console.error(`Error getting most up-to-date note ${noteId}:`, error)
    return null
  }
}


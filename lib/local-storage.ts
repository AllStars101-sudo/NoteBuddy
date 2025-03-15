import type { Note } from "@/lib/types"

// Constants
const NOTE_PREFIX = "notebuddy_note_"
const LAST_EDITED_PREFIX = "notebuddy_edited_"

/**
 * Save a note to localStorage
 */
export function saveNoteToLocalStorage(note: Note): void {
  try {
    // Save the note content
    localStorage.setItem(`${NOTE_PREFIX}${note.id}`, JSON.stringify(note))

    // Update last edited timestamp
    localStorage.setItem(`${LAST_EDITED_PREFIX}${note.id}`, new Date().toISOString())
  } catch (error) {
    console.error("Error saving note to localStorage:", error)
  }
}

/**
 * Get a note from localStorage
 */
export function getNoteFromLocalStorage(noteId: string): Note | null {
  try {
    const noteJson = localStorage.getItem(`${NOTE_PREFIX}${noteId}`)
    if (!noteJson) return null

    const note = JSON.parse(noteJson) as Note

    // Ensure dates are properly parsed
    if (typeof note.createdAt === "string") {
      note.createdAt = new Date(note.createdAt)
    }
    if (typeof note.updatedAt === "string") {
      note.updatedAt = new Date(note.updatedAt)
    }

    return note
  } catch (error) {
    console.error("Error retrieving note from localStorage:", error)
    return null
  }
}

/**
 * Get the last edited timestamp for a note
 */
export function getLastEditedTimestamp(noteId: string): Date | null {
  try {
    const timestamp = localStorage.getItem(`${LAST_EDITED_PREFIX}${noteId}`)
    return timestamp ? new Date(timestamp) : null
  } catch (error) {
    console.error("Error getting last edited timestamp:", error)
    return null
  }
}

/**
 * Delete a note from localStorage
 */
export function deleteNoteFromLocalStorage(noteId: string): void {
  try {
    localStorage.removeItem(`${NOTE_PREFIX}${noteId}`)
    localStorage.removeItem(`${LAST_EDITED_PREFIX}${noteId}`)
  } catch (error) {
    console.error("Error deleting note from localStorage:", error)
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "test_localStorage"
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}


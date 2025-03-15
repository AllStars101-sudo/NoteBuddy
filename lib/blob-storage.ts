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

// Save a note to blob storage
export async function saveNoteToBlob(note: Note): Promise<string> {
  const notePath = `${NOTES_PATH}/${note.userId}/${note.id}.json`
  const blob = await put(notePath, JSON.stringify(note), {
    access: "private",
    addRandomSuffix: false,
  })

  return blob.url
}

// Get a note from blob storage
export async function getNoteFromBlob(userId: string, noteId: string): Promise<Note | null> {
  try {
    const notePath = `${NOTES_PATH}/${userId}/${noteId}.json`
    const { blobs } = await list({ prefix: notePath })

    if (blobs.length === 0) {
      return null
    }

    const response = await fetch(blobs[0].url)
    if (!response.ok) {
      throw new Error(`Failed to fetch note: ${response.statusText}`)
    }

    const noteData = await response.json()
    return noteData as Note
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

    const notes: Note[] = []

    for (const blob of blobs) {
      const response = await fetch(blob.url)
      if (response.ok) {
        const noteData = await response.json()
        notes.push(noteData as Note)
      }
    }

    // Sort notes by updatedAt (most recent first)
    return notes.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  } catch (error) {
    console.error("Error listing user notes:", error)
    return []
  }
}

// Delete a note from blob storage
export async function deleteNoteFromBlob(userId: string, noteId: string): Promise<boolean> {
  try {
    const notePath = `${NOTES_PATH}/${userId}/${noteId}.json`
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


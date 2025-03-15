"use server"

import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { Note } from "@/lib/types"
import { saveNoteToBlob, getNoteFromBlob, listUserNotes, deleteNoteFromBlob } from "@/lib/blob-storage"

export async function createNote(formData: FormData) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id
  const title = (formData.get("title") as string) || "Untitled"
  const content = (formData.get("content") as string) || ""

  try {
    const noteId = Date.now().toString()
    const now = new Date()

    const newNote: Note = {
      id: noteId,
      title,
      content,
      userId,
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
    }

    // Save note to Vercel Blob as Markdown
    await saveNoteToBlob(newNote)

    revalidatePath("/")
    return { success: true, noteId }
  } catch (error) {
    console.error("Error creating note:", error)
    return { error: "Failed to create note: " + (error instanceof Error ? error.message : String(error)) }
  }
}

export async function updateNote(noteId: string, formData: FormData) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id
  const title = formData.get("title") as string
  const content = formData.get("content") as string

  try {
    // Get existing note
    const existingNote = await getNoteFromBlob(userId, noteId)

    // If note doesn't exist in Blob storage, create a new one
    if (!existingNote) {
      const now = new Date()
      const newNote: Note = {
        id: noteId,
        title,
        content,
        userId,
        createdAt: now,
        updatedAt: now,
        isFavorite: false,
      }

      await saveNoteToBlob(newNote)
      revalidatePath("/")
      return { success: true }
    }

    // Ensure dates are properly handled
    let createdAt: Date
    if (existingNote.createdAt instanceof Date) {
      createdAt = existingNote.createdAt
    } else if (typeof existingNote.createdAt === "string") {
      createdAt = new Date(existingNote.createdAt)
    } else {
      createdAt = new Date()
    }

    // Validate the date
    if (isNaN(createdAt.getTime())) {
      createdAt = new Date()
    }

    // Update note with proper date handling
    const updatedNote: Note = {
      ...existingNote,
      title,
      content,
      updatedAt: new Date(),
      // Ensure we keep the original creation date
      createdAt: existingNote.createdAt instanceof Date ? existingNote.createdAt : new Date(existingNote.createdAt),
    }

    // Save updated note to Vercel Blob as Markdown
    await saveNoteToBlob(updatedNote)

    // Only revalidate the home page, not the current document page
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error updating note:", error)
    return { error: "Failed to update note: " + (error instanceof Error ? error.message : String(error)) }
  }
}

export async function toggleFavorite(noteId: string) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id

  try {
    // Get existing note
    const existingNote = await getNoteFromBlob(userId, noteId)

    if (!existingNote) {
      return { error: "Note not found or you do not have permission to edit it" }
    }

    // Toggle favorite status
    const updatedNote: Note = {
      ...existingNote,
      isFavorite: !existingNote.isFavorite,
    }

    // Save updated note to Vercel Blob as Markdown
    await saveNoteToBlob(updatedNote)

    revalidatePath("/")
    revalidatePath(`/documents/${noteId}`)
    return { success: true, isFavorite: updatedNote.isFavorite }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return { error: "Failed to update note: " + (error instanceof Error ? error.message : String(error)) }
  }
}

export async function deleteNote(noteId: string) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id

  try {
    // Delete note from Vercel Blob
    const deleted = await deleteNoteFromBlob(userId, noteId)

    if (!deleted) {
      return { error: "Note not found or you do not have permission to delete it" }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting note:", error)
    return { error: "Failed to delete note: " + (error instanceof Error ? error.message : String(error)) }
  }
}

export async function getNotes() {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id

  try {
    // Get all notes for user from Vercel Blob
    const notes = await listUserNotes(userId)

    return { success: true, notes }
  } catch (error) {
    console.error("Error getting notes:", error)
    return { error: "Failed to get notes: " + (error instanceof Error ? error.message : String(error)) }
  }
}

export async function getNote(noteId: string) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id

  try {
    // Get note from Vercel Blob
    const note = await getNoteFromBlob(userId, noteId)

    if (!note) {
      return { error: "Note not found or you do not have permission to view it" }
    }

    return { success: true, note }
  } catch (error) {
    console.error("Error getting note:", error)
    return { error: "Failed to get note: " + (error instanceof Error ? error.message : String(error)) }
  }
}


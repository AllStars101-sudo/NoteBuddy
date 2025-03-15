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

    // Save note to Vercel Blob
    await saveNoteToBlob(newNote)

    revalidatePath("/")
    return { success: true, noteId }
  } catch (error) {
    console.error("Error creating note:", error)
    return { error: "Failed to create note" }
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

    if (!existingNote) {
      return { error: "Note not found or you do not have permission to edit it" }
    }

    // Update note
    const updatedNote: Note = {
      ...existingNote,
      title,
      content,
      updatedAt: new Date(),
    }

    // Save updated note to Vercel Blob
    await saveNoteToBlob(updatedNote)

    revalidatePath("/")
    revalidatePath(`/documents/${noteId}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating note:", error)
    return { error: "Failed to update note" }
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

    // Save updated note to Vercel Blob
    await saveNoteToBlob(updatedNote)

    revalidatePath("/")
    revalidatePath(`/documents/${noteId}`)
    return { success: true, isFavorite: updatedNote.isFavorite }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return { error: "Failed to update note" }
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
    return { error: "Failed to delete note" }
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
    return { error: "Failed to get notes" }
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
    return { error: "Failed to get note" }
  }
}


"use server"

import { list } from "@vercel/blob"
import { getAuthSession } from "@/lib/auth"

export async function listFiles(noteId?: string) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id

  try {
    // List all blobs
    const { blobs } = await list()

    // Filter blobs by user ID and optionally by note ID
    const userBlobs = blobs.filter((blob) => {
      // Check if the blob pathname starts with the user ID
      const belongsToUser = blob.pathname.startsWith(`${userId}/`)

      // Check if the blob metadata contains the user ID
      const hasUserMetadata = blob.metadata && blob.metadata.userId === userId

      // If noteId is provided, also check if the blob belongs to this note
      let belongsToNote = true
      if (noteId) {
        belongsToNote = blob.pathname.includes(`/${noteId}/`) || (blob.metadata && blob.metadata.noteId === noteId)
      }

      return (belongsToUser || hasUserMetadata) && belongsToNote
    })

    return {
      success: true,
      files: userBlobs.map((blob) => ({
        url: blob.url || "",
        pathname: blob.pathname || "",
        size: blob.size || 0,
        uploadedAt: blob.uploadedAt || new Date().toISOString(),
        contentType: blob.contentType || "",
        userId: userId,
        noteId: blob.metadata?.noteId || "",
      })),
    }
  } catch (error) {
    console.error("Error listing files:", error)
    return { error: "Failed to list files" }
  }
}


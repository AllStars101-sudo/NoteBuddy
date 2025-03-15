"use server"

import { put } from "@vercel/blob"
import { getAuthSession } from "@/lib/auth"
import { isFileTypeAllowed, isFileExtensionAllowed } from "@/lib/blob-storage"

export async function uploadFile(formData: FormData) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id
  const file = formData.get("file") as File
  const noteId = (formData.get("noteId") as string) || "general"

  if (!file) {
    return { error: "No file provided" }
  }

  // Check if file type is allowed
  if (!isFileTypeAllowed(file.type) && !isFileExtensionAllowed(file.name)) {
    return {
      error: "File type not allowed. Allowed types: PDF, TXT, JPG, JPEG, PNG, DOCX",
    }
  }

  try {
    // Create a path that includes the user ID and note ID to isolate user files
    const filename = `${userId}/${noteId}/${file.name}`

    // Upload file to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true, // Adds a random suffix to avoid name collisions
      metadata: {
        userId: userId,
        noteId: noteId,
      },
    })

    // Return the blob URL and other metadata
    return {
      success: true,
      url: blob.url,
      size: blob.size,
      uploadedAt: new Date().toISOString(),
      name: file.name,
      contentType: file.type,
      userId: userId,
      noteId: noteId,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { error: "Failed to upload file" }
  }
}


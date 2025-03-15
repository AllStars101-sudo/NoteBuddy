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
    console.log(`[LIST_FILES] Listing files for user ${userId}${noteId ? ` and note ${noteId}` : ""}`)

    // List all blobs
    const { blobs } = await list()
    console.log(`[LIST_FILES] Total blobs found: ${blobs.length}`)

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

      const shouldInclude = (belongsToUser || hasUserMetadata) && belongsToNote

      // Log detailed info for debugging
      if (shouldInclude) {
        console.log(`[LIST_FILES] Including blob: ${blob.pathname}`)
      }

      return shouldInclude
    })

    console.log(`[LIST_FILES] Filtered blobs for user: ${userBlobs.length}`)

    // Map blobs to file objects with proper error handling
    const files = userBlobs.map((blob) => {
      try {
        // Extract filename from pathname
        const pathParts = blob.pathname.split("/")
        const fileName = pathParts[pathParts.length - 1] || "Unknown file"

        // Determine content type
        let contentType = blob.contentType || ""
        if (!contentType) {
          // Try to infer content type from filename
          if (fileName.endsWith(".pdf")) contentType = "application/pdf"
          else if (fileName.endsWith(".txt")) contentType = "text/plain"
          else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg"
          else if (fileName.endsWith(".png")) contentType = "image/png"
          else if (fileName.endsWith(".docx"))
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }

        return {
          url: blob.url || "",
          pathname: blob.pathname || "",
          name: fileName,
          size: blob.size || 0,
          uploadedAt: blob.uploadedAt || new Date().toISOString(),
          contentType: contentType,
          userId: userId,
          noteId: blob.metadata?.noteId || "",
        }
      } catch (itemError) {
        console.error(`[LIST_FILES] Error processing blob item:`, itemError, blob)
        // Return a minimal valid file object
        return {
          url: blob.url || "",
          pathname: blob.pathname || "",
          name: "Error processing file",
          size: 0,
          uploadedAt: new Date().toISOString(),
          contentType: "",
          userId: userId,
          noteId: "",
        }
      }
    })

    console.log(`[LIST_FILES] Successfully processed ${files.length} files`)
    return {
      success: true,
      files,
    }
  } catch (error) {
    console.error("[LIST_FILES] Error listing files:", error)
    return { error: "Failed to list files: " + (error instanceof Error ? error.message : String(error)) }
  }
}


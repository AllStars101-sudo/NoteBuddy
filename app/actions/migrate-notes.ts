"use server"

import { getAuthSession } from "@/lib/auth"
import { list } from "@vercel/blob"
import { saveNoteToBlob } from "@/lib/blob-storage"
import type { Note } from "@/lib/types"

export async function migrateJsonNotesToMarkdown() {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id
  const NOTES_PATH = "notes"
  const userNotesPath = `${NOTES_PATH}/${userId}/`

  try {
    // List all blobs for the user
    const { blobs } = await list({ prefix: userNotesPath })

    // Filter to only include JSON files
    const jsonBlobs = blobs.filter((blob) => blob.pathname.endsWith(".json"))

    if (jsonBlobs.length === 0) {
      return { success: true, message: "No JSON notes found to migrate" }
    }

    let migratedCount = 0
    let failedCount = 0

    for (const blob of jsonBlobs) {
      try {
        // Fetch the JSON note
        const response = await fetch(blob.url)
        if (!response.ok) {
          failedCount++
          continue
        }

        // Parse the JSON note
        const noteData = await response.json()
        const note = noteData as Note

        // Save the note as Markdown
        await saveNoteToBlob(note)
        migratedCount++
      } catch (error) {
        console.error(`Error migrating note ${blob.url}:`, error)
        failedCount++
      }
    }

    return {
      success: true,
      message: `Migration completed. ${migratedCount} notes migrated, ${failedCount} failed.`,
    }
  } catch (error) {
    console.error("Error migrating notes:", error)
    return {
      error: "Failed to migrate notes: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}


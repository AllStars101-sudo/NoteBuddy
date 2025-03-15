"use server"

import { del, head } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { getAuthSession } from "@/lib/auth"

export async function deleteFile(url: string) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id

  try {
    // Get blob metadata to check ownership
    const blob = await head(url)

    // Check if the blob belongs to the user
    const belongsToUser = blob.pathname.startsWith(`${userId}/`) || (blob.metadata && blob.metadata.userId === userId)

    if (!belongsToUser) {
      return { error: "You do not have permission to delete this file" }
    }

    // Delete the blob
    await del(url)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting file:", error)
    return { error: "Failed to delete file" }
  }
}


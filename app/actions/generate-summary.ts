"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getAuthSession } from "@/lib/auth"
import { getCombinedContextForAI } from "@/lib/context-storage"

export async function generateNoteSummary(content: string, noteId: string) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  try {
    // Properly clean HTML content and normalize whitespace
    const plainText = content
      .replace(/<[^>]*>/g, " ") // Replace HTML tags with spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim() // Trim leading/trailing whitespace

    // More accurate content length check
    const contentLength = plainText.length

    // Log for debugging
    console.log(`Content length for summary: ${contentLength} characters`)

    // If content is too short, return a message
    if (contentLength < 50) {
      return {
        success: true,
        summary: "The note is too short to generate a meaningful summary. Add more content and try again.",
      }
    }

    // Get file context if available
    const fileContext = await getCombinedContextForAI(session.user.id, noteId)

    const systemPrompt = fileContext
      ? `You are an AI assistant specialized in summarizing notes. Use the following file context to enhance your summary:\n\n${fileContext}`
      : `You are an AI assistant specialized in summarizing notes.`

    const prompt = `
Create a concise summary of the following note content.
The summary should be 2-3 sentences that capture the main points and purpose of the note.
If the content is too short or lacks substance, indicate that more content is needed for a meaningful summary.

Note Content:
${plainText}

Summary:
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      system: systemPrompt,
      maxTokens: 150,
    })

    return {
      success: true,
      summary: text.trim(),
      usedFileContext: !!fileContext,
    }
  } catch (error) {
    console.error("Error generating summary:", error)
    return {
      error: "Failed to generate summary: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}


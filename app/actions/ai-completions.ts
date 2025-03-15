"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getAuthSession } from "@/lib/auth"
import { getCombinedContextForAI } from "@/lib/context-storage"

export async function getTextCompletion(context: string, noteId: string) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  try {
    // Get file context if available
    const fileContext = await getCombinedContextForAI(session.user.id, noteId)

    const systemPrompt = fileContext
      ? `You are an AI assistant helping with note-taking. Use the following file context to inform your completions:\n\n${fileContext}\n\nComplete the user's text in a helpful, relevant way that incorporates insights from the file context when appropriate. Only provide the completion, not the original text.`
      : `You are an AI assistant helping with note-taking. Complete the following text in a helpful, relevant way. Only provide the completion, not the original text.`

    const prompt = `
Context:
${context}

Completion:
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      system: systemPrompt,
      maxTokens: 50,
    })

    return {
      success: true,
      completion: text.trim(),
      usedFileContext: !!fileContext,
    }
  } catch (error) {
    console.error("Error generating completion:", error)
    return {
      error: "Failed to generate completion: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}


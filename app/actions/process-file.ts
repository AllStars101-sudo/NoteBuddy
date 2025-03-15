"use server"

import { getAuthSession } from "@/lib/auth"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { head } from "@vercel/blob"
import { saveFileContextToNote } from "@/lib/context-storage"

export async function processFileForContext(fileUrl: string, noteId: string) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  try {
    // Get file metadata
    const blob = await head(fileUrl)
    const contentType = blob.contentType || ""
    const fileName = blob.pathname.split("/").pop() || "file"

    // Determine file type
    const isImage = contentType.startsWith("image/")
    const isPdf = contentType === "application/pdf"
    const isDocx = contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    const isText = contentType === "text/plain"

    let extractedContent = ""

    if (isImage) {
      // For images, use GPT-4o's vision capabilities
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe the content of this image in detail for use as context in a note-taking app:",
              },
              { type: "image_url", image_url: { url: fileUrl } },
            ],
          },
        ],
        maxTokens: 500,
      })
      extractedContent = text
    } else if (isPdf || isDocx || isText) {
      // For document files, use a simpler approach
      // Fetch the file content
      const response = await fetch(fileUrl)
      const fileContent = await response.text()

      // For text files, use the content directly
      if (isText) {
        extractedContent = fileContent
      } else {
        // For PDFs and DOCXs, use GPT-4o to extract content
        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          prompt: `Extract and summarize the key information from this ${isPdf ? "PDF" : "DOCX"} file content for use as context in a note-taking app:\n\n${fileContent.substring(0, 10000)}`,
          maxTokens: 1000,
        })
        extractedContent = text
      }
    }

    // Save the extracted content to the note's context
    if (extractedContent) {
      await saveFileContextToNote(session.user.id, noteId, fileName, fileUrl, extractedContent)
      return { success: true, fileName, contentExtracted: true }
    } else {
      return { success: false, error: "Could not extract content from file" }
    }
  } catch (error) {
    console.error("Error processing file:", error)
    return { error: "Failed to process file: " + (error instanceof Error ? error.message : String(error)) }
  }
}


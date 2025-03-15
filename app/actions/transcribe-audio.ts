"use server"

import { getAuthSession } from "@/lib/auth"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { put } from "@vercel/blob"

type TranscriptionResult = {
  transcription: string
  summary: string
  keyPoints: string[]
  isLecture: boolean
  quiz?: {
    questions: {
      question: string
      options: string[]
      correctAnswer: number
    }[]
  }
}

export async function transcribeAndAnalyzeAudio(audioBlob: ArrayBuffer, noteId: string) {
  const session = await getAuthSession()

  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  try {
    // Save audio file to Vercel Blob using Buffer instead of File
    const buffer = Buffer.from(audioBlob)
    const audioPath = `recordings/${session.user.id}/${noteId}/${Date.now()}.webm`
    const blob = await put(audioPath, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: "audio/webm",
    })

    // Create FormData for Whisper API
    const formData = new FormData()

    // Use the blob URL to create a temporary file for the Whisper API
    const audioResponse = await fetch(blob.url)
    const audioArrayBuffer = await audioResponse.arrayBuffer()
    const audioBuffer = Buffer.from(audioArrayBuffer)

    // Add the buffer to FormData with proper filename and type
    formData.append("file", new Blob([audioBuffer], { type: "audio/webm" }), "recording.webm")
    formData.append("model", "whisper-1")

    const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!whisperResponse.ok) {
      const errorData = await whisperResponse.json()
      console.error("Whisper API error:", errorData)
      return { error: `Transcription failed: ${errorData.error?.message || "Unknown error"}` }
    }

    const whisperData = await whisperResponse.json()
    const transcription = whisperData.text

    // If transcription is empty or too short, return early
    if (!transcription || transcription.length < 10) {
      return { error: "Transcription is too short or empty" }
    }

    // Analyze transcription using GPT-4o-mini
    const analysisPrompt = `
I have a transcription of an audio recording. Please analyze it and provide:
1. A concise summary (2-3 sentences)
2. 3-5 key points as bullet points
3. Determine if this is a lecture or educational content (true/false)
4. If it's a lecture, generate a short quiz with 3 multiple-choice questions

Transcription:
${transcription}

Format your response as JSON with the following structure:
{
 "summary": "concise summary here",
 "keyPoints": ["point 1", "point 2", "point 3"],
 "isLecture": true/false,
 "quiz": {
   "questions": [
     {
       "question": "Question text",
       "options": ["Option A", "Option B", "Option C", "Option D"],
       "correctAnswer": 0 // Index of correct answer (0-based)
     }
   ]
 }
}
`

    const { text: analysisText } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: analysisPrompt,
      maxTokens: 1000,
    })

    // Parse the JSON response
    let analysis: TranscriptionResult
    try {
      analysis = JSON.parse(analysisText)
    } catch (error) {
      console.error("Error parsing analysis JSON:", error)
      // Attempt to extract structured data from unstructured response
      const summary = extractBetween(analysisText, '"summary":', ',"keyPoints"') || "Summary not available"
      const keyPointsRaw = extractBetween(analysisText, '"keyPoints":', ',"isLecture"') || "[]"
      const keyPoints = tryParseArray(keyPointsRaw) || ["Key points not available"]
      const isLectureStr = extractBetween(analysisText, '"isLecture":', ',"quiz"') || "false"
      const isLecture = isLectureStr.includes("true")

      analysis = {
        transcription,
        summary,
        keyPoints,
        isLecture,
      }
    }

    // Add the transcription to the result
    return {
      success: true,
      transcription,
      analysis: {
        ...analysis,
        transcription,
      },
    }
  } catch (error) {
    console.error("Error in transcribeAndAnalyzeAudio:", error)
    return { error: "Failed to process audio: " + (error instanceof Error ? error.message : String(error)) }
  }
}

// Helper function to extract data between two strings
function extractBetween(text: string, startMarker: string, endMarker: string): string | null {
  const startIndex = text.indexOf(startMarker)
  if (startIndex === -1) return null

  const endIndex = text.indexOf(endMarker, startIndex + startMarker.length)
  if (endIndex === -1) return null

  return text.substring(startIndex + startMarker.length, endIndex).trim()
}

// Helper function to try parsing an array from string
function tryParseArray(text: string): string[] | null {
  try {
    const cleaned = text.replace(/'/g, '"')
    return JSON.parse(cleaned)
  } catch (e) {
    return null
  }
}
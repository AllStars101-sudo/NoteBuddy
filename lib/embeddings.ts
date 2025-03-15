import { embed } from "ai"
import { openai } from "@ai-sdk/openai"
import { put, list, del } from "@vercel/blob"
import type { Note } from "@/lib/types"

// Constants
const EMBEDDINGS_PATH = "embeddings"

// Type for stored embeddings
export type StoredEmbedding = {
  id: string
  type: "note" | "file"
  title: string
  content: string
  embedding: number[]
  userId: string
  createdAt: string
  updatedAt: string
}

/**
 * Generate an embedding for a text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: text,
    })

    return embedding
  } catch (error) {
    console.error("Error generating embedding:", error)
    throw new Error("Failed to generate embedding")
  }
}

/**
 * Store an embedding in Vercel Blob
 */
export async function storeEmbedding(userId: string, embedding: StoredEmbedding): Promise<string> {
  try {
    const embeddingPath = `${EMBEDDINGS_PATH}/${userId}/${embedding.id}.json`

    const blob = await put(embeddingPath, JSON.stringify(embedding), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    })

    return blob.url
  } catch (error) {
    console.error("Error storing embedding:", error)
    throw new Error("Failed to store embedding")
  }
}

/**
 * Get all embeddings for a user
 */
export async function getUserEmbeddings(userId: string): Promise<StoredEmbedding[]> {
  try {
    const userEmbeddingsPath = `${EMBEDDINGS_PATH}/${userId}/`
    const { blobs } = await list({ prefix: userEmbeddingsPath })

    const embeddings: StoredEmbedding[] = []

    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url)
        if (response.ok) {
          const embedding = await response.json()
          embeddings.push(embedding)
        }
      } catch (error) {
        console.error(`Error processing embedding ${blob.url}:`, error)
      }
    }

    return embeddings
  } catch (error) {
    console.error("Error getting user embeddings:", error)
    return []
  }
}

/**
 * Delete an embedding from Vercel Blob
 */
export async function deleteEmbedding(userId: string, id: string): Promise<boolean> {
  try {
    const embeddingPath = `${EMBEDDINGS_PATH}/${userId}/${id}.json`
    const { blobs } = await list({ prefix: embeddingPath })

    if (blobs.length === 0) {
      return false
    }

    await del(blobs[0].url)
    return true
  } catch (error) {
    console.error("Error deleting embedding:", error)
    return false
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same dimensions")
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}

/**
 * Search embeddings by similarity to a query
 */
export async function searchEmbeddings(
  userId: string,
  queryEmbedding: number[],
  limit = 5,
): Promise<{ id: string; type: "note" | "file"; title: string; content: string; similarity: number }[]> {
  try {
    const embeddings = await getUserEmbeddings(userId)

    // Calculate similarity for each embedding
    const results = embeddings.map((embedding) => ({
      id: embedding.id,
      type: embedding.type,
      title: embedding.title,
      content: embedding.content,
      similarity: cosineSimilarity(queryEmbedding, embedding.embedding),
    }))

    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity)

    // Filter out low similarity results (below 0.5)
    const filteredResults = results.filter((result) => result.similarity > 0.5)

    // Return top results
    return filteredResults.slice(0, limit)
  } catch (error) {
    console.error("Error searching embeddings:", error)
    return []
  }
}

/**
 * Generate and store embeddings for a note
 */
export async function generateAndStoreNoteEmbedding(note: Note): Promise<void> {
  try {
    // Combine title and content for better semantic search
    const textToEmbed = `${note.title} ${note.content.replace(/<[^>]*>/g, " ")}`

    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed)

    // Create stored embedding object
    const storedEmbedding: StoredEmbedding = {
      id: note.id,
      type: "note",
      title: note.title,
      content: note.content.replace(/<[^>]*>/g, " ").substring(0, 200) + "...", // Store a preview
      embedding: embedding,
      userId: note.userId,
      createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt.toString(),
      updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : note.updatedAt.toString(),
    }

    // Store embedding
    await storeEmbedding(note.userId, storedEmbedding)
  } catch (error) {
    console.error("Error generating and storing note embedding:", error)
  }
}

/**
 * Generate and store embeddings for a file
 */
export async function generateAndStoreFileEmbedding(
  userId: string,
  fileId: string,
  fileName: string,
  fileContent: string,
): Promise<void> {
  try {
    // Generate embedding
    const embedding = await generateEmbedding(fileContent)

    // Create stored embedding object
    const storedEmbedding: StoredEmbedding = {
      id: fileId,
      type: "file",
      title: fileName,
      content: fileContent.substring(0, 200) + "...", // Store a preview
      embedding: embedding,
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store embedding
    await storeEmbedding(userId, storedEmbedding)
  } catch (error) {
    console.error("Error generating and storing file embedding:", error)
  }
}


export type User = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export type Note = {
  id: string
  title: string
  content: string
  userId: string
  createdAt: Date
  updatedAt: Date
  isFavorite: boolean
  hasFileContext?: boolean
}

export type FileMetadata = {
  id?: string
  name: string
  url: string
  size: number
  contentType: string
  userId: string
  noteId?: string
  uploadedAt: Date | string
}


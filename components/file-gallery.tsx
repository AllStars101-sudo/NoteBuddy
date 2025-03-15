"use client"

import { useState, useEffect } from "react"
import { listFiles } from "@/app/actions/list-files"
import { FileAttachment } from "./file-attachment"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface FileGalleryProps {
  documentId?: string
}

type FileType = {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  contentType: string
  noteId?: string
}

export function FileGallery({ documentId }: FileGalleryProps) {
  const [files, setFiles] = useState<FileType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFiles() {
      try {
        setLoading(true)
        const result = await listFiles(documentId)

        if (result.error) {
          setError(result.error)
        } else {
          setFiles(result.files)
        }
      } catch (err) {
        setError("Failed to load files")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [documentId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No files uploaded yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Attached Files</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <FileAttachment
            key={file.url}
            file={{
              name: file.pathname ? file.pathname.split("/").pop() || "File" : "File",
              url: file.url || "",
              size: file.size || 0,
              contentType: file.contentType || "",
            }}
          />
        ))}
      </div>
    </div>
  )
}


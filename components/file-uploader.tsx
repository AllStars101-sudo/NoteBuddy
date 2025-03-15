"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Upload, File, FileText, FileImage, FileIcon as FilePdf } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface FileUploaderProps {
  onClose: () => void
}

type UploadedFile = {
  id: string
  name: string
  size: number
  type: string
  progress: number
}

export function FileUploader({ onClose }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Simulate upload progress
    newFiles.forEach((file) => {
      const interval = setInterval(() => {
        setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, progress: Math.min(f.progress + 10, 100) } : f)))

        if (file.progress >= 100) {
          clearInterval(interval)
        }
      }, 300)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <FileImage className="h-6 w-6 text-blue-500" />
    if (type.includes("pdf")) return <FilePdf className="h-6 w-6 text-red-500" />
    if (type.includes("text") || type.includes("document")) return <FileText className="h-6 w-6 text-green-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Upload Files</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
        <p className="mb-1 text-center font-medium">{isDragActive ? "Drop files here" : "Drag & drop files here"}</p>
        <p className="text-center text-sm text-muted-foreground">or click to browse files</p>
        <p className="mt-2 text-xs text-muted-foreground">Supports PDFs, images, and text documents</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded Files</h3>
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary transition-all" style={{ width: `${file.progress}%` }} />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button>Insert Files</Button>
      </div>
    </div>
  )
}


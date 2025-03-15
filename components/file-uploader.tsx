"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Upload, File, FileText, FileImage, FileIcon as FilePdf, Loader2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { uploadFile } from "@/app/actions/upload-file"
import { deleteFile } from "@/app/actions/delete-file"
import { useToast } from "@/hooks/use-toast"
import { ALLOWED_FILE_EXTENSIONS } from "@/lib/blob-storage"

interface FileUploaderProps {
  onClose: () => void
  onFileUploaded?: (fileData: UploadedFile) => void
  documentId?: string
}

type UploadedFile = {
  id?: string
  name: string
  size: number
  contentType: string
  url: string
  uploadedAt: string
  noteId?: string
}

export function FileUploader({ onClose, onFileUploaded, documentId }: FileUploaderProps) {
  const [files, setFiles] = useState<(UploadedFile & { progress: number })[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true)

      for (const file of acceptedFiles) {
        // Create a temporary file entry with progress 0
        const tempFile = {
          name: file.name,
          size: file.size,
          contentType: file.type,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
          progress: 0,
        }

        setFiles((prev) => [...prev, tempFile])

        // Create FormData
        const formData = new FormData()
        formData.append("file", file)
        if (documentId) {
          formData.append("noteId", documentId)
        }

        try {
          // Start simulating progress
          const progressInterval = setInterval(() => {
            setFiles((prev) =>
              prev.map((f) => (f.name === file.name && f.progress < 90 ? { ...f, progress: f.progress + 10 } : f)),
            )
          }, 300)

          // Upload file to Vercel Blob
          const result = await uploadFile(formData)

          // Clear the progress interval
          clearInterval(progressInterval)

          if (result.error) {
            toast({
              title: "Upload failed",
              description: result.error,
              variant: "destructive",
            })

            // Remove the file from the list
            setFiles((prev) => prev.filter((f) => f.name !== file.name))
          } else {
            // Update the file with the actual URL and set progress to 100%
            setFiles((prev) =>
              prev.map((f) =>
                f.name === file.name
                  ? {
                      ...(result as UploadedFile),
                      progress: 100,
                    }
                  : f,
              ),
            )

            // Notify parent component if callback provided
            if (onFileUploaded) {
              onFileUploaded(result as UploadedFile)
            }

            toast({
              title: "File uploaded",
              description: `${file.name} has been uploaded successfully.`,
            })
          }
        } catch (error) {
          console.error("Error uploading file:", error)
          toast({
            title: "Upload failed",
            description: "An unexpected error occurred while uploading the file.",
            variant: "destructive",
          })

          // Remove the file from the list
          setFiles((prev) => prev.filter((f) => f.name !== file.name))
        }
      }

      setIsUploading(false)
    },
    [toast, onFileUploaded, documentId],
  )

  const handleDeleteFile = async (fileUrl: string, fileName: string) => {
    try {
      const result = await deleteFile(fileUrl)

      if (result.success) {
        setFiles((prev) => prev.filter((f) => f.url !== fileUrl))
        toast({
          title: "File deleted",
          description: `${fileName} has been deleted.`,
        })
      } else {
        toast({
          title: "Delete failed",
          description: result.error || "Failed to delete file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Delete failed",
        description: "An unexpected error occurred while deleting the file.",
        variant: "destructive",
      })
    }
  }

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    disabled: isUploading,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  })

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
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <Loader2 className="mb-2 h-10 w-10 text-primary animate-spin" />
        ) : (
          <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
        )}
        <p className="mb-1 text-center font-medium">
          {isDragActive ? "Drop files here" : isUploading ? "Uploading..." : "Drag & drop files here"}
        </p>
        <p className="text-center text-sm text-muted-foreground">or click to browse files</p>
        <p className="mt-2 text-xs text-muted-foreground">Allowed file types: {ALLOWED_FILE_EXTENSIONS.join(", ")}</p>
      </div>

      {fileRejections.length > 0 && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          <p className="font-medium">Some files were rejected:</p>
          <ul className="mt-1 list-disc pl-5">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name} - {errors[0].message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded Files</h3>
          {files.map((file, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.contentType)}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${file.progress === 100 ? "bg-green-500" : "bg-primary"}`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteFile(file.url, file.name)}
                    disabled={file.progress < 100}
                  >
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
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  )
}


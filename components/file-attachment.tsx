import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { File, FileText, FileImage, FileIcon as FilePdf, Download, ExternalLink } from "lucide-react"
import Image from "next/image"

interface FileAttachmentProps {
  file: {
    name: string
    url: string
    size: number | string | null | undefined
    contentType: string
  }
}

export function FileAttachment({ file }: FileAttachmentProps) {
  const formatFileSize = (bytes: number | string | null | undefined) => {
    // Convert to number if it's a string
    const size = typeof bytes === "string" ? Number(bytes) : bytes

    // Check if size is a valid number
    if (size === null || size === undefined || isNaN(size) || size === 0) {
      return "Unknown size"
    }

    // Format the size
    if (size < 1024) return size + " B"
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB"
    return (size / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (type: string | undefined) => {
    if (!type) return <File className="h-6 w-6 text-gray-500" />
    if (type.includes("image")) return <FileImage className="h-6 w-6 text-blue-500" />
    if (type.includes("pdf")) return <FilePdf className="h-6 w-6 text-red-500" />
    if (type.includes("text") || type.includes("document")) return <FileText className="h-6 w-6 text-green-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  const isImage = file.contentType && file.contentType.includes("image")

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {isImage ? (
          <div className="relative">
            <div className="aspect-video relative overflow-hidden">
              <Image src={file.url || "/placeholder.svg"} alt={file.name} fill className="object-cover" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
              <Button variant="secondary" size="sm" className="mr-2" asChild>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 h-4 w-4" />
                  View
                </a>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <a href={file.url} download={file.name}>
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center p-4">
            {getFileIcon(file.contentType)}
            <div className="ml-3 flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <Button variant="ghost" size="sm" className="ml-2" asChild>
              <a href={file.url} download={file.name}>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, MoreHorizontal, Download } from "lucide-react"
import Link from "next/link"
import { Editor } from "@/components/editor"
import { FileUploader } from "@/components/file-uploader"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function NewDocumentPage() {
  const [title, setTitle] = useState("Untitled")
  const [isFavorite, setIsFavorite] = useState(false)
  const [showFileUploader, setShowFileUploader] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none bg-transparent text-xl font-semibold focus:outline-none focus:ring-0"
              placeholder="Untitled"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? "text-yellow-500" : ""}
            >
              <Star className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setShowFileUploader(true)}>
              <Download className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl p-6">
          {showFileUploader ? <FileUploader onClose={() => setShowFileUploader(false)} /> : <Editor />}
        </div>
      </main>
    </div>
  )
}


"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, MoreHorizontal, Download, FileText } from "lucide-react"
import Link from "next/link"
import { Editor } from "@/components/editor"
import { FileUploader } from "@/components/file-uploader"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function DocumentPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState("Untitled")
  const [isFavorite, setIsFavorite] = useState(false)
  const [showFileUploader, setShowFileUploader] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // For demo purposes, we'll set a title based on the ID
  useEffect(() => {
    if (params.id === "1") {
      setTitle("Getting Started with NoteBuddy")
    } else if (params.id === "2") {
      setTitle("Project Ideas")
    } else if (params.id === "3") {
      setTitle("Meeting Notes: Team Sync")
    }
  }, [params.id])

  const getEditorContent = () => {
    const content = editorRef.current
    if (!content) return null
    
    // Find the actual editor content (ProseMirror content) without the toolbar
    const editorContent = content.querySelector('.ProseMirror') || 
                         content.querySelector('.min-h-\\[500px\\]') ||
                         content.querySelector('div[contenteditable="true"]')
    
    if (!editorContent) {
      alert('Could not find editor content')
      return null
    }
    
    return editorContent
  }

  const handleExportPDF = () => {
    const editorContent = getEditorContent()
    if (!editorContent) return
    
    // Create a style element for the PDF
    const style = document.createElement('style')
    style.textContent = `
      body { 
        font-family: Arial, sans-serif;
        padding: 40px;
        max-width: 800px;
        margin: 0 auto;
      }
      h1 { font-size: 24px; margin-bottom: 16px; }
      p { margin-bottom: 8px; }
    `
    
    // Create a new document for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups for this website')
      return
    }
    
    // Set up the print document
    printWindow.document.open()
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          ${style.outerHTML}
        </head>
        <body>
          <h1>${title}</h1>
          ${editorContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    
    // Trigger print dialog which allows saving as PDF
    setTimeout(() => {
      printWindow.print()
      // Close the window after printing (or if print is canceled)
      setTimeout(() => {
        printWindow.close()
      }, 500)
    }, 500)
  }

  const handleExportDOCX = () => {
    const editorContent = getEditorContent()
    if (!editorContent) return
    
    // Create the HTML content for the document
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
            }
            h1 { font-size: 16pt; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${editorContent.innerHTML}
        </body>
      </html>
    `

    // Create a Blob with the content
    const blob = new Blob([htmlContent], { type: 'application/msword' })
    
    // Create a link and trigger download
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${title}.doc`
    document.body.appendChild(link)
    link.click()
    
    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

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
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Export</span>
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={handleExportPDF}>
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportDOCX}>
                      DOCX
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
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
          {showFileUploader ? <FileUploader onClose={() => setShowFileUploader(false)} /> : <div ref={editorRef}><Editor /></div>}
        </div>
      </main>
    </div>
  )
}


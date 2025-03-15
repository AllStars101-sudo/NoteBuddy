"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, MoreHorizontal, FileUp, Save } from "lucide-react"
import Link from "next/link"
import { Editor } from "@/components/editor"
import { FileUploader } from "@/components/file-uploader"
import { FileGallery } from "@/components/file-gallery"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getNote, updateNote, toggleFavorite, deleteNote } from "@/app/actions/notes"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { debounce } from "lodash"

export default function DocumentPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState("Untitled")
  const [content, setContent] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [showFileUploader, setShowFileUploader] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    async function loadNote() {
      if (status === "authenticated") {
        setIsLoading(true)
        const result = await getNote(params.id)

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
          router.push("/")
        } else if (result.success && result.note) {
          setTitle(result.note.title)
          setContent(result.note.content)
          setIsFavorite(result.note.isFavorite)
        }

        setIsLoading(false)
      }
    }

    loadNote()
  }, [params.id, status, router, toast])

  // Debounced save function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (noteTitle: string, noteContent: string) => {
      setSaveStatus("saving")
      const formData = new FormData()
      formData.append("title", noteTitle)
      formData.append("content", noteContent)

      try {
        await updateNote(params.id, formData)
        setSaveStatus("saved")
      } catch (error) {
        console.error("Error saving note:", error)
        setSaveStatus("unsaved")
        toast({
          title: "Save failed",
          description: "Failed to save your note. Please try again.",
          variant: "destructive",
        })
      }
    }, 1000),
    [params.id, toast],
  )

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setSaveStatus("unsaved")
    debouncedSave(e.target.value, content)
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setSaveStatus("unsaved")
    debouncedSave(title, newContent)
  }

  const saveNote = async () => {
    setSaveStatus("saving")
    const formData = new FormData()
    formData.append("title", title)
    formData.append("content", content)

    try {
      await updateNote(params.id, formData)
      setSaveStatus("saved")
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving note:", error)
      setSaveStatus("unsaved")
      toast({
        title: "Save failed",
        description: "Failed to save your note. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(params.id)

    if (result.success) {
      setIsFavorite(result.isFavorite)
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const handleDeleteNote = async () => {
    const result = await deleteNote(params.id)

    if (result.success) {
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      })
      router.push("/")
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

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
              onChange={handleTitleChange}
              className="border-none bg-transparent text-xl font-semibold focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground mr-2">
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "unsaved" && "Unsaved"}
            </div>

            <Button variant="ghost" size="icon" onClick={saveNote} disabled={saveStatus === "saving"} title="Save note">
              <Save className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className={isFavorite ? "text-yellow-500" : ""}
            >
              <Star className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setShowFileUploader(true)}>
              <FileUp className="h-5 w-5" />
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
                <DropdownMenuItem className="text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl p-6">
          {showFileUploader ? (
            <FileUploader
              onClose={() => setShowFileUploader(false)}
              onFileUploaded={() => {
                // Refresh the file gallery when a new file is uploaded
                setActiveTab("files")
              }}
              documentId={params.id}
            />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <Editor initialContent={content} onChange={handleContentChange} />
              </TabsContent>
              <TabsContent value="files">
                <FileGallery documentId={params.id} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, MoreHorizontal, FileUp, Save } from "lucide-react"
import Link from "next/link"
import { Editor } from "@/components/editor"
import { FileUploader } from "@/components/file-uploader"
import { FileGallery } from "@/components/file-gallery"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createNote } from "@/app/actions/notes"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { debounce } from "lodash"
import { saveNoteToLocalStorage, isLocalStorageAvailable } from "@/lib/local-storage"
import { useSession } from "next-auth/react"

export default function NewDocumentPage() {
  const [title, setTitle] = useState("Untitled")
  const [content, setContent] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [showFileUploader, setShowFileUploader] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "new">("new")
  const [noteId, setNoteId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  // Save to localStorage whenever content changes
  useEffect(() => {
    if (noteId && (title !== "Untitled" || content !== "")) {
      const note = {
        id: noteId,
        title,
        content,
        userId: session?.user?.id || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite,
      }

      if (isLocalStorageAvailable()) {
        saveNoteToLocalStorage(note)
      }
    }
  }, [noteId, title, content, isFavorite, session?.user?.id])

  // Warn before unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved") {
        e.preventDefault()
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [saveStatus])

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (noteTitle: string, noteContent: string) => {
      setSaveStatus("saving")

      try {
        if (!noteId) {
          // Create a new note
          const formData = new FormData()
          formData.append("title", noteTitle)
          formData.append("content", noteContent)

          // First save to localStorage if available
          if (isLocalStorageAvailable()) {
            const tempId = Date.now().toString()
            setNoteId(tempId)

            const note = {
              id: tempId,
              title: noteTitle,
              content: noteContent,
              userId: session?.user?.id || "",
              createdAt: new Date(),
              updatedAt: new Date(),
              isFavorite: false,
            }

            saveNoteToLocalStorage(note)
            setSaveStatus("saved")
          }

          // Then save to server
          const result = await createNote(formData)

          if (result.success && result.noteId) {
            setNoteId(result.noteId)
            setSaveStatus("saved")

            // Update URL without refreshing
            window.history.replaceState({}, "", `/documents/${result.noteId}`)
          } else {
            toast({
              title: "Save failed",
              description: result.error || "Failed to save note",
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error("Error saving note:", error)
        setSaveStatus("unsaved")
        toast({
          title: "Save failed",
          description: "Failed to save your note. Your changes are stored locally.",
          variant: "destructive",
        })
      }
    }, 1000),
    [noteId, toast, session?.user?.id],
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

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)

      // Save to localStorage first
      if (isLocalStorageAvailable() && !noteId) {
        const tempId = Date.now().toString()
        setNoteId(tempId)

        const note = {
          id: tempId,
          title,
          content,
          userId: session?.user?.id || "",
          createdAt: new Date(),
          updatedAt: new Date(),
          isFavorite: false,
        }

        saveNoteToLocalStorage(note)
        setSaveStatus("saved")
      }

      // Then save to server
      const result = await createNote(formData)

      if (result.success && result.noteId) {
        setNoteId(result.noteId)
        setSaveStatus("saved")

        toast({
          title: "Note created",
          description: "Your note has been created successfully.",
        })

        // Update URL without refreshing
        window.history.replaceState({}, "", `/documents/${result.noteId}`)
      } else {
        toast({
          title: "Save failed",
          description: result.error || "Failed to save note",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving note:", error)
      setSaveStatus("unsaved")
      toast({
        title: "Save failed",
        description: "Failed to save your note.",
        variant: "destructive",
      })
    }
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
              placeholder="Untitled"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground mr-2">
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "unsaved" && "Unsaved"}
              {saveStatus === "new" && "New note"}
            </div>

            <Button variant="ghost" size="icon" onClick={saveNote} disabled={saveStatus === "saving"} title="Save note">
              <Save className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? "text-yellow-500" : ""}
              disabled={!noteId}
            >
              <Star className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setShowFileUploader(true)} disabled={!noteId}>
              <FileUp className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled={!noteId}>Export</DropdownMenuItem>
                <DropdownMenuItem disabled={!noteId}>Share</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" disabled={!noteId}>
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
          {showFileUploader && noteId ? (
            <FileUploader
              onClose={() => setShowFileUploader(false)}
              onFileUploaded={() => {
                // Refresh the file gallery when a new file is uploaded
                setActiveTab("files")
              }}
              documentId={noteId}
            />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="files" disabled={!noteId}>
                  Files
                </TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <Editor onChange={handleContentChange} noteId={noteId || ""} />
              </TabsContent>
              <TabsContent value="files">
                {noteId ? (
                  <FileGallery documentId={noteId} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Save the note first to upload files.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}


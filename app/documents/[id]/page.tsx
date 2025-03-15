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
import { exportNoteAsMarkdown } from "@/lib/export-utils"
import { ConflictResolutionDialog } from "@/components/conflict-resolution-dialog"
import {
  saveNoteToLocalStorage,
  getNoteFromLocalStorage,
  isLocalStorageAvailable,
  deleteNoteFromLocalStorage,
} from "@/lib/local-storage"
import { checkForConflicts, getMostUpToDateNote } from "@/lib/sync-service"

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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [conflictData, setConflictData] = useState<{
    localNote: any
    remoteNote: any
  } | null>(null)

  // Load note on initial render
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    async function loadNote() {
      if (status === "authenticated" && !initialLoadComplete && session?.user?.id) {
        setIsLoading(true)

        try {
          // First check for conflicts
          const { hasConflict, localNote, remoteNote } = await checkForConflicts(session.user.id, params.id)

          if (hasConflict && localNote && remoteNote) {
            // Show conflict resolution dialog
            setConflictData({ localNote, remoteNote })
            setShowConflictDialog(true)
            setIsLoading(false)
            return
          }

          // Get the most up-to-date version
          const note = await getMostUpToDateNote(session.user.id, params.id)

          if (!note) {
            // Try to get from server as fallback
            const result = await getNote(params.id)

            if (result.error) {
              toast({
                title: "Error loading note",
                description: result.error,
                variant: "destructive",
              })
              router.push("/")
            } else if (result.success && result.note) {
              setTitle(result.note.title)
              setContent(result.note.content)
              setIsFavorite(result.note.isFavorite)

              // Save to localStorage for offline access
              if (isLocalStorageAvailable()) {
                saveNoteToLocalStorage(result.note)
              }

              setInitialLoadComplete(true)
            }
          } else {
            // Use the note from local or remote storage
            setTitle(note.title)
            setContent(note.content)
            setIsFavorite(note.isFavorite)
            setInitialLoadComplete(true)
          }
        } catch (error) {
          console.error("Error loading note:", error)
          toast({
            title: "Error loading note",
            description: "Failed to load the note. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadNote()
  }, [params.id, status, router, toast, initialLoadComplete, session?.user?.id])

  // Save to localStorage whenever content changes
  useEffect(() => {
    if (initialLoadComplete && session?.user?.id) {
      const note = {
        id: params.id,
        title,
        content,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite,
      }

      if (isLocalStorageAvailable()) {
        saveNoteToLocalStorage(note)
      }
    }
  }, [initialLoadComplete, title, content, isFavorite, params.id, session?.user?.id])

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

  // Debounced save function with improved error handling
  const debouncedSave = useCallback(
    debounce(async (noteTitle: string, noteContent: string) => {
      if (!params.id || !session?.user?.id) return

      setSaveStatus("saving")

      // Always save to localStorage first
      if (isLocalStorageAvailable()) {
        const note = {
          id: params.id,
          title: noteTitle,
          content: noteContent,
          userId: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isFavorite,
        }

        saveNoteToLocalStorage(note)
        setSaveStatus("saved")
      }

      // Then try to save to server
      try {
        const formData = new FormData()
        formData.append("title", noteTitle)
        formData.append("content", noteContent)

        const result = await updateNote(params.id, formData)

        if (result.error) {
          console.error("Save error:", result.error)

          // Only show toast for errors that aren't related to invalid time
          if (!result.error.includes("Invalid time value")) {
            toast({
              title: "Save failed",
              description: result.error,
              variant: "destructive",
            })
          } else {
            // Try one more time with a small delay to allow for state updates
            setTimeout(async () => {
              const retryFormData = new FormData()
              retryFormData.append("title", noteTitle)
              retryFormData.append("content", noteContent)
              await updateNote(params.id, retryFormData)
            }, 500)
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
    [params.id, toast, isFavorite, session?.user?.id],
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
    if (!session?.user?.id) return

    setSaveStatus("saving")

    // Always save to localStorage first
    if (isLocalStorageAvailable()) {
      const note = {
        id: params.id,
        title,
        content,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite,
      }

      saveNoteToLocalStorage(note)
      setSaveStatus("saved")
    }

    // Then try to save to server
    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)

      const result = await updateNote(params.id, formData)

      if (result.error) {
        toast({
          title: "Save failed",
          description: result.error || "Failed to save note, but your changes are saved locally.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Note saved",
          description: "Your note has been saved successfully.",
        })
      }
    } catch (error) {
      console.error("Error saving note:", error)
      setSaveStatus("unsaved")
      toast({
        title: "Save failed",
        description: "Failed to save your note to the server, but your changes are stored locally.",
        variant: "destructive",
      })
    }
  }

  const handleToggleFavorite = async () => {
    setIsFavorite(!isFavorite)

    // Update in localStorage
    if (isLocalStorageAvailable() && session?.user?.id) {
      const localNote = getNoteFromLocalStorage(params.id)
      if (localNote) {
        localNote.isFavorite = !isFavorite
        saveNoteToLocalStorage(localNote)
      }
    }

    // Try to update on server
    const result = await toggleFavorite(params.id)

    if (!result.success) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const handleDeleteNote = async () => {
    // Delete from localStorage first
    if (isLocalStorageAvailable()) {
      deleteNoteFromLocalStorage(params.id)
    }

    // Then try to delete from server
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
        description: result.error || "Failed to delete from server, but deleted locally.",
        variant: "destructive",
      })
      // Still navigate away since it's deleted locally
      router.push("/")
    }
  }

  const handleExportNote = () => {
    if (title && content && session?.user?.id) {
      const noteToExport = {
        id: params.id,
        title,
        content,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: isFavorite,
      }
      exportNoteAsMarkdown(noteToExport)
    }
  }

  const handleResolveConflict = async (resolvedNote: any) => {
    if (!session?.user?.id) return

    setShowConflictDialog(false)
    setTitle(resolvedNote.title)
    setContent(resolvedNote.content)
    setIsFavorite(resolvedNote.isFavorite)

    // Save the resolved version to both localStorage and server
    if (isLocalStorageAvailable()) {
      saveNoteToLocalStorage(resolvedNote)
    }

    try {
      const formData = new FormData()
      formData.append("title", resolvedNote.title)
      formData.append("content", resolvedNote.content)

      const result = await updateNote(params.id, formData)

      if (result.success) {
        toast({
          title: "Conflict resolved",
          description: "Your note has been updated successfully.",
        })
      } else {
        toast({
          title: "Save failed",
          description: "Failed to save resolved note to server, but your changes are saved locally.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving resolved note:", error)
    }

    setInitialLoadComplete(true)
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
                <DropdownMenuItem onClick={handleExportNote}>Export as Markdown</DropdownMenuItem>
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
                <Editor initialContent={content} onChange={handleContentChange} noteId={params.id} />
              </TabsContent>
              <TabsContent value="files">
                <FileGallery documentId={params.id} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Delete confirmation dialog */}
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

      {/* Conflict resolution dialog */}
      {conflictData && (
        <ConflictResolutionDialog
          open={showConflictDialog}
          onOpenChange={setShowConflictDialog}
          localNote={conflictData.localNote}
          remoteNote={conflictData.remoteNote}
          onResolve={handleResolveConflict}
          onCancel={() => {
            setShowConflictDialog(false)
            router.push("/")
          }}
        />
      )}
    </div>
  )
}


"use client"

import { useState } from "react"
import type { Note } from "@/lib/types"
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
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/date-utils"

interface ConflictResolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  localNote: Note | null
  remoteNote: Note | null
  onResolve: (resolvedNote: Note) => void
  onCancel: () => void
}

export function ConflictResolutionDialog({
  open,
  onOpenChange,
  localNote,
  remoteNote,
  onResolve,
  onCancel,
}: ConflictResolutionDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("local")
  const [mergedContent, setMergedContent] = useState<string>("")
  const [isMerging, setIsMerging] = useState<boolean>(false)

  if (!localNote || !remoteNote) {
    return null
  }

  const handleUseLocal = () => {
    onResolve(localNote)
  }

  const handleUseRemote = () => {
    onResolve(remoteNote)
  }

  const handleMerge = () => {
    setIsMerging(true)
    setMergedContent(`
# ${localNote.title}

## Local Version (${formatDate(localNote.updatedAt, true)})
${localNote.content}

## Remote Version (${formatDate(remoteNote.updatedAt, true)})
${remoteNote.content}
    `)
  }

  const handleSaveMerged = () => {
    const mergedNote: Note = {
      ...localNote,
      content: mergedContent,
      updatedAt: new Date(),
    }
    onResolve(mergedNote)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Version Conflict Detected</AlertDialogTitle>
          <AlertDialogDescription>
            There are differences between the local and server versions of this note. Please choose which version you
            want to keep or merge them manually.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isMerging ? (
          <div className="space-y-4">
            <textarea
              className="w-full h-96 p-4 border rounded-md"
              value={mergedContent}
              onChange={(e) => setMergedContent(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsMerging(false)}>
                Cancel Merge
              </Button>
              <Button onClick={handleSaveMerged}>Save Merged Version</Button>
            </div>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="local">Local Version</TabsTrigger>
                <TabsTrigger value="remote">Server Version</TabsTrigger>
              </TabsList>
              <TabsContent value="local" className="border rounded-md p-4 h-64 overflow-auto">
                <div className="text-sm text-muted-foreground mb-2">
                  Last updated: {formatDate(localNote.updatedAt, true)}
                </div>
                <div dangerouslySetInnerHTML={{ __html: localNote.content }} />
              </TabsContent>
              <TabsContent value="remote" className="border rounded-md p-4 h-64 overflow-auto">
                <div className="text-sm text-muted-foreground mb-2">
                  Last updated: {formatDate(remoteNote.updatedAt, true)}
                </div>
                <div dangerouslySetInnerHTML={{ __html: remoteNote.content }} />
              </TabsContent>
            </Tabs>

            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
              <Button variant="outline" onClick={handleMerge}>
                Merge Manually
              </Button>
              <Button variant="secondary" onClick={handleUseRemote}>
                Use Server Version
              </Button>
              <AlertDialogAction onClick={handleUseLocal}>Use Local Version</AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}


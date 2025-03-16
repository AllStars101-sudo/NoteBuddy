"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { FileText, FileDown, Loader2 } from "lucide-react"
import { exportNoteAsMarkdown, exportNoteAsPDF, exportNoteAsDocx } from "@/lib/export-utils"
import { useToast } from "@/hooks/use-toast"
import type { Note } from "@/lib/types"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: Note
  editorElementId?: string
}

export function ExportDialog({ open, onOpenChange, note, editorElementId }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<"markdown" | "pdf" | "docx">("markdown")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      setIsExporting(true)

      switch (exportFormat) {
        case "markdown":
          exportNoteAsMarkdown(note)
          break
        case "pdf":
          await exportNoteAsPDF(note, editorElementId)
          break
        case "docx":
          await exportNoteAsDocx(note)
          break
      }

      toast({
        title: "Export successful",
        description: `Your note has been exported as ${exportFormat.toUpperCase()}.`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error(`Error exporting as ${exportFormat}:`, error)
      toast({
        title: "Export failed",
        description: `Failed to export your note as ${exportFormat.toUpperCase()}.`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Note</DialogTitle>
          <DialogDescription>Choose a format to export your note.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={exportFormat}
            onValueChange={(value) => setExportFormat(value as any)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
              <RadioGroupItem value="markdown" id="markdown" />
              <Label htmlFor="markdown" className="flex flex-1 items-center gap-2 font-normal">
                <FileText className="h-4 w-4" />
                <div>
                  <p className="font-medium">Markdown (.md)</p>
                  <p className="text-xs text-muted-foreground">
                    Plain text format with simple formatting. Best for GitHub and other markdown editors.
                  </p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex flex-1 items-center gap-2 font-normal">
                <FileText className="h-4 w-4" />
                <div>
                  <p className="font-medium">PDF (.pdf)</p>
                  <p className="text-xs text-muted-foreground">
                    Portable Document Format. Best for sharing and printing with preserved formatting.
                  </p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
              <RadioGroupItem value="docx" id="docx" />
              <Label htmlFor="docx" className="flex flex-1 items-center gap-2 font-normal">
                <FileText className="h-4 w-4" />
                <div>
                  <p className="font-medium">Word Document (.docx)</p>
                  <p className="text-xs text-muted-foreground">
                    Microsoft Word format. Best for editing in word processors.
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
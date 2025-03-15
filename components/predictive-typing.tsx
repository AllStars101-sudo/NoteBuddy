"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getTextCompletion } from "@/app/actions/ai-completions"
import { useToast } from "@/hooks/use-toast"
import { debounce } from "lodash"
import { FileText } from "lucide-react"

interface PredictiveTypingProps {
  editorContent: string
  cursorPosition: number
  cursorCoords?: { x: number; y: number } | null
  onAcceptSuggestion: (suggestion: string) => void
  isActive: boolean
  noteId: string
}

export function PredictiveTyping({
  editorContent,
  cursorPosition,
  cursorCoords,
  onAcceptSuggestion,
  isActive,
  noteId,
}: PredictiveTypingProps) {
  const [suggestion, setSuggestion] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [usesFileContext, setUsesFileContext] = useState<boolean>(false)
  const { toast } = useToast()
  const suggestionBoxRef = useRef<HTMLDivElement>(null)

  // Add positioning logic
  const [boxPosition, setBoxPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  // Update position when cursor coordinates change
  useEffect(() => {
    if (cursorCoords && suggestionBoxRef.current) {
      // Calculate position to ensure the box stays within viewport
      const box = suggestionBoxRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Start with position at cursor
      let left = cursorCoords.x
      let top = cursorCoords.y + 20 // 20px below cursor

      // Adjust if would go off right edge
      if (left + box.width > viewportWidth - 20) {
        left = Math.max(20, viewportWidth - box.width - 20)
      }

      // Adjust if would go off bottom edge
      if (top + box.height > viewportHeight - 20) {
        top = Math.max(20, cursorCoords.y - box.height - 10) // Position above cursor
      }

      setBoxPosition({ top, left })
    }
  }, [cursorCoords])

  // Debounced function to get completions
  const debouncedGetCompletion = useCallback(
    debounce(async (content: string, position: number) => {
      if (!isActive || !content || position <= 0 || !noteId) {
        setSuggestion("")
        return
      }

      setIsLoading(true)

      try {
        // Get the text up to the cursor position
        const contextText = content.substring(0, position)

        // Don't request suggestions for very short text
        if (contextText.trim().length < 10) {
          setSuggestion("")
          setIsLoading(false)
          return
        }

        const result = await getTextCompletion(contextText, noteId)

        if (result.error) {
          console.error("Completion error:", result.error)
          setSuggestion("")
          setUsesFileContext(false)
        } else if (result.completion) {
          setSuggestion(result.completion)
          setUsesFileContext(result.usedFileContext || false)
        }
      } catch (error) {
        console.error("Error getting completion:", error)
        setSuggestion("")
        setUsesFileContext(false)
      } finally {
        setIsLoading(false)
      }
    }, 500),
    [isActive, noteId],
  )

  // Get completions when content or cursor position changes
  useEffect(() => {
    debouncedGetCompletion(editorContent, cursorPosition)

    return () => {
      debouncedGetCompletion.cancel()
    }
  }, [editorContent, cursorPosition, debouncedGetCompletion])

  // Handle keyboard events globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Accept suggestion on Tab key
      if (e.key === "Tab" && suggestion && isActive) {
        e.preventDefault()
        onAcceptSuggestion(suggestion)
        setSuggestion("")
      }

      // Dismiss suggestion on Escape key
      if (e.key === "Escape" && suggestion) {
        e.preventDefault()
        setSuggestion("")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [suggestion, onAcceptSuggestion, isActive])

  if (!suggestion || !isActive) {
    return null
  }

  return (
    <AnimatePresence>
      {suggestion && (
        <motion.div
          ref={suggestionBoxRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="predictive-typing-suggestion rounded-md border bg-card/95 backdrop-blur-sm p-3 shadow-lg fixed"
          style={{
            top: `${boxPosition.top}px`,
            left: `${boxPosition.left}px`,
            zIndex: 100,
            maxWidth: "350px",
          }}
        >
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>AI suggestion:</span>
            {usesFileContext && (
              <span className="flex items-center text-xs text-cyan-600 dark:text-cyan-400 ml-2">
                <FileText className="h-3 w-3 mr-1" />
                Using file context
              </span>
            )}
          </div>
          <p className="text-card-foreground font-medium">{suggestion}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs">Tab</kbd>
            <span>to accept</span>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs">Esc</kbd>
            <span>to dismiss</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, RefreshCw, X, FileText } from "lucide-react"
import { generateNoteSummary } from "@/app/actions/generate-summary"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface NoteSummaryProps {
  content: string
  isVisible: boolean
  noteId: string
}

export function NoteSummary({ content, isVisible, noteId }: NoteSummaryProps) {
  const [summary, setSummary] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(true)
  const [hasInitialSummary, setHasInitialSummary] = useState<boolean>(false)
  const [usesFileContext, setUsesFileContext] = useState<boolean>(false)
  const [initialLoadAttempted, setInitialLoadAttempted] = useState<boolean>(false)
  const { toast } = useToast()
  const initialContentRef = useRef<string>(content)
  const contentChangeCountRef = useRef<number>(0)

  // Try to generate summary on initial load if content is available and feature is visible
  useEffect(() => {
    if (isVisible && noteId && content && !initialLoadAttempted && content.length > 100) {
      setInitialLoadAttempted(true)
      // Add a small delay to ensure content is fully loaded
      const timer = setTimeout(() => {
        generateSummary(content)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isVisible, noteId, content, initialLoadAttempted])

  // Only generate summary when content changes significantly
  useEffect(() => {
    if (!isVisible) return

    // Skip the initial render
    if (initialContentRef.current === content) return

    // Track significant content changes (more than 100 characters difference)
    const contentDiff = Math.abs(initialContentRef.current.length - content.length)
    if (contentDiff > 100) {
      contentChangeCountRef.current += 1
      initialContentRef.current = content

      // Only auto-generate summary after significant changes and if we already have a summary
      if (hasInitialSummary && contentChangeCountRef.current % 3 === 0) {
        generateSummary(content)
      }
    }
  }, [content, isVisible, hasInitialSummary, noteId])

  // Reset summary when visibility changes to false
  useEffect(() => {
    if (!isVisible) {
      setSummary("")
      setHasInitialSummary(false)
      setUsesFileContext(false)
      setInitialLoadAttempted(false)
    }
  }, [isVisible])

  const generateSummary = async (noteContent: string) => {
    if (!isVisible || !noteId) return

    setIsLoading(true)

    try {
      // Ensure we're working with a string
      const contentToProcess = typeof noteContent === "string" ? noteContent : ""

      const result = await generateNoteSummary(contentToProcess, noteId)

      if (result.error) {
        console.error("Summary error:", result.error)
        toast({
          title: "Summary generation failed",
          description: "Could not generate a summary at this time.",
          variant: "destructive",
        })
      } else if (result.summary) {
        setSummary(result.summary)
        setIsExpanded(true)
        setHasInitialSummary(true)
        setUsesFileContext(result.usedFileContext || false)
      }
    } catch (error) {
      console.error("Error generating summary:", error)
      toast({
        title: "Summary generation failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    generateSummary(content)
  }

  if (!isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 overflow-hidden"
        >
          <div className="summary-container relative rounded-lg p-0.5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 animate-gradient-x"></div>
            <div className="relative bg-background/95 backdrop-blur-sm rounded-md p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <h3 className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">AI SUMMARY</h3>
                  {usesFileContext && (
                    <span className="flex items-center text-xs text-cyan-600 dark:text-cyan-400 ml-1">
                      <FileText className="h-3 w-3 mr-1" />
                      Using file context
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {summary ? (
                <p className="text-sm leading-relaxed">{summary}</p>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></span>
                      Generating summary...
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p>No summary yet. Click the Generate button to create one.</p>
                      <Button variant="outline" size="sm" className="w-fit text-xs" onClick={handleRefresh}>
                        Generate Summary
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


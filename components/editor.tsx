"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Code, Quote, Mic, X } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { PredictiveTyping } from "@/components/predictive-typing"
import { CursorPosition } from "@/lib/tiptap-extensions"
import { useSettings } from "@/components/providers/settings-provider"
import { PredictiveTypingToggle } from "@/components/predictive-typing-toggle"
import { NoteSummary } from "@/components/note-summary"
import { SummaryToggle } from "@/components/summary-toggle"
import { getFileContextsForNote } from "@/lib/context-storage"
import { useSession } from "next-auth/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AudioRecorder } from "@/components/audio-recorder"
import { TranscriptionView } from "@/components/transcription-view"
import { motion, AnimatePresence } from "framer-motion"
import { debounce } from "lodash"
import { BrainCircuit } from "lucide-react"

interface EditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  noteId?: string
}

export function Editor({ initialContent = "", onChange, noteId = "" }: EditorProps) {
  const [cursorPosition, setCursorPosition] = useState<number>(0)
  const [editorContent, setEditorContent] = useState<string>("")
  const [shouldGenerateSummary, setShouldGenerateSummary] = useState<boolean>(false)
  const [hasFileContext, setHasFileContext] = useState<boolean>(false)
  const [showRecorder, setShowRecorder] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [transcriptionData, setTranscriptionData] = useState<any>(null)
  const [showTranscriptionView, setShowTranscriptionView] = useState<boolean>(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const { isPredictiveTypingEnabled, isSummaryEnabled } = useSettings()
  const { data: session } = useSession()
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null)

  // Check if the note has file context
  useEffect(() => {
    if (noteId && session?.user?.id) {
      const checkFileContext = async () => {
        const contexts = await getFileContextsForNote(session.user.id, noteId)
        setHasFileContext(contexts.length > 0)
      }

      checkFileContext()
    }
  }, [noteId, session?.user?.id])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing or type "/" for commands...',
      }),
      CursorPosition.configure({
        onUpdate: ({ from, text }) => {
          setCursorPosition(from)
        },
      }),
    ],
    content:
      initialContent ||
      `
      <h1>Welcome to NoteBuddy</h1>
      <p>This is a simple note-taking app inspired by Notion. You can:</p>
      <ul>
        <li>Create and format notes</li>
        <li>Upload files</li>
        <li>Search across your notes</li>
        <li>Organize your content</li>
      </ul>
      <p>Start typing to create your content!</p>
    `,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
      setEditorContent(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      const { from } = editor.state.selection
      setCursorPosition(from)
    },
  })

  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent)
      setEditorContent(initialContent)
    }
  }, [editor, initialContent])

  // Trigger summary generation when the toggle is turned on
  useEffect(() => {
    if (shouldGenerateSummary) {
      setShouldGenerateSummary(false)
    }
  }, [shouldGenerateSummary])

  const handleSummaryToggleOn = useCallback(() => {
    setShouldGenerateSummary(true)
  }, [])

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run()
  }, [editor])

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run()
  }, [editor])

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run()
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run()
  }, [editor])

  const toggleHeading1 = useCallback(() => {
    editor?.chain().focus().toggleHeading({ level: 1 }).run()
  }, [editor])

  const toggleHeading2 = useCallback(() => {
    editor?.chain().focus().toggleHeading({ level: 2 }).run()
  }, [editor])

  const toggleCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run()
  }, [editor])

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run()
  }, [editor])

  const handleAcceptSuggestion = useCallback(
    (suggestion: string) => {
      if (editor) {
        editor.chain().focus().insertContent(suggestion).run()
      }
    },
    [editor],
  )

  const handleToggleRecorder = useCallback(() => {
    setShowRecorder((prev) => !prev)
    if (showTranscriptionView) {
      setShowTranscriptionView(false)
    }
  }, [showTranscriptionView])

  const handleTranscriptionComplete = useCallback((data: any) => {
    setTranscriptionData(data.analysis)
    setShowTranscriptionView(true)
    setShowRecorder(false)
  }, [])

  const handleCloseTranscriptionView = useCallback(() => {
    setShowTranscriptionView(false)
    setTranscriptionData(null)
  }, [])

  const handleRecordingStart = useCallback(() => {
    setIsRecording(true)
  }, [])

  const handleRecordingStop = useCallback(() => {
    setIsRecording(false)
  }, [])

  const insertTranscriptionContent = useCallback(
    (content: string) => {
      if (editor) {
        // Insert content at current cursor position
        editor.chain().focus().insertContent(content).run()

        // Optionally scroll to the insertion point
        const { state } = editor
        const { selection } = state
        const { from } = selection

        // Calculate position for scrolling
        if (editorRef.current) {
          const { view } = editor
          const coords = view.coordsAtPos(from)

          if (coords) {
            // Smooth scroll to the insertion point
            editorRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            })
          }
        }
      }
    },
    [editor],
  )

  const calculateCursorPosition = useCallback(() => {
    if (editor) {
      const { view } = editor
      const { state } = view
      const { selection } = state
      const { from } = selection

      // Get coordinates
      const start = view.coordsAtPos(from)

      if (start) {
        setCursorCoords({ x: start.left, y: start.top })
      }
    }
  }, [editor])

  // Add debounced version of the function
  const debouncedCalculateCursorPosition = useCallback(debounce(calculateCursorPosition, 100), [
    calculateCursorPosition,
  ])

  // Update the onSelectionUpdate callback
  useEffect(() => {
    if (editor) {
      editor.on("selectionUpdate", ({ editor }) => {
        const { from } = editor.state.selection
        setCursorPosition(from)
        debouncedCalculateCursorPosition()
      })

      return () => {
        editor.off("selectionUpdate")
      }
    }
  }, [editor, debouncedCalculateCursorPosition])

  // Also track cursor position on keydown
  useEffect(() => {
    if (editor && editorRef.current) {
      const handleKeyDown = () => {
        debouncedCalculateCursorPosition()
      }

      editorRef.current.addEventListener("keydown", handleKeyDown)

      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener("keydown", handleKeyDown)
        }
      }
    }
  }, [editor, debouncedCalculateCursorPosition])

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Enhanced toolbar with AI-focused design */}
      <div className="flex flex-wrap gap-1 rounded-lg border bg-background/50 backdrop-blur-sm p-1 z-20 relative">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={toggleBold} className={editor.isActive("bold") ? "bg-muted" : ""}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleItalic}
            className={editor.isActive("italic") ? "bg-muted" : ""}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBulletList}
            className={editor.isActive("bulletList") ? "bg-muted" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleOrderedList}
            className={editor.isActive("orderedList") ? "bg-muted" : ""}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleHeading1}
            className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleHeading2}
            className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCodeBlock}
            className={editor.isActive("codeBlock") ? "bg-muted" : ""}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBlockquote}
            className={editor.isActive("blockquote") ? "bg-muted" : ""}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {hasFileContext && (
            <div className="tooltip-wrapper">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-xs text-violet-400 px-2 py-1 rounded-md bg-violet-500/10 ai-glow">
                      <BrainCircuit className="h-3.5 w-3.5 mr-1" />
                      <span>AI Context Active</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>AI features are using context from your files</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          <div className="tooltip-wrapper">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showRecorder || isRecording ? "default" : "ghost"}
                    size="sm"
                    onClick={handleToggleRecorder}
                    className={`relative ${
                      isRecording ? "bg-violet-500 hover:bg-violet-600 text-white ai-recording-waves" : "ai-mic-button"
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Record Voice Note</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="tooltip-wrapper">
            <SummaryToggle onToggleOn={handleSummaryToggleOn} />
          </div>

          <div className="tooltip-wrapper">
            <PredictiveTypingToggle />
          </div>
        </div>
      </div>

      {/* Voice recorder with enhanced AI design */}
      <AnimatePresence>
        {showRecorder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4 z-20 relative"
          >
            <div className="ai-gradient-border">
              <div className="bg-background/95 backdrop-blur-sm rounded-[0.7rem] p-4">
                <AudioRecorder
                  noteId={noteId}
                  onTranscriptionComplete={handleTranscriptionComplete}
                  onRecordingStart={handleRecordingStart}
                  onRecordingStop={handleRecordingStop}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcription View - MOVED above the summary */}
      <AnimatePresence>
        {showTranscriptionView && transcriptionData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="transcription-container mb-6 z-20"
          >
            <div className="ai-gradient-border">
              <div className="frosted-glass rounded-[0.7rem] overflow-hidden">
                <div className="transcription-header">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse"></div>
                    <h3 className="text-base font-medium bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                      Voice Transcription Analysis
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseTranscriptionView}
                    className="h-7 w-7 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="transcription-content">
                  <TranscriptionView
                    data={transcriptionData}
                    onClose={handleCloseTranscriptionView}
                    onInsertContent={insertTranscriptionContent}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area with AI features */}
      <div className="relative min-h-[500px] neural-bg">
        {/* AI Summary Panel */}
        <div ref={summaryRef} className="mb-6 z-10 relative">
          <NoteSummary content={editorContent} isVisible={isSummaryEnabled} noteId={noteId} />
        </div>

        {/* Note Editor */}
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="ai-gradient-border"
        >
          <div className="bg-background/95 backdrop-blur-sm rounded-[0.7rem] h-full">
            <EditorContent editor={editor} className="min-h-[500px] p-4" ref={editorRef} />
          </div>
        </motion.div>

        {/* Predictive typing with AI styling */}
        <div className="absolute bottom-4 right-4 z-50">
          <PredictiveTyping
            editorContent={editorContent}
            cursorPosition={cursorPosition}
            cursorCoords={cursorCoords}
            onAcceptSuggestion={handleAcceptSuggestion}
            isActive={isPredictiveTypingEnabled}
            noteId={noteId}
          />
        </div>
      </div>
    </div>
  )
}


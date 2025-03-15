"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Code, Quote } from "lucide-react"
import { useCallback } from "react"

export function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing or type "/" for commands...',
      }),
    ],
    content: `
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
  })

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

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1 rounded-lg border bg-background p-1">
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

      <EditorContent editor={editor} className="min-h-[500px] rounded-lg border p-4" />
    </div>
  )
}


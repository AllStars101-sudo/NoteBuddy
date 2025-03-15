import type { Note } from "@/lib/types"

/**
 * Exports a note as a downloadable Markdown file
 */
export function exportNoteAsMarkdown(note: Note): void {
  // Create markdown content
  const markdown = [`# ${note.title}`, "", note.content].join("\n")

  // Create a blob with the markdown content
  const blob = new Blob([markdown], { type: "text/markdown" })

  // Create a URL for the blob
  const url = URL.createObjectURL(blob)

  // Create a link element
  const a = document.createElement("a")
  a.href = url
  a.download = `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`

  // Append the link to the body
  document.body.appendChild(a)

  // Click the link to trigger the download
  a.click()

  // Clean up
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}


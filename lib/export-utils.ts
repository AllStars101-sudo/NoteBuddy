import type { Note } from "@/lib/types"
import { jsPDF } from "jspdf"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx"
import html2canvas from "html2canvas"
import { parseHTML } from "@/lib/html-parser"

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

/**
 * Exports a note as a downloadable PDF file
 */
export async function exportNoteAsPDF(note: Note, elementId?: string): Promise<void> {
  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Add title
    pdf.setFontSize(24)
    pdf.text(note.title, 20, 20)
    pdf.setFontSize(12)

    // If an element ID is provided, use html2canvas to capture the rendered note
    if (elementId) {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error("Element not found")
      }

      // Use html2canvas to capture the rendered note
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      // Add the canvas as an image to the PDF
      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 10, 30, 190, 0)
    } else {
      // Parse HTML content to plain text with basic formatting
      const parsedContent = parseHTML(note.content)

      // Add content with line breaks
      pdf.text(parsedContent, 20, 30, {
        maxWidth: 170,
        lineHeightFactor: 1.5,
      })
    }

    // Save the PDF
    pdf.save(`${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`)
  } catch (error) {
    console.error("Error exporting note as PDF:", error)
    throw error
  }
}

/**
 * Exports a note as a downloadable DOCX file
 */
export async function exportNoteAsDocx(note: Note): Promise<void> {
  try {
    // Parse HTML content to structured format for DOCX
    const parsedContent = parseHTML(note.content)

    // Create a new Document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: note.title,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: parsedContent,
                  size: 24, // 12pt
                }),
              ],
              spacing: {
                line: 360, // 1.5 line spacing
              },
            }),
          ],
        },
      ],
    })

    // Generate the DOCX file
    const buffer = await Packer.toBuffer(doc)
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })

    // Create a URL for the blob
    const url = URL.createObjectURL(blob)

    // Create a link element
    const a = document.createElement("a")
    a.href = url
    a.download = `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.docx`

    // Append the link to the body
    document.body.appendChild(a)

    // Click the link to trigger the download
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting note as DOCX:", error)
    throw error
  }
}
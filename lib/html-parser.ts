/**
 * Simple HTML parser to convert HTML to plain text while preserving basic structure
 */
export function parseHTML(html: string): string {
    // Create a temporary div element
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
  
    // Replace common HTML elements with text equivalents
    // Replace headings
    const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6")
    headings.forEach((heading) => {
      const level = Number.parseInt(heading.tagName.substring(1))
      const prefix = "#".repeat(level) + " "
      heading.textContent = `\n${prefix}${heading.textContent}\n`
    })
  
    // Replace lists
    const listItems = tempDiv.querySelectorAll("li")
    listItems.forEach((item) => {
      const isOrderedList = item.parentElement?.tagName === "OL"
      const prefix = isOrderedList ? "1. " : "• "
      item.textContent = `${prefix}${item.textContent}`
    })
  
    // Replace paragraphs
    const paragraphs = tempDiv.querySelectorAll("p")
    paragraphs.forEach((p) => {
      p.textContent = `${p.textContent}\n`
    })
  
    // Replace line breaks
    const lineBreaks = tempDiv.querySelectorAll("br")
    lineBreaks.forEach((br) => {
      br.replaceWith(document.createTextNode("\n"))
    })
  
    // Get the text content
    let text = tempDiv.textContent || ""
  
    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, "\n\n")
  
    return text
  }
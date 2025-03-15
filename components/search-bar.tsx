"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Mock search results
  const searchResults = [
    { id: "1", title: "Getting Started with NoteBuddy", type: "note" },
    { id: "2", title: "Project Ideas", type: "note" },
    { id: "3", title: "Meeting Notes: Team Sync", type: "note" },
    { id: "file1", title: "presentation.pdf", type: "file" },
    { id: "file2", title: "research-paper.docx", type: "file" },
  ].filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-md sm:w-64 md:w-80"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="text-muted-foreground">Search notes and files...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search notes and files..." value={search} onValueChange={setSearch} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Notes">
            {searchResults
              .filter((item) => item.type === "note")
              .map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    setOpen(false)
                    // Navigate to the note
                    window.location.href = `/documents/${result.id}`
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {result.title}
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="Files">
            {searchResults
              .filter((item) => item.type === "file")
              .map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    setOpen(false)
                    // Handle file selection
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {result.title}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}


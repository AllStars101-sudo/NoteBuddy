"use client"

import { UserProfile } from "@/components/user-profile"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import type { Note } from "@/lib/types"

export function Sidebar({ notes }: { notes: Note[] }) {
  return (
    <aside className="hidden w-64 border-r bg-muted/40 p-4 md:block">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">NoteBuddy</h1>
          <p className="text-sm text-muted-foreground">Your personal note-taking app</p>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>

      <div className="mb-4">
        <Button asChild className="w-full justify-start">
          <Link href="/documents/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Note
          </Link>
        </Button>
      </div>

      <div className="space-y-1">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Documents</h2>
        <nav className="flex flex-col space-y-1">
          {notes.map((note) => (
            <Button
              key={note.id}
              variant="ghost"
              className="justify-start"
              asChild
            >
              <Link href={`/documents/${note.id}`}>{note.title}</Link>
            </Button>
          ))}
          {notes.length === 0 && (
            <p className="px-4 text-sm text-muted-foreground">No documents yet</p>
          )}
        </nav>
      </div>
    </aside>
  )
} 
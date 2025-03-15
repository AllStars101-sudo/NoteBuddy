import { Button } from "@/components/ui/button"
import { PlusCircle, Bot } from "lucide-react"
import Link from "next/link"
import { DocumentCard } from "@/components/document-card"
import { SearchBar } from "@/components/search-bar"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/40 p-4 md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold flex items-center gap-2">
            NoteBuddy
            <Bot className="h-7 w-7" />
          </h1>
          <p className="text-sm text-muted-foreground">Your personal note-taking app</p>
        </div>

        <Button asChild className="mb-6 w-full justify-start gap-2">
          <Link href="/documents/new">
            <PlusCircle className="h-4 w-4" />
            New Note
          </Link>
        </Button>

        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/">All Notes</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/favorites">Favorites</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/trash">Trash</Link>
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Notes</h2>
            <SearchBar />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/documents/new" className="block">
              <div className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center hover:bg-muted/50">
                <PlusCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Create new note</p>
              </div>
            </Link>

            <DocumentCard
              id="1"
              title="Getting Started with NoteBuddy"
              excerpt="Learn how to use NoteBuddy to organize your notes and documents."
              updatedAt="2 hours ago"
            />

            <DocumentCard
              id="2"
              title="Project Ideas"
              excerpt="Brainstorming session for upcoming projects and initiatives."
              updatedAt="Yesterday"
            />

            <DocumentCard
              id="3"
              title="Meeting Notes: Team Sync"
              excerpt="Weekly team sync discussion points and action items."
              updatedAt="3 days ago"
            />
          </div>
        </div>
      </main>
    </div>
  )
}


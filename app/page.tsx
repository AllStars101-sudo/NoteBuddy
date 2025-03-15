import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { DocumentCard } from "@/components/document-card"
import { SearchBar } from "@/components/search-bar"
import { UserProfile } from "@/components/user-profile"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { listUserNotes } from "@/lib/blob-storage"

export default async function Home() {
  const session = await getAuthSession()

  if (!session?.user) {
    redirect("/login")
  }

  // Get user's notes from Blob storage
  const notes = await listUserNotes(session.user.id)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/40 p-4 md:block">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">NoteBuddy</h1>
            <p className="text-sm text-muted-foreground">Your personal note-taking app</p>
          </div>
          <UserProfile />
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
            <div className="flex items-center gap-4">
              <SearchBar />
              <div className="md:hidden">
                <UserProfile />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/documents/new" className="block">
              <div className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center hover:bg-muted/50">
                <PlusCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Create new note</p>
              </div>
            </Link>

            {notes.length > 0 ? (
              notes.map((note) => (
                <DocumentCard
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  excerpt={note.content.replace(/<[^>]*>/g, "").substring(0, 100) + "..."}
                  updatedAt={new Date(note.updatedAt).toLocaleString()}
                />
              ))
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}


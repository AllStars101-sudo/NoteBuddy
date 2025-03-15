import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { listUserNotes } from "@/lib/blob-storage"
import { NoteSearch } from "@/components/note-search"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function SearchPage() {
  const session = await getAuthSession()

  if (!session?.user) {
    redirect("/login")
  }

  // Get all user notes
  const notes = await listUserNotes(session.user.id)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-4">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Search Notes</h1>
          </div>

          <NoteSearch notes={notes} />
        </div>
      </main>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { migrateJsonNotesToMarkdown } from "@/app/actions/migrate-notes"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isMigrating, setIsMigrating] = useState(false)

  // Only allow authenticated users
  if (status === "unauthenticated") {
    redirect("/login")
  }

  const handleMigrateNotes = async () => {
    try {
      setIsMigrating(true)
      const result = await migrateJsonNotesToMarkdown()

      if (result.error) {
        toast({
          title: "Migration Failed",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Migration Successful",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        title: "Migration Failed",
        description: "An unexpected error occurred during migration.",
        variant: "destructive",
      })
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Reuse the sidebar from the main page */}
      <aside className="hidden w-64 border-r bg-muted/40 p-4 md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold">NoteBuddy</h1>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>

        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/">Back to Notes</a>
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-2xl font-bold">Admin Tools</h2>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Note Storage Migration</CardTitle>
                <CardDescription>
                  Migrate existing JSON notes to Markdown format. This process may take some time depending on the
                  number of notes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will convert all your existing notes from JSON format to Markdown (.md) files. The migration is
                  non-destructive - your original JSON notes will remain until you delete them.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleMigrateNotes} disabled={isMigrating}>
                  {isMigrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    "Migrate Notes to Markdown"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}


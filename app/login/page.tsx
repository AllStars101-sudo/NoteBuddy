"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()

  const callbackUrl = searchParams?.get("callbackUrl") || "/"

  // If already authenticated, redirect to home
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setError("")

      await signIn("auth0", {
        callbackUrl,
        redirect: true,
      })
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during sign in")
      setIsLoading(false)
    }
  }

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  // Only show login page if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">NoteBuddy</CardTitle>
            <CardDescription>Sign in to access your notes and files</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="mb-4 h-24 w-24">
              <img src="/placeholder.svg?height=96&width=96" alt="NoteBuddy Logo" className="h-full w-full" />
            </div>
            {error && (
              <div className="mb-4 w-full rounded-md bg-destructive/15 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}
            <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in with Auth0"
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            <p>Secure note-taking for your personal and work life</p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return null
}


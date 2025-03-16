"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, CheckCircle, Brain, FileText, Sparkles } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading NoteBuddy...</p>
        </div>
      </div>
    )
  }

  // Only show login page if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-screen flex-col lg:flex-row">
            {/* Left side - Hero content */}
            <div className="flex flex-1 flex-col justify-center py-12 lg:py-24 lg:pr-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 flex items-center"
              >
                <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Brain className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NoteBuddy</h1>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
              >
                <span className="block">Note-taking</span>
                <span className="block text-indigo-600 dark:text-indigo-400">That Doesn't Suck</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-10 max-w-lg text-lg text-gray-600 dark:text-gray-300"
              >
                NoteBuddy unleashes the power of Artificial Intelligence to help you
                capture, organize, and enhance your ideas.
              </motion.p>

              {/* Feature list */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-10 grid gap-6 md:grid-cols-2"
              >
                <div className="flex items-start">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Predictive Typing</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      Get intelligent completions and summaries as you write
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Smart File Context</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      Upload files and NoteBuddy will understand their content
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Voice Mode</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      Record thoughts and convert them to structured notes
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <ArrowRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Seamless Sync</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      Access your notes from anywhere, even offline
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right side - Login form */}
            <div className="flex flex-1 items-center justify-center py-12 lg:py-24">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl dark:bg-gray-800"
              >
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Sign up to start taking smarter notes</p>
                </div>

                <div className="mb-8 flex justify-center">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 animate-gradient-x"></div>
                    <div className="absolute inset-1 flex items-center justify-center rounded-full bg-white dark:bg-gray-800">
                      <Brain className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 rounded-md bg-red-50 p-4 text-center text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="relative w-full overflow-hidden bg-indigo-600 py-6 text-lg font-medium hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign Up
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity group-hover:opacity-20"></div>
                    </>
                  )}
                </Button>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  By signing up, you agree to our{" "}
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Privacy Policy
                  </a>
                </p>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <footer className="py-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} NoteBuddy. All rights reserved under the GPL 2.0 License.</p>
          </footer>
        </div>
      </div>
    )
  }

  return null
}
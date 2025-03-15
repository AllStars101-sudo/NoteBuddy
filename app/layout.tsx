import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/providers/session-provider"
import { SettingsProvider } from "@/components/providers/settings-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NoteBuddy",
  description: "A note-taking app inspired by Notion",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <SettingsProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
              <Toaster />
            </ThemeProvider>
          </SettingsProvider>
        </SessionProvider>
      </body>
    </html>
  )
}



import './globals.css'
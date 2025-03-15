"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface SettingsContextType {
  isPredictiveTypingEnabled: boolean
  isSummaryEnabled: boolean
  togglePredictiveTyping: () => void
  toggleSummary: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Default to false for both features
  const [isPredictiveTypingEnabled, setIsPredictiveTypingEnabled] = useState<boolean>(false)
  const [isSummaryEnabled, setIsSummaryEnabled] = useState<boolean>(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("notebuddy_settings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (typeof settings.isPredictiveTypingEnabled === "boolean") {
          setIsPredictiveTypingEnabled(settings.isPredictiveTypingEnabled)
        }
        if (typeof settings.isSummaryEnabled === "boolean") {
          setIsSummaryEnabled(settings.isSummaryEnabled)
        }
      } catch (error) {
        console.error("Error parsing settings:", error)
      }
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      "notebuddy_settings",
      JSON.stringify({
        isPredictiveTypingEnabled,
        isSummaryEnabled,
      }),
    )
  }, [isPredictiveTypingEnabled, isSummaryEnabled])

  const togglePredictiveTyping = () => {
    setIsPredictiveTypingEnabled((prev) => !prev)
  }

  const toggleSummary = () => {
    setIsSummaryEnabled((prev) => !prev)
  }

  return (
    <SettingsContext.Provider
      value={{
        isPredictiveTypingEnabled,
        isSummaryEnabled,
        togglePredictiveTyping,
        toggleSummary,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}


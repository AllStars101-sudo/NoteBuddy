"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Zap } from "lucide-react"
import { useSettings } from "@/components/providers/settings-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SummaryToggleProps {
  onToggleOn?: () => void
}

export function SummaryToggle({ onToggleOn }: SummaryToggleProps) {
  const { isSummaryEnabled, toggleSummary } = useSettings()
  const [isHovered, setIsHovered] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Trigger animation when state changes
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  const handleToggle = () => {
    const newState = !isSummaryEnabled
    toggleSummary()
    setIsAnimating(true)

    // If toggling on, trigger the callback
    if (newState && onToggleOn) {
      onToggleOn()
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 ${
              isSummaryEnabled
                ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/40"
                : "text-muted-foreground hover:bg-muted/80"
            }`}
            aria-label={isSummaryEnabled ? "Disable AI summary" : "Enable AI summary"}
          >
            <div className="relative">
              {/* Main icon */}
              <motion.div
                initial={{ scale: 1 }}
                animate={{
                  scale: isAnimating ? [1, 1.2, 1] : 1,
                  rotate: isAnimating ? [0, 10, -10, 0] : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <FileText className="h-5 w-5" />
              </motion.div>

              {/* Lightning animation when enabled */}
              {isSummaryEnabled && (
                <motion.div
                  className="absolute -right-1.5 -top-1.5 text-indigo-500"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: isAnimating || isHovered ? 1 : 0.7,
                    scale: isAnimating ? [0, 1, 0.8] : isHovered ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Zap className="h-3 w-3" />
                </motion.div>
              )}
            </div>

            {/* Status indicator dot */}
            <span
              className={`absolute right-1 top-1 h-2 w-2 rounded-full ${
                isSummaryEnabled ? "bg-indigo-500" : "bg-gray-400"
              }`}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isSummaryEnabled ? "Disable AI summary" : "Enable AI summary"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}


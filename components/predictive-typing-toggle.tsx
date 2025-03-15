"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, Brain } from "lucide-react"
import { useSettings } from "@/components/providers/settings-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PredictiveTypingToggle() {
  const { isPredictiveTypingEnabled, togglePredictiveTyping } = useSettings()
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
    togglePredictiveTyping()
    setIsAnimating(true)
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
              isPredictiveTypingEnabled
                ? "bg-cyan-100 text-cyan-600 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-800/40"
                : "text-muted-foreground hover:bg-muted/80"
            }`}
            aria-label={isPredictiveTypingEnabled ? "Disable AI suggestions" : "Enable AI suggestions"}
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
                <Brain className="h-5 w-5" />
              </motion.div>

              {/* Sparkles animation when enabled */}
              {isPredictiveTypingEnabled && (
                <>
                  <motion.div
                    className="absolute -right-1 -top-1 text-cyan-500"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: isAnimating || isHovered ? 1 : 0.7,
                      scale: isAnimating ? [0, 1, 0.8] : isHovered ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-1 -left-1 text-cyan-500"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: isAnimating || isHovered ? 1 : 0.7,
                      scale: isAnimating ? [0, 1, 0.8] : isHovered ? 1 : 0.8,
                      rotate: isAnimating ? [0, -15, 0] : 0,
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                </>
              )}
            </div>

            {/* Status indicator dot */}
            <span
              className={`absolute right-1 top-1 h-2 w-2 rounded-full ${
                isPredictiveTypingEnabled ? "bg-cyan-500" : "bg-gray-400"
              }`}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isPredictiveTypingEnabled ? "Disable AI suggestions" : "Enable AI suggestions"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}


import { CpuIcon, ZapIcon, BatteryFullIcon } from "lucide-react"

interface RobotLogoProps {
  className?: string
  size?: number
}

export function RobotLogo({ className = "", size = 96 }: RobotLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary rounded-xl flex items-center justify-center">
        <div className="relative w-4/5 h-4/5 bg-background rounded-lg flex flex-col items-center justify-center border-2 border-primary/30">
          {/* Robot eyes */}
          <div className="flex gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          </div>

          {/* Robot mouth */}
          <div className="w-8 h-1.5 bg-primary/70 rounded-full mt-1"></div>

          {/* Robot antenna */}
          <div className="absolute -top-4 w-1.5 h-4 bg-primary/80 rounded-full">
            <div className="absolute -top-1.5 w-3 h-3 rounded-full bg-primary/80 flex items-center justify-center">
              <ZapIcon className="w-2 h-2 text-background" />
            </div>
          </div>

          {/* Robot details */}
          <CpuIcon className="absolute bottom-2 right-2 w-4 h-4 text-primary/70" />
          <BatteryFullIcon className="absolute bottom-2 left-2 w-4 h-4 text-primary/70" />
        </div>
      </div>
    </div>
  )
}


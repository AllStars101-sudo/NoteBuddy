"use client"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function SearchButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push("/search")
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleClick}>
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search Notes</span>
    </Button>
  )
}


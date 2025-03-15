"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X, FileText, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/date-utils"
import { searchNotes, createSearchIndex, type SearchResultWithHighlight } from "@/lib/search-utils"
import type { Note } from "@/lib/types"
import type Fuse from "fuse.js"

interface NoteSearchProps {
  notes: Note[]
  className?: string
}

export function NoteSearch({ notes, className = "" }: NoteSearchProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<SearchResultWithHighlight[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchIndex, setSearchIndex] = useState<Fuse<Note> | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Initialize search index
  useEffect(() => {
    if (notes.length > 0) {
      setSearchIndex(createSearchIndex(notes))
    }
  }, [notes])

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches))
      } catch (e) {
        console.error("Failed to parse recent searches:", e)
      }
    }
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim() || !searchIndex) {
      setResults([])
      return
    }

    setIsSearching(true)

    // Use setTimeout to prevent UI blocking for large datasets
    setTimeout(() => {
      const searchResults = searchNotes(searchIndex, debouncedQuery)
      setResults(searchResults)
      setIsSearching(false)
    }, 0)
  }, [debouncedQuery, searchIndex])

  // Save search to recent searches
  const saveToRecentSearches = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    const updatedSearches = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5) // Keep only 5 most recent searches

    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  // Clear search
  const handleClearSearch = () => {
    setQuery("")
    setResults([])
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Handle result click
  const handleResultClick = (noteId: string) => {
    saveToRecentSearches(query)
    router.push(`/documents/${noteId}`)
  }

  // Handle recent search click
  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search notes..."
            value={query}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Recent searches */}
        {!query && recentSearches.length > 0 && (
          <Card className="mt-2">
            <CardContent className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">Recent Searches</div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleRecentSearchClick(search)}
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    {search}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search results */}
      {isSearching ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Searching...</span>
        </div>
      ) : query && results.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No notes found matching "{query}"</p>
          <p className="text-sm text-muted-foreground mt-2">Try using different keywords or check your spelling</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm font-medium">
            Found {results.length} {results.length === 1 ? "result" : "results"}
          </div>

          {results.map((result) => (
            <Card
              key={result.note.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleResultClick(result.note.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-medium line-clamp-1">{result.note.title || "Untitled Note"}</h3>
                </div>

                <div
                  className="text-sm text-muted-foreground line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: result.preview }}
                />

                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                  <span>Last updated: {formatDate(result.note.updatedAt)}</span>
                  {result.note.isFavorite && (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                      Favorite
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}


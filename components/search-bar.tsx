"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Search, File, FileText, Calendar, Star, Clock, SortAsc, Loader2, X, AlertCircle } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { searchContent, getRecentSearches, saveSearchQuery } from "@/app/actions/search"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/date-utils"
import type { SearchResult, SearchOptions } from "@/app/actions/search"

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"relevance" | "date">("relevance")
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    types: ["note", "file"],
    sortBy: "relevance",
    limit: 30,
  })
  const [searchAttempted, setSearchAttempted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load recent searches when the dialog opens
  useEffect(() => {
    if (open) {
      loadRecentSearches()
    }
  }, [open])

  // Handle keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Debounce the query to avoid too many requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [query])

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery)
    } else {
      setResults([])
      setSearchAttempted(false)
    }
  }, [debouncedQuery, searchOptions])

  // Load recent searches
  const loadRecentSearches = async () => {
    try {
      const response = await getRecentSearches()
      if ("searches" in response) {
        setRecentSearches(response.searches)
      } else {
        console.error("Error loading recent searches:", response.error)
      }
    } catch (error) {
      console.error("Error loading recent searches:", error)
    }
  }

  // Perform search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsLoading(false)
      setSearchAttempted(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setSearchAttempted(true)

    try {
      console.log(`[UI] Searching for: "${searchQuery}" with options:`, searchOptions)
      const response = await searchContent(searchQuery, searchOptions)

      if ("error" in response) {
        console.error(`[UI] Search error:`, response.error)
        setError(response.error)
        setResults([])
      } else {
        console.log(`[UI] Search returned ${response.results.length} results`)
        setResults(response.results)
      }
    } catch (err) {
      console.error("[UI] Search error:", err)
      setError("An error occurred while searching. Please try again.")
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Retry search with different options
  const retrySearch = () => {
    // Try with more permissive options
    setSearchOptions((prev) => ({
      ...prev,
      limit: 50, // Increase limit
    }))

    // Force a new search
    performSearch(query)
  }

  // Handle search input changes
  const handleSearch = (value: string) => {
    setQuery(value)
  }

  // Handle item selection
  const handleSelect = (id: string, type: "note" | "file") => {
    setOpen(false)

    // Save the search query
    if (query.trim()) {
      saveSearchQuery(query)
    }

    if (type === "note") {
      router.push(`/documents/${id}`)
    } else if (type === "file") {
      // For files, we'll open them in a new tab
      window.open(id, "_blank")
    }
  }

  // Handle recent search selection
  const handleRecentSearchSelect = (search: string) => {
    setQuery(search)
    performSearch(search)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update search options based on tab
    if (value === "all") {
      setSearchOptions((prev) => ({ ...prev, types: ["note", "file"] }))
    } else if (value === "notes") {
      setSearchOptions((prev) => ({ ...prev, types: ["note"] }))
    } else if (value === "files") {
      setSearchOptions((prev) => ({ ...prev, types: ["file"] }))
    }
  }

  // Handle sort change
  const handleSortChange = (value: "relevance" | "date") => {
    setSortBy(value)
    setSearchOptions((prev) => ({ ...prev, sortBy: value }))
  }

  // Format the relevance score as a percentage
  const formatRelevance = (score: number) => {
    return `${Math.round(score * 100)}%`
  }

  // Filter results based on active tab
  const filteredResults =
    activeTab === "all"
      ? results
      : activeTab === "notes"
        ? results.filter((result) => result.type === "note")
        : results.filter((result) => result.type === "file")

  return (
    <>
      {/* Make the search bar more prominent */}
      <div className="w-full rounded-lg border bg-card shadow-sm">
        <Button
          variant="ghost"
          className="relative h-12 w-full justify-start rounded-lg px-4 py-3 text-base"
          onClick={() => setOpen(true)}
        >
          <Search className="mr-3 h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">Search notes and files...</span>
          <kbd className="pointer-events-none absolute right-4 top-3 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="fixed top-[20%] translate-y-0 translate-x-[-50%] left-1/2 max-w-2xl w-full"
      >
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            ref={inputRef}
            placeholder="Search notes and files..."
            value={query}
            onValueChange={handleSearch}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            autoFocus
          />
          {query && (
            <Button variant="ghost" className="h-6 w-6 p-0 rounded-md" onClick={() => setQuery("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="border-b">
          <div className="flex items-center justify-between p-2">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-auto">
              <TabsList className="grid w-auto grid-cols-3">
                <TabsTrigger value="all" className="px-3 py-1 text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="notes" className="px-3 py-1 text-xs">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="files" className="px-3 py-1 text-xs">
                  Files
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    <SortAsc className="mr-1 h-3.5 w-3.5" />
                    {sortBy === "relevance" ? "Relevance" : "Date"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuCheckboxItem
                    checked={sortBy === "relevance"}
                    onCheckedChange={() => handleSortChange("relevance")}
                  >
                    Relevance
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortBy === "date"}
                    onCheckedChange={() => handleSortChange("date")}
                  >
                    Date
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <CommandList>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Searching...</span>
            </div>
          ) : error ? (
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center py-6 text-destructive">
                <AlertCircle className="mb-2 h-8 w-8" />
                <p className="text-center font-medium">{error}</p>
                <p className="mt-1 text-sm text-muted-foreground">There was an error with your search</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={retrySearch}>
                  Try Again
                </Button>
              </div>
            </CommandEmpty>
          ) : query && searchAttempted && filteredResults.length === 0 ? (
            <CommandEmpty>
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Try searching with different keywords or check your spelling
                </p>
                <div className="mt-4 flex justify-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleTabChange("all")}>
                    Search All Content
                  </Button>
                  <Button variant="outline" size="sm" onClick={retrySearch}>
                    Try Again
                  </Button>
                </div>
              </div>
            </CommandEmpty>
          ) : query ? (
            <>
              {filteredResults.filter((result) => result.type === "note").length > 0 && (
                <CommandGroup heading="Notes">
                  {filteredResults
                    .filter((result) => result.type === "note")
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result.id, result.type)}
                        className="flex flex-col items-start py-3"
                      >
                        <div className="flex w-full items-center">
                          <FileText className="mr-2 h-4 w-4 text-primary" />
                          <span className="flex-1 truncate font-medium">{result.title}</span>
                          <div className="flex items-center space-x-2">
                            {result.metadata?.isFavorite && <Star className="h-3.5 w-3.5 text-yellow-500" />}
                            <span className="text-xs text-muted-foreground">{formatRelevance(result.score)}</span>
                          </div>
                        </div>
                        <div className="ml-6 mt-1 text-xs text-muted-foreground line-clamp-2 w-full">
                          <span dangerouslySetInnerHTML={{ __html: result.snippet }} />
                        </div>
                        <div className="ml-6 mt-1 flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>{formatDate(result.updatedAt)}</span>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}

              {filteredResults.filter((result) => result.type === "file").length > 0 && (
                <CommandGroup heading="Files">
                  {filteredResults
                    .filter((result) => result.type === "file")
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result.id, result.type)}
                        className="flex flex-col items-start py-3"
                      >
                        <div className="flex w-full items-center">
                          <File className="mr-2 h-4 w-4 text-blue-500" />
                          <span className="flex-1 truncate font-medium">{result.title}</span>
                          <span className="text-xs text-muted-foreground">{formatRelevance(result.score)}</span>
                        </div>
                        <div className="ml-6 mt-1 text-xs text-muted-foreground w-full">
                          {result.metadata?.contentType}
                        </div>
                        <div className="ml-6 mt-1 flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>{formatDate(result.updatedAt)}</span>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </>
          ) : (
            <>
              {recentSearches.length > 0 && (
                <CommandGroup heading="Recent Searches">
                  {recentSearches.map((search, index) => (
                    <CommandItem key={index} onSelect={() => handleRecentSearchSelect(search)}>
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {search}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator />

              <CommandGroup heading="Search Tips">
                <CommandItem className="py-3">
                  <div className="flex flex-col space-y-2 w-full">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        Tip
                      </Badge>
                      <span className="text-sm">Use quotes for exact phrases</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Example: "meeting notes" will find exact matches
                    </div>
                  </div>
                </CommandItem>
                <CommandItem className="py-3">
                  <div className="flex flex-col space-y-2 w-full">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        Tip
                      </Badge>
                      <span className="text-sm">Use filters to narrow results</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Select "Notes" or "Files" tabs to filter by content type
                    </div>
                  </div>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}


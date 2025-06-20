
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Clock, ArrowRight, Hash, FileText, CheckSquare } from "lucide-react"
import { useSearch } from "@/hooks/useSearch"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

export function EnhancedSearch() {
  const [open, setOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const { searchTerm, setSearchTerm, results, loading } = useSearch()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse recent searches:', error)
      }
    }
  }, [])

  // Save recent searches
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return
    
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recent-searches', JSON.stringify(updated))
  }

  const handleResultClick = (result: any) => {
    saveRecentSearch(searchTerm)
    navigate(result.url)
    setOpen(false)
    setSearchTerm('')
  }

  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term)
    inputRef.current?.focus()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recent-searches')
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'app':
        return Hash
      case 'task':
        return CheckSquare
      case 'note':
        return FileText
      default:
        return FileText
    }
  }

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'app':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
      case 'task':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
      case 'note':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-sm font-normal",
            "bg-background hover:bg-accent hover:text-accent-foreground",
            "h-8 sm:h-9"
          )}
        >
          <Search className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="hidden sm:inline-flex">Search everything...</span>
          <span className="sm:hidden">Search...</span>
          <div className="ml-auto hidden sm:flex items-center gap-1">
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 hidden md:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] sm:w-[400px] md:w-[500px] p-0" 
        align="start"
        side="bottom"
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search apps, tasks, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 p-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
          
          <CommandList className="max-h-[300px] sm:max-h-[400px]">
            {searchTerm.trim() === '' ? (
              <div className="p-4">
                {recentSearches.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Recent searches</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="h-6 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((term, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRecentSearchClick(term)}
                          className="w-full justify-start h-8 text-sm font-normal"
                        >
                          <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                          {term}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>Start typing to search</p>
                    <p className="text-xs mt-1">Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘K</kbd> to search anywhere</p>
                  </div>
                )}
              </div>
            ) : loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  Searching...
                </div>
              </div>
            ) : results.length > 0 ? (
              <CommandGroup heading="Search Results">
                {results.map((result) => {
                  const Icon = getResultIcon(result.type)
                  return (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      onSelect={() => handleResultClick(result)}
                      className="cursor-pointer p-3"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">{result.title}</span>
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs", getResultTypeColor(result.type))}
                            >
                              {result.type}
                            </Badge>
                          </div>
                          {result.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          {result.app_name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              in {result.app_name}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : (
              <CommandEmpty>
                <div className="text-center py-6">
                  <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">No results found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try searching for apps, tasks, or notes
                  </p>
                </div>
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

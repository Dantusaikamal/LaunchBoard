
import { useState, useRef, useEffect } from 'react'
import { Search, Clock, FileText, CheckSquare, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSearch } from '@/hooks/useSearch'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function EnhancedSearch() {
  const { searchTerm, setSearchTerm, results, loading } = useSearch()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'app': return ExternalLink
      case 'task': return CheckSquare
      case 'note': return FileText
      default: return Clock
    }
  }

  const getResultColor = (type: string) => {
    switch (type) {
      case 'app': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'task': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'note': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          navigate(results[selectedIndex].url)
          setIsOpen(false)
          setSearchTerm('')
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setSelectedIndex(-1)
  }, [results])

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search apps, tasks, notes..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (searchTerm.trim() || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 animate-fade-in shadow-lg border-2">
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching...
              </div>
            )}

            {!loading && results.length === 0 && searchTerm.trim() && (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{searchTerm}"
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="py-2">
                {results.map((result, index) => {
                  const Icon = getResultIcon(result.type)
                  const isSelected = index === selectedIndex
                  
                  return (
                    <div
                      key={`${result.type}-${result.id}`}
                      className={cn(
                        "px-4 py-3 cursor-pointer transition-all duration-150 hover:bg-muted border-l-4 border-transparent",
                        isSelected && "bg-muted border-l-blue-500"
                      )}
                      onClick={() => {
                        navigate(result.url)
                        setIsOpen(false)
                        setSearchTerm('')
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{result.title}</p>
                            <Badge variant="secondary" className={cn("text-xs", getResultColor(result.type))}>
                              {result.type}
                            </Badge>
                          </div>
                          {result.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {result.description}
                            </p>
                          )}
                          {result.app_name && result.type !== 'app' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              in {result.app_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


import { useState, useEffect, useMemo } from 'react'
import { useApps } from './useApps'
import { supabase } from '@/integrations/supabase/client'

export interface SearchResult {
  id: string
  type: 'app' | 'task' | 'note'
  title: string
  description?: string
  url: string
  app_id?: string
  app_name?: string
}

export function useSearch() {
  const { apps } = useApps()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const searchEverything = async (term: string) => {
    if (!term.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const searchResults: SearchResult[] = []

      // Search apps
      const appResults = apps
        .filter(app => 
          app.name.toLowerCase().includes(term.toLowerCase()) ||
          app.description?.toLowerCase().includes(term.toLowerCase())
        )
        .map(app => ({
          id: app.id,
          type: 'app' as const,
          title: app.name,
          description: app.description || undefined,
          url: `/apps/${app.id}`
        }))

      searchResults.push(...appResults)

      // Search tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          app_id,
          apps!inner(name)
        `)
        .or(`title.ilike.%${term}%,description.ilike.%${term}%`)

      if (tasks) {
        const taskResults = tasks.map(task => ({
          id: task.id,
          type: 'task' as const,
          title: task.title,
          description: task.description || undefined,
          url: `/apps/${task.app_id}`,
          app_id: task.app_id,
          app_name: (task.apps as any)?.name
        }))
        searchResults.push(...taskResults)
      }

      // Search notes
      const { data: notes } = await supabase
        .from('notes')
        .select(`
          id,
          title,
          content,
          app_id,
          apps!inner(name)
        `)
        .or(`title.ilike.%${term}%,content.ilike.%${term}%`)

      if (notes) {
        const noteResults = notes.map(note => ({
          id: note.id,
          type: 'note' as const,
          title: note.title || 'Untitled Note',
          description: note.content.substring(0, 100) + '...',
          url: `/apps/${note.app_id}`,
          app_id: note.app_id,
          app_name: (note.apps as any)?.name
        }))
        searchResults.push(...noteResults)
      }

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useMemo(() => {
    const timeoutId = setTimeout(() => {
      searchEverything(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, apps])

  useEffect(() => {
    return debouncedSearch
  }, [debouncedSearch])

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading
  }
}

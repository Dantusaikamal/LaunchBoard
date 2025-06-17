
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface Idea {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  status: 'brainstorm' | 'research' | 'validation' | 'development' | 'launched' | 'archived'
  rating: number
  market_size?: string
  target_audience?: string
  viability_score?: number
  tags?: string[]
  created_at: string
  updated_at: string
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setIdeas(data || [])
    } catch (error) {
      console.error('Error fetching ideas:', error)
      toast.error('Failed to load ideas')
    } finally {
      setLoading(false)
    }
  }

  const createIdea = async (ideaData: Partial<Idea>) => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .insert([ideaData])
        .select()
        .single()

      if (error) throw error
      
      setIdeas(prev => [data, ...prev])
      toast.success('Idea created successfully!')
      return data
    } catch (error) {
      console.error('Error creating idea:', error)
      toast.error('Failed to create idea')
    }
  }

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setIdeas(prev => prev.map(idea => idea.id === id ? data : idea))
      toast.success('Idea updated successfully!')
      return data
    } catch (error) {
      console.error('Error updating idea:', error)
      toast.error('Failed to update idea')
    }
  }

  const deleteIdea = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setIdeas(prev => prev.filter(idea => idea.id !== id))
      toast.success('Idea deleted successfully!')
    } catch (error) {
      console.error('Error deleting idea:', error)
      toast.error('Failed to delete idea')
    }
  }

  useEffect(() => {
    fetchIdeas()
  }, [])

  return {
    ideas,
    loading,
    createIdea,
    updateIdea,
    deleteIdea,
    refetch: fetchIdeas
  }
}

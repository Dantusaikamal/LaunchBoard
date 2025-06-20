
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useAuth } from './useAuth'
import { Tables } from '@/integrations/supabase/types'

// Use the Supabase generated type as the base and extend it
type IdeaRow = Tables<'ideas'>

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

// Helper function to convert Supabase row to our Idea type
const convertToIdea = (row: IdeaRow): Idea => ({
  ...row,
  status: row.status as Idea['status'],
  description: row.description || '',
  market_size: row.market_size || undefined,
  target_audience: row.target_audience || undefined,
  viability_score: row.viability_score || undefined,
  tags: row.tags || undefined,
  rating: row.rating || 0
})

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchIdeas = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const convertedIdeas = (data || []).map(convertToIdea)
      setIdeas(convertedIdeas)
    } catch (error) {
      console.error('Error fetching ideas:', error)
      toast.error('Failed to load ideas')
    } finally {
      setLoading(false)
    }
  }

  const createIdea = async (ideaData: Omit<Idea, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('You must be logged in to create ideas')
      return
    }

    try {
      const { data, error } = await supabase
        .from('ideas')
        .insert([{
          ...ideaData,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error
      
      const convertedIdea = convertToIdea(data)
      setIdeas(prev => [convertedIdea, ...prev])
      toast.success('Idea created successfully!')
      return convertedIdea
    } catch (error) {
      console.error('Error creating idea:', error)
      toast.error('Failed to create idea')
    }
  }

  const updateIdea = async (id: string, updates: Partial<Omit<Idea, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      toast.error('You must be logged in to update ideas')
      return
    }

    try {
      const { data, error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      const convertedIdea = convertToIdea(data)
      setIdeas(prev => prev.map(idea => idea.id === id ? convertedIdea : idea))
      toast.success('Idea updated successfully!')
      return convertedIdea
    } catch (error) {
      console.error('Error updating idea:', error)
      toast.error('Failed to update idea')
    }
  }

  const deleteIdea = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete ideas')
      return
    }

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
  }, [user])

  return {
    ideas,
    loading,
    createIdea,
    updateIdea,
    deleteIdea,
    refetch: fetchIdeas
  }
}

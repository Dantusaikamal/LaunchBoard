
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

export interface App {
  id: string
  user_id: string
  name: string
  description: string | null
  status: 'idea' | 'building' | 'deployed' | 'live' | 'retired'
  tech_stack: string[] | null
  created_at: string
  updated_at: string
  repo_url: string | null
  frontend_url: string | null
  backend_url: string | null
  deployment_url: string | null
  logo_url: string | null
  logo?: string
  screenshots?: string[]
  monthly_revenue: number
  users_count: number
}

export function useApps() {
  const { user } = useAuth()
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)

  const fetchApps = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Type cast the data to match our App interface
      const typedApps = data?.map(app => ({
        ...app,
        status: app.status as App['status'],
        tech_stack: app.tech_stack || [],
        monthly_revenue: Number(app.monthly_revenue) || 0,
        users_count: Number(app.users_count) || 0
      })) || []
      
      setApps(typedApps)
    } catch (error) {
      console.error('Error fetching apps:', error)
      toast.error('Failed to load apps')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [user])

  const createApp = async (appData: Partial<App>) => {
    if (!user) return

    try {
      const insertData = { 
        ...appData, 
        user_id: user.id,
        monthly_revenue: appData.monthly_revenue || 0,
        users_count: appData.users_count || 0,
        name: appData.name || '',
        status: appData.status || 'idea'
      }

      const { data, error } = await supabase
        .from('apps')
        .insert([insertData])
        .select()
        .single()

      if (error) throw error
      
      // Type cast the returned data
      const typedApp = {
        ...data,
        status: data.status as App['status'],
        tech_stack: data.tech_stack || [],
        monthly_revenue: Number(data.monthly_revenue) || 0,
        users_count: Number(data.users_count) || 0
      }
      
      setApps(prev => [typedApp, ...prev])
      toast.success('App created successfully!')
      return typedApp
    } catch (error) {
      console.error('Error creating app:', error)
      toast.error('Failed to create app')
    }
  }

  const updateApp = async (id: string, updates: Partial<App>) => {
    try {
      const { data, error } = await supabase
        .from('apps')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Type cast the returned data
      const typedApp = {
        ...data,
        status: data.status as App['status'],
        tech_stack: data.tech_stack || [],
        monthly_revenue: Number(data.monthly_revenue) || 0,
        users_count: Number(data.users_count) || 0
      }
      
      setApps(prev => prev.map(app => app.id === id ? typedApp : app))
      toast.success('App updated successfully!')
      return typedApp
    } catch (error) {
      console.error('Error updating app:', error)
      toast.error('Failed to update app')
    }
  }

  const deleteApp = async (id: string) => {
    try {
      const { error } = await supabase
        .from('apps')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setApps(prev => prev.filter(app => app.id !== id))
      toast.success('App deleted successfully!')
    } catch (error) {
      console.error('Error deleting app:', error)
      toast.error('Failed to delete app')
    }
  }

  return {
    apps,
    loading,
    createApp,
    updateApp,
    deleteApp,
    refreshApps: fetchApps
  }
}

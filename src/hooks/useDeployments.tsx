
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface Deployment {
  id: string
  app_id: string
  environment: 'preview' | 'staging' | 'production'
  hosting_provider: string
  domain_name: string | null
  deployment_url: string | null
  status: 'pending' | 'deployed' | 'failed'
  ci_cd_setup: string | null
  dns_setup: string | null
  ssl_enabled: boolean | null
  created_at: string
  updated_at: string
}

export function useDeployments(appId: string) {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDeployments = async () => {
    try {
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Type cast the data to match our interface
      const typedDeployments = data?.map(deployment => ({
        ...deployment,
        environment: deployment.environment as 'preview' | 'staging' | 'production',
        status: deployment.status as 'pending' | 'deployed' | 'failed'
      })) || []
      
      setDeployments(typedDeployments)
    } catch (error) {
      console.error('Error fetching deployments:', error)
      toast.error('Failed to load deployments')
    } finally {
      setLoading(false)
    }
  }

  const createDeployment = async (deploymentData: Partial<Deployment>) => {
    try {
      const insertData = {
        app_id: appId,
        environment: deploymentData.environment || 'production',
        hosting_provider: deploymentData.hosting_provider || 'vercel',
        domain_name: deploymentData.domain_name,
        deployment_url: deploymentData.deployment_url,
        status: 'pending'
      }

      const { data, error } = await supabase
        .from('deployments')
        .insert([insertData])
        .select()
        .single()

      if (error) throw error
      
      // Type cast the returned data
      const typedDeployment = {
        ...data,
        environment: data.environment as 'preview' | 'staging' | 'production',
        status: data.status as 'pending' | 'deployed' | 'failed'
      }
      
      setDeployments(prev => [typedDeployment, ...prev])
      toast.success('Deployment created successfully!')
      return typedDeployment
    } catch (error) {
      console.error('Error creating deployment:', error)
      toast.error('Failed to create deployment')
    }
  }

  const triggerDeployment = async (deploymentId: string) => {
    try {
      const { data, error } = await supabase
        .from('deployments')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', deploymentId)
        .select()
        .single()

      if (error) throw error
      
      // Type cast the returned data
      const typedDeployment = {
        ...data,
        environment: data.environment as 'preview' | 'staging' | 'production',
        status: data.status as 'pending' | 'deployed' | 'failed'
      }
      
      setDeployments(prev => prev.map(d => d.id === deploymentId ? typedDeployment : d))
      toast.success('Deployment triggered!')
      
      // Simulate deployment process
      setTimeout(async () => {
        const { data: updatedData, error: updateError } = await supabase
          .from('deployments')
          .update({ status: 'deployed' })
          .eq('id', deploymentId)
          .select()
          .single()

        if (!updateError) {
          const finalTypedDeployment = {
            ...updatedData,
            environment: updatedData.environment as 'preview' | 'staging' | 'production',
            status: updatedData.status as 'pending' | 'deployed' | 'failed'
          }
          setDeployments(prev => prev.map(d => d.id === deploymentId ? finalTypedDeployment : d))
          toast.success('Deployment completed!')
        }
      }, 3000)
      
    } catch (error) {
      console.error('Error triggering deployment:', error)
      toast.error('Failed to trigger deployment')
    }
  }

  useEffect(() => {
    if (appId) {
      fetchDeployments()
    }
  }, [appId])

  return {
    deployments,
    loading,
    createDeployment,
    triggerDeployment,
    refetch: fetchDeployments
  }
}

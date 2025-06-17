
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Server, Globe, ExternalLink, Plus, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { App } from "@/hooks/useApps"

interface Deployment {
  id: string
  app_id: string
  environment: 'preview' | 'staging' | 'production'
  hosting_provider: string
  domain_name: string | null
  deployment_url: string | null
  status: 'pending' | 'deployed' | 'failed'
  ci_cd_setup: string | null
  dns_setup: string | null
  ssl_enabled: boolean
  created_at: string
  updated_at: string
}

interface DeploymentTrackerProps {
  apps: App[]
}

const hostingProviders = [
  'Vercel',
  'Netlify',
  'Firebase',
  'AWS',
  'Railway',
  'Render',
  'Heroku',
  'DigitalOcean',
  'Other'
]

export function DeploymentTracker({ apps }: DeploymentTrackerProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    app_id: '',
    environment: 'production' as 'preview' | 'staging' | 'production',
    hosting_provider: '',
    domain_name: '',
    deployment_url: '',
    ci_cd_setup: '',
    dns_setup: '',
    ssl_enabled: true
  })

  const fetchDeployments = async () => {
    try {
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const typedDeployments: Deployment[] = (data || []).map(deployment => ({
        ...deployment,
        environment: deployment.environment as 'preview' | 'staging' | 'production',
        status: deployment.status as 'pending' | 'deployed' | 'failed'
      }))
      
      setDeployments(typedDeployments)
    } catch (error) {
      console.error('Error fetching deployments:', error)
      toast.error('Failed to load deployments')
    } finally {
      setLoading(false)
    }
  }

  const createDeployment = async () => {
    if (!formData.app_id || !formData.hosting_provider) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      const { data, error } = await supabase
        .from('deployments')
        .insert([{
          ...formData,
          status: 'deployed'
        }])
        .select()
        .single()

      if (error) throw error

      const newDeployment: Deployment = {
        ...data,
        environment: data.environment as 'preview' | 'staging' | 'production',
        status: data.status as 'pending' | 'deployed' | 'failed'
      }

      setDeployments(prev => [newDeployment, ...prev])
      setShowDialog(false)
      setFormData({
        app_id: '',
        environment: 'production',
        hosting_provider: '',
        domain_name: '',
        deployment_url: '',
        ci_cd_setup: '',
        dns_setup: '',
        ssl_enabled: true
      })
      toast.success('Deployment tracked successfully!')
    } catch (error) {
      console.error('Error creating deployment:', error)
      toast.error('Failed to track deployment')
    }
  }

  useEffect(() => {
    fetchDeployments()
  }, [])

  const getAppName = (appId: string) => {
    const app = apps.find(a => a.id === appId)
    return app?.name || 'Unknown App'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return CheckCircle
      case 'pending': return Clock
      case 'failed': return AlertCircle
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-card rounded-lg p-6 h-64"></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Deployment Tracker</h2>
          <p className="text-muted-foreground">Track all your app deployments and environments</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Track Deployment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Track New Deployment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app">App</Label>
                  <Select value={formData.app_id} onValueChange={(value) => setFormData({...formData, app_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select app" />
                    </SelectTrigger>
                    <SelectContent>
                      {apps.map(app => (
                        <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select value={formData.environment} onValueChange={(value: 'preview' | 'staging' | 'production') => setFormData({...formData, environment: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preview">Preview</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hosting_provider">Hosting Provider</Label>
                  <Select value={formData.hosting_provider} onValueChange={(value) => setFormData({...formData, hosting_provider: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostingProviders.map(provider => (
                        <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain_name">Domain Name</Label>
                  <Input
                    id="domain_name"
                    value={formData.domain_name}
                    onChange={(e) => setFormData({...formData, domain_name: e.target.value})}
                    placeholder="example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deployment_url">Deployment URL</Label>
                <Input
                  id="deployment_url"
                  value={formData.deployment_url}
                  onChange={(e) => setFormData({...formData, deployment_url: e.target.value})}
                  placeholder="https://your-app.vercel.app"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ci_cd_setup">CI/CD Setup Notes</Label>
                <Textarea
                  id="ci_cd_setup"
                  value={formData.ci_cd_setup}
                  onChange={(e) => setFormData({...formData, ci_cd_setup: e.target.value})}
                  placeholder="Describe your CI/CD pipeline setup..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dns_setup">DNS Setup Notes</Label>
                <Textarea
                  id="dns_setup"
                  value={formData.dns_setup}
                  onChange={(e) => setFormData({...formData, dns_setup: e.target.value})}
                  placeholder="DNS configuration details..."
                />
              </div>
              <Button onClick={createDeployment} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                Track Deployment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {deployments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No deployments tracked</h4>
            <p className="text-muted-foreground text-center">
              Start tracking your app deployments to manage environments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deployments.map(deployment => {
            const StatusIcon = getStatusIcon(deployment.status)
            return (
              <Card key={deployment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{getAppName(deployment.app_id)}</CardTitle>
                      <p className="text-sm text-muted-foreground">{deployment.hosting_provider}</p>
                    </div>
                    <Badge className={getStatusColor(deployment.status)} variant="secondary">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {deployment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Environment:</span>
                    <Badge variant="outline" className="capitalize">{deployment.environment}</Badge>
                  </div>
                  
                  {deployment.domain_name && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{deployment.domain_name}</span>
                    </div>
                  )}
                  
                  {deployment.deployment_url && (
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={deployment.deployment_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Site
                      </a>
                    </Button>
                  )}

                  {deployment.ssl_enabled && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">SSL Enabled</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

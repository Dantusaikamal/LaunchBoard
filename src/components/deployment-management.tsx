
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useDeployments } from '@/hooks/useDeployments'
import { useState } from 'react'
import { Rocket, Plus, ExternalLink, RefreshCw, Globe, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface DeploymentManagementProps {
  appId: string
}

export function DeploymentManagement({ appId }: DeploymentManagementProps) {
  const { deployments, loading, createDeployment, triggerDeployment } = useDeployments(appId)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deploymentForm, setDeploymentForm] = useState({
    environment: 'production' as 'preview' | 'staging' | 'production',
    hosting_provider: 'vercel',
    domain_name: '',
    deployment_url: ''
  })

  const handleCreateDeployment = async () => {
    if (!deploymentForm.hosting_provider) {
      toast.error('Please select a hosting provider')
      return
    }

    await createDeployment(deploymentForm)
    setShowCreateDialog(false)
    setDeploymentForm({
      environment: 'production',
      hosting_provider: 'vercel',
      domain_name: '',
      deployment_url: ''
    })
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
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'production': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'staging': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'preview': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Deployments
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Deployment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Deployment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Environment</label>
                  <Select
                    value={deploymentForm.environment}
                    onValueChange={(value) => setDeploymentForm(prev => ({ 
                      ...prev, 
                      environment: value as 'preview' | 'staging' | 'production'
                    }))}
                  >
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
                <div>
                  <label className="text-sm font-medium">Hosting Provider</label>
                  <Select
                    value={deploymentForm.hosting_provider}
                    onValueChange={(value) => setDeploymentForm(prev => ({ ...prev, hosting_provider: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vercel">Vercel</SelectItem>
                      <SelectItem value="netlify">Netlify</SelectItem>
                      <SelectItem value="railway">Railway</SelectItem>
                      <SelectItem value="render">Render</SelectItem>
                      <SelectItem value="aws">AWS</SelectItem>
                      <SelectItem value="digitalocean">DigitalOcean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Domain Name (Optional)</label>
                  <Input
                    value={deploymentForm.domain_name}
                    onChange={(e) => setDeploymentForm(prev => ({ ...prev, domain_name: e.target.value }))}
                    placeholder="yourdomain.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deployment URL (Optional)</label>
                  <Input
                    value={deploymentForm.deployment_url}
                    onChange={(e) => setDeploymentForm(prev => ({ ...prev, deployment_url: e.target.value }))}
                    placeholder="https://yourapp.vercel.app"
                  />
                </div>
                <Button onClick={handleCreateDeployment} className="w-full">
                  Create Deployment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deployments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No deployments configured</p>
            <p className="text-sm">Create your first deployment to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deployments.map((deployment) => {
              const StatusIcon = getStatusIcon(deployment.status)
              
              return (
                <div
                  key={deployment.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors animate-fade-in"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${
                        deployment.status === 'deployed' ? 'text-green-600' :
                        deployment.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                      <div>
                        <h4 className="font-medium">
                          {deployment.hosting_provider} ({deployment.environment})
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {deployment.domain_name || deployment.deployment_url || 'No URL configured'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getEnvironmentColor(deployment.environment)}>
                        {deployment.environment}
                      </Badge>
                      <Badge className={getStatusColor(deployment.status)}>
                        {deployment.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created {formatDistanceToNow(new Date(deployment.created_at))} ago
                      {deployment.updated_at !== deployment.created_at && (
                        <> • Updated {formatDistanceToNow(new Date(deployment.updated_at))} ago</>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {deployment.deployment_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={deployment.deployment_url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-2" />
                            Visit
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => triggerDeployment(deployment.id)}
                        disabled={deployment.status === 'pending'}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${deployment.status === 'pending' ? 'animate-spin' : ''}`} />
                        {deployment.status === 'pending' ? 'Deploying...' : 'Redeploy'}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Shield, 
  Key, 
  Trash2,
  Calendar,
  AlertTriangle 
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"

interface Secret {
  id: string
  app_id: string
  name: string
  value: string
  description: string | null
  environment: 'local' | 'staging' | 'production'
  status: 'active' | 'expired' | 'rotated'
  is_encrypted: boolean
  last_accessed: string | null
  created_at: string
  updated_at: string
}

interface ProjectSecretsProps {
  appId: string
}

export function ProjectSecrets({ appId }: ProjectSecretsProps) {
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    description: '',
    environment: 'production' as const,
    is_encrypted: false
  })

  const fetchSecrets = async () => {
    try {
      const { data, error } = await supabase
        .from('secrets')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const typedSecrets: Secret[] = (data || []).map(secret => ({
        ...secret,
        environment: secret.environment as 'local' | 'staging' | 'production',
        status: secret.status as 'active' | 'expired' | 'rotated'
      }))
      
      setSecrets(typedSecrets)
    } catch (error) {
      console.error('Error fetching secrets:', error)
      toast.error('Failed to load secrets')
    } finally {
      setLoading(false)
    }
  }

  const createSecret = async () => {
    if (!formData.name.trim() || !formData.value.trim()) {
      toast.error('Please provide name and value')
      return
    }

    try {
      const { data, error } = await supabase
        .from('secrets')
        .insert([{
          app_id: appId,
          name: formData.name,
          value: formData.value,
          description: formData.description || null,
          environment: formData.environment,
          is_encrypted: formData.is_encrypted,
          status: 'active'
        }])
        .select()
        .single()

      if (error) throw error

      const newSecret: Secret = {
        ...data,
        environment: data.environment as 'local' | 'staging' | 'production',
        status: data.status as 'active' | 'expired' | 'rotated'
      }

      setSecrets(prev => [newSecret, ...prev])
      setShowDialog(false)
      setFormData({
        name: '',
        value: '',
        description: '',
        environment: 'production',
        is_encrypted: false
      })
      toast.success('Secret created successfully!')
    } catch (error) {
      console.error('Error creating secret:', error)
      toast.error('Failed to create secret')
    }
  }

  const copyToClipboard = async (value: string, name: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${name} copied to clipboard`)
      
      // Log access
      // In a real app, you'd update the last_accessed timestamp
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const toggleVisibility = (secretId: string) => {
    const newVisible = new Set(visibleSecrets)
    if (newVisible.has(secretId)) {
      newVisible.delete(secretId)
    } else {
      newVisible.add(secretId)
    }
    setVisibleSecrets(newVisible)
  }

  const deleteSecret = async (secretId: string) => {
    try {
      const { error } = await supabase
        .from('secrets')
        .delete()
        .eq('id', secretId)

      if (error) throw error

      setSecrets(prev => prev.filter(secret => secret.id !== secretId))
      toast.success('Secret deleted successfully!')
    } catch (error) {
      console.error('Error deleting secret:', error)
      toast.error('Failed to delete secret')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'rotated': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'staging': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'local': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  useEffect(() => {
    fetchSecrets()
  }, [appId])

  if (loading) {
    return <div className="animate-pulse bg-card rounded-lg p-6 h-64"></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Project Secrets
          </h3>
          <p className="text-sm text-muted-foreground">Securely manage API keys, tokens, and credentials</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Secret
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Secret</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Secret Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="API_KEY, DATABASE_URL, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Secret Value</Label>
                <Textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="The actual secret value..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What this secret is for..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select value={formData.environment} onValueChange={(value: any) => setFormData({...formData, environment: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="encrypted"
                      checked={formData.is_encrypted}
                      onCheckedChange={(checked) => setFormData({...formData, is_encrypted: checked})}
                    />
                    <Label htmlFor="encrypted" className="text-sm">Encrypted</Label>
                  </div>
                </div>
              </div>
              <Button onClick={createSecret} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Create Secret
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {secrets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No secrets yet</h4>
            <p className="text-muted-foreground text-center">
              Add your first secret to securely store API keys and credentials.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {secrets.map(secret => (
            <Card key={secret.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <h4 className="font-medium">{secret.name}</h4>
                    <Badge className={getEnvironmentColor(secret.environment)} variant="secondary">
                      {secret.environment}
                    </Badge>
                    <Badge className={getStatusColor(secret.status)} variant="secondary">
                      {secret.status}
                    </Badge>
                    {secret.is_encrypted && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Encrypted
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSecret(secret.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {secret.description && (
                  <p className="text-sm text-muted-foreground">{secret.description}</p>
                )}
                
                <div className="flex items-center space-x-2">
                  <div className="flex-1 font-mono text-sm bg-muted p-2 rounded">
                    {visibleSecrets.has(secret.id) ? secret.value : '••••••••••••••••'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(secret.id)}
                  >
                    {visibleSecrets.has(secret.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(secret.value, secret.name)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created {format(new Date(secret.created_at), "MMM d, yyyy")}</span>
                    </div>
                    {secret.last_accessed && (
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Last used {format(new Date(secret.last_accessed), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

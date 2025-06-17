
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useApps, App } from "@/hooks/useApps"
import { X } from "lucide-react"
import { toast } from "sonner"

interface AppFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  app?: App | null
}

const statusOptions = [
  { value: 'idea' as const, label: 'Idea' },
  { value: 'building' as const, label: 'Building' },
  { value: 'deployed' as const, label: 'Deployed' },
  { value: 'live' as const, label: 'Live' },
  { value: 'retired' as const, label: 'Retired' }
]

const techStackOptions = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
  'Node.js', 'Express', 'FastAPI', 'Django', 'Rails',
  'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
  'Supabase', 'Firebase', 'AWS', 'Vercel', 'Netlify',
  'Docker', 'Kubernetes', 'Tailwind CSS', 'Material-UI'
]

export function AppFormDialog({ open, onOpenChange, app }: AppFormDialogProps) {
  const { createApp, updateApp } = useApps()
  const [loading, setLoading] = useState(false)
  const [newTech, setNewTech] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'idea' as App['status'],
    tech_stack: [] as string[],
    repo_url: '',
    frontend_url: '',
    backend_url: '',
    deployment_url: '',
    monthly_revenue: 0
  })

  useEffect(() => {
    if (app) {
      setFormData({
        name: app.name,
        description: app.description || '',
        status: app.status,
        tech_stack: app.tech_stack || [],
        repo_url: app.repo_url || '',
        frontend_url: app.frontend_url || '',
        backend_url: app.backend_url || '',
        deployment_url: app.deployment_url || '',
        monthly_revenue: app.monthly_revenue || 0
      })
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'idea',
        tech_stack: [],
        repo_url: '',
        frontend_url: '',
        backend_url: '',
        deployment_url: '',
        monthly_revenue: 0
      })
    }
  }, [app, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('App name is required')
      return
    }

    setLoading(true)
    try {
      if (app) {
        await updateApp(app.id, formData)
      } else {
        await createApp(formData)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving app:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTechStack = (tech: string) => {
    if (tech && !formData.tech_stack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, tech]
      }))
    }
  }

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }))
  }

  const addNewTech = () => {
    if (newTech.trim()) {
      addTechStack(newTech.trim())
      setNewTech('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {app ? 'Edit App' : 'Create New App'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">App Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Awesome SaaS"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: App['status']) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your app..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tech Stack</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                  {tech}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTechStack(tech)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add custom technology..."
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTech())}
              />
              <Button type="button" onClick={addNewTech} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {techStackOptions.map((tech) => (
                <Button
                  key={tech}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTechStack(tech)}
                  disabled={formData.tech_stack.includes(tech)}
                  className="text-xs"
                >
                  {tech}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="repo_url">Repository URL</Label>
              <Input
                id="repo_url"
                type="url"
                value={formData.repo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, repo_url: e.target.value }))}
                placeholder="https://github.com/username/repo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deployment_url">Deployment URL</Label>
              <Input
                id="deployment_url"
                type="url"
                value={formData.deployment_url}
                onChange={(e) => setFormData(prev => ({ ...prev, deployment_url: e.target.value }))}
                placeholder="https://myapp.vercel.app"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="frontend_url">Frontend URL</Label>
              <Input
                id="frontend_url"
                type="url"
                value={formData.frontend_url}
                onChange={(e) => setFormData(prev => ({ ...prev, frontend_url: e.target.value }))}
                placeholder="https://app.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backend_url">Backend URL</Label>
              <Input
                id="backend_url"
                type="url"
                value={formData.backend_url}
                onChange={(e) => setFormData(prev => ({ ...prev, backend_url: e.target.value }))}
                placeholder="https://api.example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_revenue">Monthly Revenue ($)</Label>
            <Input
              id="monthly_revenue"
              type="number"
              min="0"
              step="0.01"
              value={formData.monthly_revenue}
              onChange={(e) => setFormData(prev => ({ ...prev, monthly_revenue: parseFloat(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Saving...' : app ? 'Update App' : 'Create App'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

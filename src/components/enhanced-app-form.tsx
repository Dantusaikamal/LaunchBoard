
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from './image-upload'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'

const appFormSchema = z.object({
  name: z.string().min(1, 'App name is required'),
  description: z.string().optional(),
  status: z.enum(['idea', 'building', 'deployed', 'live', 'retired']),
  repo_url: z.string().url().optional().or(z.literal('')),
  deployment_url: z.string().url().optional().or(z.literal('')),
  monthly_revenue: z.number().min(0).optional(),
  tech_stack: z.array(z.string()).optional(),
})

type AppFormData = z.infer<typeof appFormSchema>

interface EnhancedAppFormProps {
  onSubmit: (data: AppFormData & { logo?: File, screenshots?: File[] }) => void
  initialData?: Partial<AppFormData>
  isLoading?: boolean
}

export function EnhancedAppForm({ onSubmit, initialData, isLoading }: EnhancedAppFormProps) {
  const [logo, setLogo] = useState<File | null>(null)
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [techInput, setTechInput] = useState('')

  const form = useForm<AppFormData>({
    resolver: zodResolver(appFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'idea',
      repo_url: '',
      deployment_url: '',
      monthly_revenue: 0,
      tech_stack: [],
      ...initialData
    }
  })

  const handleSubmit = (data: AppFormData) => {
    onSubmit({
      ...data,
      logo: logo || undefined,
      screenshots: screenshots.length > 0 ? screenshots : undefined
    })
  }

  const addTech = () => {
    if (techInput.trim()) {
      const currentStack = form.getValues('tech_stack') || []
      if (!currentStack.includes(techInput.trim())) {
        form.setValue('tech_stack', [...currentStack, techInput.trim()])
        setTechInput('')
      }
    }
  }

  const removeTech = (tech: string) => {
    const currentStack = form.getValues('tech_stack') || []
    form.setValue('tech_stack', currentStack.filter(t => t !== tech))
  }

  const addScreenshot = (file: File) => {
    if (screenshots.length < 5) {
      setScreenshots([...screenshots, file])
    } else {
      toast.error('Maximum 5 screenshots allowed')
    }
  }

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">App Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="My Awesome App"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Describe your app..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">💡 Idea</SelectItem>
                  <SelectItem value="building">🔨 Building</SelectItem>
                  <SelectItem value="deployed">🚀 Deployed</SelectItem>
                  <SelectItem value="live">✅ Live</SelectItem>
                  <SelectItem value="retired">📦 Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="monthly_revenue">Monthly Revenue ($)</Label>
              <Input
                id="monthly_revenue"
                type="number"
                min="0"
                step="0.01"
                {...form.register('monthly_revenue', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Links & Tech */}
        <Card>
          <CardHeader>
            <CardTitle>Links & Technology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="repo_url">Repository URL</Label>
              <Input
                id="repo_url"
                {...form.register('repo_url')}
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div>
              <Label htmlFor="deployment_url">Deployment URL</Label>
              <Input
                id="deployment_url"
                {...form.register('deployment_url')}
                placeholder="https://myapp.com"
              />
            </div>

            <div>
              <Label>Tech Stack</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Add technology..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTech()
                    }
                  }}
                />
                <Button type="button" onClick={addTech} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.watch('tech_stack') || []).map((tech) => (
                  <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="ml-1 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              label="App Logo"
              onImageUpload={setLogo}
              onImageRemove={() => setLogo(null)}
              maxSize={2}
            />
            
            <div>
              <Label>Screenshots ({screenshots.length}/5)</Label>
              <ImageUpload
                label="Add Screenshot"
                onImageUpload={addScreenshot}
                onImageRemove={() => {}}
                maxSize={5}
              />
            </div>
          </div>

          {screenshots.length > 0 && (
            <div>
              <Label>Screenshots Preview</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {screenshots.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => removeScreenshot(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save App'}
        </Button>
      </div>
    </form>
  )
}

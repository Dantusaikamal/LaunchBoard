
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useIdeas, Idea } from "@/hooks/useIdeas"
import { Star, X, Plus } from "lucide-react"

interface IdeaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idea?: Idea | null
}

export function IdeaForm({ open, onOpenChange, idea }: IdeaFormProps) {
  const { createIdea, updateIdea } = useIdeas()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: idea?.title || '',
    description: idea?.description || '',
    category: idea?.category || 'general',
    status: idea?.status || 'brainstorm' as const,
    rating: idea?.rating || 0,
    market_size: idea?.market_size || '',
    target_audience: idea?.target_audience || '',
    viability_score: idea?.viability_score || 50,
    tags: idea?.tags || []
  })
  const [newTag, setNewTag] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (idea) {
        await updateIdea(idea.id, formData)
      } else {
        await createIdea(formData)
      }
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Error saving idea:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'general',
      status: 'brainstorm',
      rating: 0,
      market_size: '',
      target_audience: '',
      viability_score: 50,
      tags: []
    })
    setNewTag('')
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {idea ? 'Edit Idea' : 'Add New Idea'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Idea Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., AI-powered task manager"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                  <SelectItem value="ai">AI/ML</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your idea in detail..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brainstorm">Brainstorm</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="launched">Launched</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-10)</Label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="p-1"
                  >
                    <Star 
                      className={`h-4 w-4 ${
                        star <= formData.rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="market_size">Market Size</Label>
              <Input
                id="market_size"
                value={formData.market_size}
                onChange={(e) => setFormData(prev => ({ ...prev, market_size: e.target.value }))}
                placeholder="e.g., $10B, Large, Niche"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                placeholder="e.g., Small businesses, Developers"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="viability_score">Viability Score (1-100)</Label>
            <Input
              id="viability_score"
              type="number"
              min="1"
              max="100"
              value={formData.viability_score}
              onChange={(e) => setFormData(prev => ({ ...prev, viability_score: parseInt(e.target.value) || 50 }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (idea ? 'Update Idea' : 'Create Idea')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

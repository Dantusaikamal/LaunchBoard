
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIdeas, Idea } from "@/hooks/useIdeas"
import { IdeaForm } from "./idea-form"
import { 
  Lightbulb, 
  Star, 
  Calendar,
  Search,
  Filter,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Users
} from "lucide-react"

interface IdeaBoardProps {
  onNewIdea: () => void
}

export function IdeaBoard({ onNewIdea }: IdeaBoardProps) {
  const { ideas, loading, deleteIdea } = useIdeas()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || idea.status === statusFilter
    const matchesCategory = categoryFilter === "all" || idea.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const statusColors = {
    'brainstorm': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'research': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'validation': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'development': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'launched': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    'archived': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const handleEdit = (idea: Idea) => {
    setEditingIdea(idea)
    setShowEditForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      await deleteIdea(id)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-card rounded-lg p-6 space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="brainstorm">Brainstorm</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="validation">Validation</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="launched">Launched</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start brainstorming your next big idea!
            </p>
            <Button onClick={onNewIdea} className="bg-yellow-600 hover:bg-yellow-700">
              Add Your First Idea
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => (
            <Card key={idea.id} className="hover:shadow-lg transition-all duration-200 group hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-yellow-600 transition-colors line-clamp-1">
                      {idea.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={statusColors[idea.status]} variant="secondary">
                        {idea.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {idea.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(idea)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(idea.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {idea.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{idea.rating}/10</span>
                  </div>
                </div>

                {idea.market_size && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-green-600">
                      <DollarSign className="h-3 w-3" />
                      <span>Market: {idea.market_size}</span>
                    </div>
                    {idea.target_audience && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Users className="h-3 w-3" />
                        <span>{idea.target_audience}</span>
                      </div>
                    )}
                  </div>
                )}

                {idea.tags && idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {idea.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {idea.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{idea.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Viability: {idea.viability_score || 'N/A'}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(idea)}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <IdeaForm 
        open={showEditForm} 
        onOpenChange={(open) => {
          setShowEditForm(open)
          if (!open) setEditingIdea(null)
        }}
        idea={editingIdea}
      />
    </div>
  )
}

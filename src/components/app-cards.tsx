
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApps, App } from "@/hooks/useApps"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { 
  ExternalLink, 
  Github, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Code,
  Globe
} from "lucide-react"

interface AppCardsProps {
  onNewApp: () => void
  onEditApp: (app: App) => void
  apps?: App[]
  loading?: boolean
}

const statusColors = {
  idea: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  building: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  deployed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  live: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  retired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export function AppCards({ onNewApp, onEditApp, apps: propApps, loading: propLoading }: AppCardsProps) {
  const { user } = useAuth()
  const { apps: hookApps, loading: hookLoading, deleteApp } = useApps()
  const navigate = useNavigate()

  // Use props if provided, otherwise fall back to hook
  const apps = propApps || hookApps
  const loading = propLoading !== undefined ? propLoading : hookLoading

  if (!user) {
    return <Navigate to="/auth" replace />
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

  const handleDelete = async (app: App, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${app.name}"?`)) {
      await deleteApp(app.id)
    }
  }

  const handleEdit = (app: App, e: React.MouseEvent) => {
    e.stopPropagation()
    onEditApp(app)
  }

  const handleCardClick = (appId: string) => {
    navigate(`/apps/${appId}`)
  }

  if (apps.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">🚀</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">No apps yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Start building your SaaS empire by creating your first app.
          </p>
          <Button onClick={onNewApp} className="bg-purple-600 hover:bg-purple-700">
            Create Your First App
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {apps.map((app) => (
        <Card 
          key={app.id} 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
          onClick={() => handleCardClick(app.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {app.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                    {app.name}
                  </CardTitle>
                  <Badge className={statusColors[app.status]} variant="secondary">
                    {app.status}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleEdit(app, e)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(app, e)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {app.description || 'No description provided.'}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(app.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1 text-green-600 font-medium">
                <DollarSign className="h-4 w-4" />
                <span>${app.monthly_revenue?.toLocaleString() || 0}</span>
              </div>
            </div>

            {app.tech_stack && app.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {app.tech_stack.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {app.tech_stack.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{app.tech_stack.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t">
              <div className="flex space-x-2">
                {app.repo_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(app.repo_url!, '_blank')
                    }}
                  >
                    <Github className="h-4 w-4" />
                  </Button>
                )}
                {app.deployment_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(app.deployment_url!, '_blank')
                    }}
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Code className="h-3 w-3" />
                <span>{app.tech_stack?.length || 0} tech</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/useAuth"
import { useApps } from "@/hooks/useApps"
import { Navigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Code, GitBranch, CheckCircle, Clock, AlertCircle, Github, ExternalLink } from "lucide-react"
import { useState } from "react"
import { AppFormDialog } from "@/components/app-form-dialog"

export default function Development() {
  const { user, loading: authLoading } = useAuth()
  const { apps, loading } = useApps()
  const [showAppDialog, setShowAppDialog] = useState(false)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const developmentApps = apps.filter(app => app.status === 'building' || app.status === 'idea')
  const completedApps = apps.filter(app => app.status === 'deployed' || app.status === 'live')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idea': return Clock
      case 'building': return Code
      case 'deployed': return CheckCircle
      case 'live': return CheckCircle
      default: return AlertCircle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idea': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'building': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'deployed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'live': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getProgress = (status: string) => {
    switch (status) {
      case 'idea': return 10
      case 'building': return 50
      case 'deployed': return 80
      case 'live': return 100
      default: return 0
    }
  }

  return (
    <DashboardLayout onNewApp={() => setShowAppDialog(true)}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Development Hub</h1>
            <p className="text-muted-foreground">
              Track your app development progress and manage your code repositories
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {developmentApps.length} In Development
            </Badge>
            <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              {completedApps.length} Completed
            </Badge>
          </div>
        </div>

        {/* Development Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ideas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apps.filter(app => app.status === 'idea').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Development</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apps.filter(app => app.status === 'building').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deployed</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apps.filter(app => app.status === 'deployed').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {apps.filter(app => app.status === 'live').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Development Projects */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Active Projects</h2>
          {developmentApps.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {developmentApps.map((app) => {
                const StatusIcon = getStatusIcon(app.status)
                return (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {app.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{app.name}</CardTitle>
                            <Badge className={getStatusColor(app.status)} variant="secondary">
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {app.description || 'No description provided.'}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{getProgress(app.status)}%</span>
                        </div>
                        <Progress value={getProgress(app.status)} className="h-2" />
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

                      <div className="flex space-x-2 pt-2">
                        {app.repo_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={app.repo_url} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-2" />
                              Code
                            </a>
                          </Button>
                        )}
                        {app.deployment_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={app.deployment_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Preview
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Code className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active development projects</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start building your next SaaS app to see it here.
                </p>
                <Button onClick={() => setShowAppDialog(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Start New Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Completed Projects */}
        {completedApps.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Completed Projects</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {completedApps.map((app) => (
                <Card key={app.id} className="border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-base">{app.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" variant="secondary">
                        {app.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(app.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <AppFormDialog 
          open={showAppDialog} 
          onOpenChange={setShowAppDialog}
          app={null}
        />
      </div>
    </DashboardLayout>
  )
}

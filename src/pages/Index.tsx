
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCards } from "@/components/stats-cards"
import { AppCards } from "@/components/app-cards"
import { AppFormDialog } from "@/components/app-form-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, TrendingUp, Plus, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useApps, App } from "@/hooks/useApps"
import { useIdeas } from "@/hooks/useIdeas"
import { Navigate, Link } from "react-router-dom"

export default function Index() {
  const { user, loading: authLoading } = useAuth()
  const { apps } = useApps()
  const { ideas } = useIdeas()
  const [showAppDialog, setShowAppDialog] = useState(false)
  const [editingApp, setEditingApp] = useState<App | null>(null)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const handleNewApp = () => {
    setEditingApp(null)
    setShowAppDialog(true)
  }

  const handleEditApp = (app: App) => {
    setEditingApp(app)
    setShowAppDialog(true)
  }

  const handleCloseDialog = () => {
    setShowAppDialog(false)
    setEditingApp(null)
  }

  const recentActivity = [
    {
      id: 1,
      action: "Welcome to LaunchBoard!",
      time: "Just now",
      type: "welcome"
    },
    {
      id: 2,
      action: apps.length === 0 ? "Create your first SaaS app to get started" : "Keep building amazing apps!",
      time: "Now",
      type: "tip"
    }
  ]

  const activeApps = apps.filter(app => app.status === 'building' || app.status === 'deployed' || app.status === 'live')
  const liveApps = apps.filter(app => app.status === 'live')
  const totalRevenue = apps.reduce((sum, app) => sum + (app.monthly_revenue || 0), 0)

  return (
    <DashboardLayout onNewApp={handleNewApp}>
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back! 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's what's happening with your SaaS projects today.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Apps Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Your Apps</h2>
                <p className="text-sm text-muted-foreground">Manage and track your applications</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  {apps.length} {apps.length === 1 ? 'Project' : 'Projects'}
                </Badge>
                <Button onClick={handleNewApp} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New App</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </div>
            </div>
            <AppCards onNewApp={handleNewApp} onEditApp={handleEditApp} />
            
            {apps.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Create your first app</h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-sm">
                    Start your SaaS journey by creating your first application. Track development, manage deployments, and grow your business.
                  </p>
                  <Button onClick={handleNewApp} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create App
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="h-2 w-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm leading-relaxed">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Active Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeApps.length > 0 ? (
                  <>
                    {activeApps.slice(0, 3).map((app) => (
                      <Link key={app.id} to={`/apps/${app.id}`}>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{app.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(app.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge 
                              variant="secondary"
                              className={app.status === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                            >
                              {app.status}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    ))}
                    {activeApps.length > 3 && (
                      <Link to="/apps">
                        <Button variant="ghost" size="sm" className="w-full justify-center">
                          View all {activeApps.length} projects
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      No active projects yet. Create your first app to get started!
                    </p>
                    <Button onClick={handleNewApp} variant="outline" size="sm" className="mt-3">
                      <Plus className="h-3 w-3 mr-1" />
                      Create App
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-semibold text-sm sm:text-base">
                    ${totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Apps in Development</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {apps.filter(app => app.status === 'building').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Live Apps</span>
                  <span className="font-semibold text-sm sm:text-base text-green-600">
                    {liveApps.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ideas Stored</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {ideas.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <AppFormDialog 
          open={showAppDialog} 
          onOpenChange={handleCloseDialog}
          app={editingApp}
        />
      </div>
    </DashboardLayout>
  )
}

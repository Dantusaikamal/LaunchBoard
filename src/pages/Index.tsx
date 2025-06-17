
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCards } from "@/components/stats-cards"
import { AppCards } from "@/components/app-cards"
import { AppFormDialog } from "@/components/app-form-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, TrendingUp } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useApps, App } from "@/hooks/useApps"
import { Navigate } from "react-router-dom"

export default function Index() {
  const { user, loading: authLoading } = useAuth()
  const { apps } = useApps()
  const [showAppDialog, setShowAppDialog] = useState(false)
  const [editingApp, setEditingApp] = useState<App | null>(null)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
      action: "Create your first SaaS app to get started",
      time: "Now",
      type: "tip"
    }
  ]

  const activeApps = apps.filter(app => app.status === 'building' || app.status === 'deployed' || app.status === 'live')

  return (
    <DashboardLayout onNewApp={handleNewApp}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your SaaS projects today.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Apps Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Your Apps</h2>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {apps.length} {apps.length === 1 ? 'Project' : 'Projects'}
              </Badge>
            </div>
            <AppCards onNewApp={handleNewApp} onEditApp={handleEditApp} />
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Active Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeApps.length > 0 ? (
                  activeApps.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{app.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={app.status === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                      >
                        {app.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active projects yet. Create your first app to get started!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-semibold">${apps.reduce((sum, app) => sum + (app.monthly_revenue || 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Apps in Development</span>
                  <span className="font-semibold">{apps.filter(app => app.status === 'building').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Live Apps</span>
                  <span className="font-semibold text-green-600">{apps.filter(app => app.status === 'live').length}</span>
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

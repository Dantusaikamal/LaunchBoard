
import { DashboardLayout } from "@/components/dashboard-layout"
import { DeploymentTracker } from "@/components/deployment-tracker"
import { useAuth } from "@/hooks/useAuth"
import { useApps } from "@/hooks/useApps"
import { Navigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Server, Globe, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"
import { AppFormDialog } from "@/components/app-form-dialog"

export default function Deployment() {
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

  const deployedApps = apps.filter(app => app.status === 'deployed' || app.status === 'live')
  const readyToDeploy = apps.filter(app => app.status === 'building')

  return (
    <DashboardLayout onNewApp={() => setShowAppDialog(true)}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Deployment Center</h1>
            <p className="text-muted-foreground">
              Monitor and manage all your app deployments across different environments
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {deployedApps.length} Deployed
            </Badge>
            <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              {readyToDeploy.length} Ready to Deploy
            </Badge>
          </div>
        </div>

        {/* Deployment Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deployedApps.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Apps</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {apps.filter(app => app.status === 'live').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custom Domains</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apps.filter(app => app.deployment_url && !app.deployment_url.includes('vercel.app') && !app.deployment_url.includes('netlify.app')).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                0
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deployment Tracker Component */}
        <DeploymentTracker apps={apps} />

        <AppFormDialog 
          open={showAppDialog} 
          onOpenChange={setShowAppDialog}
          app={null}
        />
      </div>
    </DashboardLayout>
  )
}

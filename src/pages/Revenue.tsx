
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/useAuth"
import { useApps } from "@/hooks/useApps"
import { Navigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RevenueChart } from "@/components/revenue-chart"
import { AppFormDialog } from "@/components/app-form-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  CreditCard,
  Target
} from "lucide-react"

export default function Revenue() {
  const { user, loading: authLoading } = useAuth()
  const { apps, loading } = useApps()
  const [showAppDialog, setShowAppDialog] = useState(false)
  const [selectedApp, setSelectedApp] = useState<string>('all')

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const totalRevenue = apps.reduce((sum, app) => sum + (app.monthly_revenue || 0), 0)
  const averageRevenue = apps.length > 0 ? totalRevenue / apps.length : 0
  const topApp = apps.reduce((top, app) => 
    (app.monthly_revenue || 0) > (top.monthly_revenue || 0) ? app : top
  , apps[0])

  return (
    <DashboardLayout onNewApp={() => setShowAppDialog(true)}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
            <p className="text-muted-foreground">
              Track and analyze your SaaS revenue across all apps
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              ${totalRevenue.toLocaleString()} Total
            </Badge>
          </div>
        </div>

        {/* Revenue Overview Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly recurring revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average per App</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${averageRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Average monthly revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${topApp?.monthly_revenue?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {topApp?.name || 'No apps yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Apps</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apps.filter(app => (app.monthly_revenue || 0) > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of {apps.length} total apps
              </p>
            </CardContent>
          </Card>
        </div>

        {/* App Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Detailed Analytics</h2>
          <Select value={selectedApp} onValueChange={setSelectedApp}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apps Overview</SelectItem>
              {apps.map(app => (
                <SelectItem key={app.id} value={app.id}>
                  {app.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Revenue Details */}
        {selectedApp === 'all' ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {apps.map(app => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {app.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{app.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                        <span className="font-semibold text-green-600">
                          ${app.monthly_revenue?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className="text-sm capitalize">{app.status}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="text-sm">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <RevenueChart appId={selectedApp} />
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

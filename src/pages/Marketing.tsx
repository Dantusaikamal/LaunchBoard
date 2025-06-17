
import { DashboardLayout } from "@/components/dashboard-layout"
import { FunctionalMarketingCalendar } from "@/components/functional-marketing-calendar"
import { useAuth } from "@/hooks/useAuth"
import { useApps } from "@/hooks/useApps"
import { Navigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Calendar, Target, TrendingUp } from "lucide-react"
import { useState } from "react"
import { AppFormDialog } from "@/components/app-form-dialog"

export default function Marketing() {
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

  const readyToLaunch = apps.filter(app => app.status === 'deployed' || app.status === 'live')
  const inMarketing = apps.filter(app => app.status === 'live')

  return (
    <DashboardLayout onNewApp={() => setShowAppDialog(true)}>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing Hub</h1>
            <p className="text-muted-foreground">
              Plan, execute, and track your app launches and marketing campaigns
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 animate-scale-in">
              {readyToLaunch.length} Ready to Launch
            </Badge>
            <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              {inMarketing.length} In Marketing
            </Badge>
          </div>
        </div>

        {/* Marketing Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="animate-fade-in hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Launch Plans</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {readyToLaunch.length}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:scale-105 transition-transform" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                2
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:scale-105 transition-transform" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                5
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:scale-105 transition-transform" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                12.5%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Marketing Calendar */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <FunctionalMarketingCalendar />
        </div>

        <AppFormDialog 
          open={showAppDialog} 
          onOpenChange={setShowAppDialog}
          app={null}
        />
      </div>
    </DashboardLayout>
  )
}

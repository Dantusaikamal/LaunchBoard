
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/useAuth"
import { useApps } from "@/hooks/useApps"
import { Navigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppFormDialog } from "@/components/app-form-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  MousePointer,
  Eye,
  Target
} from "lucide-react"

export default function Analytics() {
  const { user, loading: authLoading } = useAuth()
  const { apps, loading } = useApps()
  const [showAppDialog, setShowAppDialog] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')

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

  // Sample analytics data - in a real app, this would come from your analytics service
  const sampleAnalytics = {
    visitors: 12543,
    sessions: 8234,
    bounceRate: 32.5,
    conversionRate: 2.8,
    avgSessionDuration: '3m 42s'
  }

  const statusData = [
    { name: 'Live', value: apps.filter(app => app.status === 'live').length, color: '#10b981' },
    { name: 'Building', value: apps.filter(app => app.status === 'building').length, color: '#3b82f6' },
    { name: 'Deployed', value: apps.filter(app => app.status === 'deployed').length, color: '#f59e0b' },
    { name: 'Idea', value: apps.filter(app => app.status === 'idea').length, color: '#6b7280' },
    { name: 'Retired', value: apps.filter(app => app.status === 'retired').length, color: '#ef4444' }
  ]

  const revenueByApp = apps
    .filter(app => (app.monthly_revenue || 0) > 0)
    .map(app => ({
      name: app.name,
      revenue: app.monthly_revenue || 0
    }))
    .sort((a, b) => b.revenue - a.revenue)

  const timelineData = [
    { month: 'Jan', apps: 2, revenue: 1200 },
    { month: 'Feb', apps: 3, revenue: 2100 },
    { month: 'Mar', apps: 4, revenue: 3400 },
    { month: 'Apr', apps: 6, revenue: 4800 },
    { month: 'May', apps: 8, revenue: 6200 },
    { month: 'Jun', apps: apps.length, revenue: apps.reduce((sum, app) => sum + (app.monthly_revenue || 0), 0) }
  ]

  return (
    <DashboardLayout onNewApp={() => setShowAppDialog(true)}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive analytics and insights for your SaaS portfolio
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {apps.length} Apps Tracked
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleAnalytics.visitors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleAnalytics.sessions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleAnalytics.bounceRate}%</div>
              <p className="text-xs text-muted-foreground">
                -2.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleAnalytics.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                +0.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleAnalytics.avgSessionDuration}</div>
              <p className="text-xs text-muted-foreground">
                +15s from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* App Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                App Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by App */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by App</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByApp.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Growth Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="apps" fill="#3b82f6" name="Apps" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Apps */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Apps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByApp.slice(0, 5).map((app, index) => (
                <div key={app.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {app.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{app.name}</p>
                      <p className="text-sm text-muted-foreground">Rank #{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ${app.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">monthly</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <AppFormDialog 
          open={showAppDialog} 
          onOpenChange={setShowAppDialog}
          app={null}
        />
      </div>
    </DashboardLayout>
  )
}

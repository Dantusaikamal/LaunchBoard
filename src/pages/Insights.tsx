
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/useAuth"
import { useApps } from "@/hooks/useApps"
import { Navigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AppFormDialog } from "@/components/app-form-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Target,
  MessageSquare,
  Plus,
  Calendar
} from "lucide-react"

interface Insight {
  id: string
  type: 'success' | 'opportunity' | 'warning' | 'idea'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  date: string
  appName?: string
}

export default function Insights() {
  const { user, loading: authLoading } = useAuth()
  const { apps, loading } = useApps()
  const [showAppDialog, setShowAppDialog] = useState(false)
  const [showInsightDialog, setShowInsightDialog] = useState(false)
  const [newInsight, setNewInsight] = useState('')

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

  // Generate insights based on app data
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = []

    // Revenue insights
    const revenueApps = apps.filter(app => (app.monthly_revenue || 0) > 0)
    const totalRevenue = apps.reduce((sum, app) => sum + (app.monthly_revenue || 0), 0)

    if (totalRevenue > 0) {
      insights.push({
        id: '1',
        type: 'success',
        title: 'Revenue Milestone Achieved',
        description: `Your portfolio is generating $${totalRevenue.toLocaleString()} in monthly recurring revenue across ${revenueApps.length} apps.`,
        priority: 'high',
        date: new Date().toISOString(),
      })
    }

    // Development insights
    const buildingApps = apps.filter(app => app.status === 'building')
    if (buildingApps.length > 3) {
      insights.push({
        id: '2',
        type: 'warning',
        title: 'Too Many Projects in Development',
        description: `You have ${buildingApps.length} apps currently in development. Consider focusing on fewer projects to increase completion rate.`,
        priority: 'medium',
        date: new Date().toISOString(),
      })
    }

    // Status insights
    const ideaApps = apps.filter(app => app.status === 'idea')
    if (ideaApps.length > 5) {
      insights.push({
        id: '3',
        type: 'opportunity',
        title: 'Convert Ideas to Action',
        description: `You have ${ideaApps.length} app ideas. Consider prioritizing the most promising ones and moving them to development.`,
        priority: 'medium',
        date: new Date().toISOString(),
      })
    }

    // Tech stack insights
    const techStacks = apps.flatMap(app => app.tech_stack || [])
    const mostUsedTech = techStacks.reduce((acc, tech) => {
      acc[tech] = (acc[tech] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topTech = Object.entries(mostUsedTech).sort(([,a], [,b]) => b - a)[0]
    if (topTech && topTech[1] > 2) {
      insights.push({
        id: '4',
        type: 'idea',
        title: 'Technology Specialization Opportunity',
        description: `You're using ${topTech[0]} in ${topTech[1]} projects. Consider becoming a specialist and offering ${topTech[0]} consulting services.`,
        priority: 'low',
        date: new Date().toISOString(),
      })
    }

    // Success rate insight
    const liveApps = apps.filter(app => app.status === 'live')
    const successRate = apps.length > 0 ? (liveApps.length / apps.length) * 100 : 0
    
    if (successRate > 50) {
      insights.push({
        id: '5',
        type: 'success',
        title: 'High Success Rate',
        description: `${successRate.toFixed(0)}% of your apps have reached live status. This is above the industry average!`,
        priority: 'high',
        date: new Date().toISOString(),
      })
    }

    return insights
  }

  const insights = generateInsights()

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'opportunity': return Target
      case 'warning': return AlertTriangle
      case 'idea': return Lightbulb
      default: return MessageSquare
    }
  }

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'success': return 'text-green-600'
      case 'opportunity': return 'text-blue-600'
      case 'warning': return 'text-yellow-600'
      case 'idea': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityColor = (priority: Insight['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  return (
    <DashboardLayout onNewApp={() => setShowAppDialog(true)}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Insights</h1>
            <p className="text-muted-foreground">
              AI-powered insights and recommendations for your SaaS portfolio
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={showInsightDialog} onOpenChange={setShowInsightDialog}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Insight
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Insight</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your business insight or learning..."
                    value={newInsight}
                    onChange={(e) => setNewInsight(e.target.value)}
                    rows={4}
                  />
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setShowInsightDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={() => setShowInsightDialog(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                      Save Insight
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {insights.length} Insights
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {apps.length > 0 ? Math.round((apps.filter(app => app.status === 'live').length / apps.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Apps that went live
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apps.filter(app => app.status === 'building' || app.status === 'deployed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                In development
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Streams</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apps.filter(app => (app.monthly_revenue || 0) > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Generating revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ideas Backlog</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apps.filter(app => app.status === 'idea').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Waiting to be built
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insights List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">AI-Generated Insights</h2>
          
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight) => {
                const IconComponent = getInsightIcon(insight.type)
                return (
                  <Card key={insight.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <IconComponent className={`h-5 w-5 mt-0.5 ${getInsightColor(insight.type)}`} />
                          <div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getPriorityColor(insight.priority)} variant="secondary">
                                {insight.priority} priority
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(insight.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {insight.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{insight.description}</p>
                      {insight.appName && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Related to: <span className="font-medium">{insight.appName}</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create more apps and add data to get AI-powered insights and recommendations.
                </p>
                <Button onClick={() => setShowAppDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                  Create Your First App
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Business Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Pro Tips for SaaS Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Focus on User Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Regularly collect and analyze user feedback to improve your products and increase retention.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Measure Key Metrics</h4>
                <p className="text-sm text-muted-foreground">
                  Track MRR, churn rate, CAC, and LTV to make data-driven decisions for your SaaS.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Iterate Quickly</h4>
                <p className="text-sm text-muted-foreground">
                  Ship small features frequently rather than waiting for perfect, large releases.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Build in Public</h4>
                <p className="text-sm text-muted-foreground">
                  Share your journey on social media to build an audience and get early adopters.
                </p>
              </div>
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

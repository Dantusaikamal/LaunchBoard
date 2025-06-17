
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitHubIntegration } from "./github-integration"
import { DeploymentManagement } from "./deployment-management"
import { FunctionalMarketingCalendar } from "./functional-marketing-calendar"
import { TaskManager } from "./task-manager"
import { AdvancedNotes } from "./advanced-notes"
import { 
  ExternalLink, 
  Github, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Globe,
  Code,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Timer,
  Bug,
  Star,
  MessageSquare,
  FileText,
  Trophy,
  Zap
} from "lucide-react"
import { App } from "@/hooks/useApps"
import { format, differenceInDays } from "date-fns"

interface ProjectOverviewProps {
  app: App
}

export function ProjectOverview({ app }: ProjectOverviewProps) {
  const [timeTracking, setTimeTracking] = useState(false)
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idea': return Clock
      case 'building': return Code
      case 'deployed': return CheckCircle
      case 'live': return CheckCircle
      case 'retired': return AlertCircle
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idea': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'building': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'deployed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'live': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'retired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getProgress = (status: string) => {
    switch (status) {
      case 'idea': return 10
      case 'building': return 50
      case 'deployed': return 80
      case 'live': return 100
      case 'retired': return 100
      default: return 0
    }
  }

  const StatusIcon = getStatusIcon(app.status)
  const daysFromCreation = differenceInDays(new Date(), new Date(app.created_at))
  const launchTarget = 30
  const daysUntilLaunch = Math.max(0, launchTarget - daysFromCreation)

  // Calculate revenue per hour
  const totalHours = Math.max(daysFromCreation * 8, 1)
  const revenuePerHour = (app.monthly_revenue || 0) / totalHours

  return (
    <div className="space-y-6">
      {/* Header Section - Overview Panel */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800 animate-fade-in">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center animate-scale-in">
                <span className="text-white font-bold text-2xl">
                  {app.name.charAt(0)}
                </span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">{app.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(app.status)} variant="secondary">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {app.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Created {daysFromCreation} days ago
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setTimeTracking(!timeTracking)}
                    variant={timeTracking ? "default" : "outline"}
                    size="sm"
                    className="animate-scale-in hover:scale-105 transition-transform"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    {timeTracking ? "Stop Timer" : "Start Timer"}
                  </Button>
                  <Button variant="outline" size="sm" className="animate-scale-in hover:scale-105 transition-transform">
                    <Target className="h-4 w-4 mr-2" />
                    Launch in {daysUntilLaunch} days
                  </Button>
                </div>
              </div>

              <p className="text-muted-foreground text-lg">
                {app.description || 'No description provided. Add your elevator pitch here!'}
              </p>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Development Progress</span>
                  <span className="font-bold text-blue-600">{getProgress(app.status)}%</span>
                </div>
                <Progress value={getProgress(app.status)} className="h-3 animate-fade-in" />
              </div>

              {/* Tech Stack */}
              {app.tech_stack && app.tech_stack.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {app.tech_stack.map((tech, index) => (
                      <Badge 
                        key={tech} 
                        variant="outline" 
                        className="bg-blue-50 dark:bg-blue-950 animate-fade-in hover:scale-105 transition-transform"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="flex flex-wrap gap-2">
                {app.repo_url && (
                  <Button variant="outline" size="sm" asChild className="animate-scale-in hover:scale-105 transition-transform">
                    <a href={app.repo_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      Repository
                    </a>
                  </Button>
                )}
                {app.deployment_url && (
                  <Button variant="outline" size="sm" asChild className="animate-scale-in hover:scale-105 transition-transform">
                    <a href={app.deployment_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Live Site
                    </a>
                  </Button>
                )}
                {app.frontend_url && (
                  <Button variant="outline" size="sm" asChild className="animate-scale-in hover:scale-105 transition-transform">
                    <a href={app.frontend_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Frontend
                    </a>
                  </Button>
                )}
                {app.backend_url && (
                  <Button variant="outline" size="sm" asChild className="animate-scale-in hover:scale-105 transition-transform">
                    <a href={app.backend_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Backend
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in hover:scale-105 transition-transform" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${app.monthly_revenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue per hour: ${revenuePerHour.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:scale-105 transition-transform" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {app.users_count?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              User growth rate: +12%
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:scale-105 transition-transform" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Build Health</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:scale-105 transition-transform" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Launch Confidence</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">85%</div>
            <p className="text-xs text-muted-foreground">
              Ready to ship!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="build" className="space-y-6 animate-fade-in">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 animate-scale-in">
          <TabsTrigger value="build">Build</TabsTrigger>
          <TabsTrigger value="launch">Launch</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="build" className="space-y-6">
          <div className="space-y-6">
            {/* GitHub Integration */}
            <GitHubIntegration repoUrl={app.repo_url} />
            
            {/* Task Manager */}
            <TaskManager appId={app.id} />
            
            {/* Time Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Time Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-3xl font-mono font-bold">
                    {timeTracking ? "02:34:12" : "00:00:00"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total time: {totalHours.toFixed(0)} hours
                  </div>
                  <Button 
                    onClick={() => setTimeTracking(!timeTracking)}
                    className="w-full animate-scale-in hover:scale-105 transition-transform"
                    variant={timeTracking ? "destructive" : "default"}
                  >
                    {timeTracking ? "Stop Tracking" : "Start Tracking"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="launch" className="space-y-6">
          <div className="space-y-6">
            {/* Deployment Management */}
            <DeploymentManagement appId={app.id} />
            
            {/* Launch Countdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Launch Countdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-blue-600 animate-pulse">
                    {daysUntilLaunch}
                  </div>
                  <p className="text-muted-foreground">Days until planned launch</p>
                  <Button className="w-full animate-scale-in hover:scale-105 transition-transform">
                    <Calendar className="h-4 w-4 mr-2" />
                    Adjust Launch Date
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Marketing Calendar */}
            <FunctionalMarketingCalendar />
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Revenue Model</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Monthly Subscription
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  $29/month per user
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.5%</div>
                <p className="text-xs text-muted-foreground">
                  Visitor → Paying Customer
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Revenue per Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${revenuePerHour.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {totalHours.toFixed(0)} hours worked
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Traffic Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Unique Visitors</span>
                    <span className="font-bold">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bounce Rate</span>
                    <span className="font-bold">34%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Session</span>
                    <span className="font-bold">3m 42s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
                    </div>
                    <span className="text-sm whitespace-nowrap">Visit: 1000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm whitespace-nowrap">Signup: 650</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full transition-all duration-1000" style={{ width: '12%' }}></div>
                    </div>
                    <span className="text-sm whitespace-nowrap">Payment: 125</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <AdvancedNotes appId={app.id} appName={app.name} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Key Learnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm font-medium">What worked well:</p>
                    <p className="text-sm text-muted-foreground">
                      Starting with a simple MVP and getting user feedback early
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-sm font-medium">What to improve:</p>
                    <p className="text-sm text-muted-foreground">
                      Need better time estimation for features
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Motivation Corner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-lg font-medium italic">
                    "The best time to plant a tree was 20 years ago. The second best time is now."
                  </div>
                  <Button variant="outline" className="animate-scale-in hover:scale-105 transition-transform">
                    <Star className="h-4 w-4 mr-2" />
                    Get New Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Magic Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 animate-scale-in hover:scale-105 transition-transform"
        >
          <Zap className="h-4 w-4 mr-2" />
          Should I Ship This?
        </Button>
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 animate-scale-in hover:scale-105 transition-transform"
          style={{ animationDelay: '0.1s' }}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Past You Said...
        </Button>
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 animate-scale-in hover:scale-105 transition-transform"
          style={{ animationDelay: '0.2s' }}
        >
          <Trophy className="h-4 w-4 mr-2" />
          Rate This Launch
        </Button>
      </div>
    </div>
  )
}

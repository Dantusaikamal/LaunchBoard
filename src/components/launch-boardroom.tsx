
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ExternalLink, 
  Copy, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Github,
  Twitter,
  Globe,
  Download
} from "lucide-react"
import { App } from "@/hooks/useApps"
import { toast } from "sonner"

interface LaunchBoardroomProps {
  app: App
}

export function LaunchBoardroom({ app }: LaunchBoardroomProps) {
  const copyPitchDeck = () => {
    const pitchData = {
      name: app.name,
      description: app.description,
      status: app.status,
      revenue: app.monthly_revenue,
      users: app.users_count,
      techStack: app.tech_stack,
      urls: {
        frontend: app.frontend_url,
        backend: app.backend_url,
        deployment: app.deployment_url,
        repo: app.repo_url
      }
    }
    
    navigator.clipboard.writeText(JSON.stringify(pitchData, null, 2))
    toast.success("Pitch deck data copied to clipboard!")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500'
      case 'deployed': return 'bg-blue-500'
      case 'building': return 'bg-yellow-500'
      case 'idea': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary Header */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={app.logo_url || undefined} alt={app.name} />
                <AvatarFallback className="text-lg font-bold">
                  {app.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{app.name}</h1>
                <p className="text-muted-foreground">{app.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(app.status)}>
                    {app.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Last updated: {new Date(app.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={copyPitchDeck} variant="outline" className="gap-2">
              <Copy className="h-4 w-4" />
              Copy Pitch Deck
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${app.monthly_revenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{app.users_count?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +180 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Building</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((new Date().getTime() - new Date(app.created_at).getTime()) / (1000 * 3600 * 24))}
            </div>
            <p className="text-xs text-muted-foreground">
              Since creation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tech Stack & Links */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {app.tech_stack?.map((tech, index) => (
                <Badge key={index} variant="secondary">{tech}</Badge>
              )) || <p className="text-muted-foreground">No tech stack specified</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Public Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {app.deployment_url && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Live App</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(app.deployment_url!, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}

            {app.repo_url && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  <span>Repository</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(app.repo_url!, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between opacity-50">
              <div className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                <span>Product Hunt</span>
              </div>
              <Button variant="ghost" size="sm" disabled>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features & Changelog */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Roadmap & Changelog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-2 border-green-500 pl-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Released</Badge>
                <span className="font-medium">User Authentication</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Complete sign-up and login system with email verification
              </p>
            </div>

            <div className="border-l-2 border-yellow-500 pl-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                <span className="font-medium">Payment Integration</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Stripe integration for subscription management
              </p>
            </div>

            <div className="border-l-2 border-gray-300 pl-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-800">Planned</Badge>
                <span className="font-medium">Mobile App</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                React Native mobile application
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

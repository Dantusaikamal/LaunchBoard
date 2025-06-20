
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useApps } from "@/hooks/useApps"
import { 
  Filter,
  DollarSign,
  Users,
  Code,
  Database,
  CreditCard,
  Globe
} from "lucide-react"

export function SaaSEcosystemMap() {
  const { apps } = useApps()
  const [filterStack, setFilterStack] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterRevenue, setFilterRevenue] = useState<string>("all")

  const getStackIcon = (tech: string) => {
    const lowerTech = tech.toLowerCase()
    if (lowerTech.includes('supabase') || lowerTech.includes('database')) return Database
    if (lowerTech.includes('stripe') || lowerTech.includes('payment')) return CreditCard
    if (lowerTech.includes('react') || lowerTech.includes('next')) return Code
    return Globe
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'border-green-500 bg-green-50 dark:bg-green-950'
      case 'deployed': return 'border-blue-500 bg-blue-50 dark:bg-blue-950'
      case 'building': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'idea': return 'border-gray-500 bg-gray-50 dark:bg-gray-950'
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-950'
    }
  }

  const filteredApps = apps.filter(app => {
    if (filterStatus !== "all" && app.status !== filterStatus) return false
    if (filterStack !== "all" && !app.tech_stack?.some(tech => 
      tech.toLowerCase().includes(filterStack.toLowerCase())
    )) return false
    if (filterRevenue === "profitable" && (app.monthly_revenue || 0) <= 0) return false
    if (filterRevenue === "unprofitable" && (app.monthly_revenue || 0) > 0) return false
    return true
  })

  const allTechStack = Array.from(new Set(
    apps.flatMap(app => app.tech_stack || [])
  ))

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              SaaS Ecosystem Map
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="idea">Idea</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStack} onValueChange={setFilterStack}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Stack" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stack</SelectItem>
                  {allTechStack.map(tech => (
                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterRevenue} onValueChange={setFilterRevenue}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Revenue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Revenue</SelectItem>
                  <SelectItem value="profitable">Profitable</SelectItem>
                  <SelectItem value="unprofitable">No Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Ecosystem Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredApps.map((app) => (
          <Card 
            key={app.id} 
            className={`relative border-2 transition-all hover:scale-105 cursor-pointer ${getStatusColor(app.status)}`}
            onClick={() => window.location.href = `/apps/${app.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={app.logo_url || undefined} alt={app.name} />
                  <AvatarFallback className="font-bold">
                    {app.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{app.name}</h3>
                  <Badge className="text-xs">{app.status}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {app.description || "No description"}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${app.monthly_revenue || 0}/mo</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{app.users_count || 0} users</span>
                </div>
              </div>

              {/* Tech Stack Icons */}
              <div className="flex flex-wrap gap-1">
                {app.tech_stack?.slice(0, 4).map((tech, index) => {
                  const IconComponent = getStackIcon(tech)
                  return (
                    <div 
                      key={index}
                      className="p-1 rounded bg-background/50 border"
                      title={tech}
                    >
                      <IconComponent className="h-3 w-3" />
                    </div>
                  )
                })}
                {(app.tech_stack?.length || 0) > 4 && (
                  <div className="p-1 rounded bg-background/50 border text-xs">
                    +{(app.tech_stack?.length || 0) - 4}
                  </div>
                )}
              </div>

              {/* Time to build */}
              <div className="text-xs text-muted-foreground">
                Built in {Math.floor((new Date().getTime() - new Date(app.created_at).getTime()) / (1000 * 3600 * 24))} days
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApps.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No apps match your current filters.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setFilterStatus("all")
                setFilterStack("all")
                setFilterRevenue("all")
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

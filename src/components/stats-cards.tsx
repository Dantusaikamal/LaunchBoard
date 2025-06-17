
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApps } from "@/hooks/useApps"
import { 
  Rocket, 
  TrendingUp, 
  DollarSign, 
  Users,
  Code,
  Globe,
  Calendar,
  BarChart3
} from "lucide-react"

export function StatsCards() {
  const { apps } = useApps()

  const totalRevenue = apps.reduce((sum, app) => sum + (app.monthly_revenue || 0), 0)
  const liveApps = apps.filter(app => app.status === 'live').length
  const buildingApps = apps.filter(app => app.status === 'building').length
  const deployedApps = apps.filter(app => app.status === 'deployed').length

  const stats = [
    {
      title: "Total Apps",
      value: apps.length.toString(),
      subtitle: `${liveApps} live, ${buildingApps} building`,
      icon: Rocket,
      color: "text-blue-600"
    },
    {
      title: "Monthly Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      subtitle: "Across all apps",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Projects",
      value: (buildingApps + deployedApps).toString(),
      subtitle: "In development",
      icon: Code,
      color: "text-purple-600"
    },
    {
      title: "Success Rate",
      value: apps.length > 0 ? `${Math.round((liveApps / apps.length) * 100)}%` : "0%",
      subtitle: "Apps that went live",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

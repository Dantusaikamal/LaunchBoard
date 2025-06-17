
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react"

export function TrendAnalyzer() {
  const trends = [
    {
      id: 1,
      keyword: "AI Automation",
      trend: "up",
      growth: "+45%",
      popularity: 92,
      category: "Technology",
      opportunity: "High"
    },
    {
      id: 2,
      keyword: "Remote Work Tools",
      trend: "up",
      growth: "+23%",
      popularity: 78,
      category: "Productivity",
      opportunity: "Medium"
    },
    {
      id: 3,
      keyword: "Sustainable Tech",
      trend: "up",
      growth: "+67%",
      popularity: 85,
      category: "Environment",
      opportunity: "High"
    },
    {
      id: 4,
      keyword: "Crypto Trading",
      trend: "down",
      growth: "-12%",
      popularity: 45,
      category: "Finance",
      opportunity: "Low"
    },
    {
      id: 5,
      keyword: "Health Tech",
      trend: "up",
      growth: "+34%",
      popularity: 71,
      category: "Healthcare",
      opportunity: "High"
    },
    {
      id: 6,
      keyword: "EdTech Platforms",
      trend: "stable",
      growth: "+2%",
      popularity: 56,
      category: "Education",
      opportunity: "Medium"
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'High':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Trends & Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Stay ahead of the curve with real-time market insights and trending opportunities.
          </p>
          
          <div className="grid gap-4">
            {trends.map((trend) => (
              <div key={trend.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  {getTrendIcon(trend.trend)}
                  <div>
                    <h4 className="font-medium">{trend.keyword}</h4>
                    <p className="text-sm text-muted-foreground">{trend.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{trend.growth}</p>
                    <p className="text-xs text-muted-foreground">Growth</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">{trend.popularity}%</p>
                    <p className="text-xs text-muted-foreground">Popularity</p>
                  </div>
                  
                  <Badge className={getOpportunityColor(trend.opportunity)} variant="secondary">
                    {trend.opportunity}
                  </Badge>
                  
                  <ExternalLink className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Industry Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Technology</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Healthcare</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '71%' }}></div>
                  </div>
                  <span className="text-sm font-medium">71%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Environment</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  <span className="text-sm font-medium">67%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendation Engine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-200">High Potential</h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  AI-powered tools for small businesses show 67% market growth
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Consider</h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  Remote collaboration tools still have room for innovation
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-200">Avoid</h4>
                <p className="text-sm text-red-600 dark:text-red-300">
                  Saturated markets with declining interest
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

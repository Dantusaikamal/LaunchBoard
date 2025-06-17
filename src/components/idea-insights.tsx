
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Lightbulb, Target, TrendingUp, Users, DollarSign } from "lucide-react"

export function IdeaInsights() {
  const insights = [
    {
      id: 1,
      type: "market_gap",
      title: "Untapped Market Opportunity",
      description: "Small businesses need better inventory management with AI predictions",
      confidence: 89,
      potential: "High",
      action: "Research competitors"
    },
    {
      id: 2,
      type: "trend_alert",
      title: "Rising Trend Alert",
      description: "Voice-activated productivity tools gaining 45% monthly searches",
      confidence: 92,
      potential: "Medium",
      action: "Validate demand"
    },
    {
      id: 3,
      type: "validation",
      title: "Idea Validation Suggestion",
      description: "Test your fitness app idea with a landing page MVP",
      confidence: 76,
      potential: "Medium",
      action: "Build MVP"
    },
    {
      id: 4,
      type: "improvement",
      title: "Enhancement Opportunity",
      description: "Add social features to your productivity app for better engagement",
      confidence: 83,
      potential: "High",
      action: "Design features"
    }
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'market_gap':
        return <Target className="h-5 w-5 text-blue-500" />
      case 'trend_alert':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'validation':
        return <Users className="h-5 w-5 text-purple-500" />
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />
    }
  }

  const getPotentialColor = (potential: string) => {
    switch (potential) {
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
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Get personalized recommendations and insights powered by market data and AI analysis.
          </p>
          
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Confidence:</span>
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}%
                            </Badge>
                          </div>
                          <Badge className={getPotentialColor(insight.potential)} variant="secondary">
                            {insight.potential} Potential
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      {insight.action}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
              Revenue Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">High-potential ideas</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Est. total market</span>
                <span className="font-semibold">$45M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. competition</span>
                <span className="font-semibold">Medium</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-500" />
              Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Target audiences</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Market gaps found</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Trend alignment</span>
                <span className="font-semibold">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Success Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. viability</span>
                <span className="font-semibold">73%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Market readiness</span>
                <span className="font-semibold">High</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Execution difficulty</span>
                <span className="font-semibold">Medium</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

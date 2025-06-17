
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { IdeaBoard } from "@/components/idea-board"
import { IdeaForm } from "@/components/idea-form"
import { TrendAnalyzer } from "@/components/trend-analyzer"
import { IdeaInsights } from "@/components/idea-insights"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Lightbulb, TrendingUp, Brain, Zap } from "lucide-react"

export default function IdeaVault() {
  const { user, loading: authLoading } = useAuth()
  const [showIdeaForm, setShowIdeaForm] = useState(false)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const handleNewIdea = () => {
    setShowIdeaForm(true)
  }

  return (
    <DashboardLayout onNewApp={() => {}}>
      <div className="space-y-8">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Zap className="h-8 w-8 text-yellow-500" />
                Idea Vault
              </h1>
              <p className="text-muted-foreground">
                Capture, develop, and validate your next billion-dollar idea
              </p>
            </div>
            <Button onClick={handleNewIdea} className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="h-4 w-4 mr-2" />
              New Idea
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Total Ideas</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Validated</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">In Development</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Success Rate</p>
                    <p className="text-2xl font-bold">33%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="board" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="board">Idea Board</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-6">
            <IdeaBoard onNewIdea={handleNewIdea} />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <TrendAnalyzer />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <IdeaInsights />
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Idea Validation Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Coming soon: Advanced validation tools and market research integration.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <IdeaForm open={showIdeaForm} onOpenChange={setShowIdeaForm} />
      </div>
    </DashboardLayout>
  )
}

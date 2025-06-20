import { useState, useEffect } from "react"
import { useParams, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TaskManager } from "@/components/task-manager"
import { AdvancedNotes } from "@/components/advanced-notes"
import { AppFormDialog } from "@/components/app-form-dialog"
import { ProjectOverview } from "@/components/project-overview"
import { LaunchBoardroom } from "@/components/launch-boardroom"
import { ProjectSecrets } from "@/components/project-secrets"
import { LaunchArchive } from "@/components/launch-archive"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useAuth } from "@/hooks/useAuth"
import { useApps, App } from "@/hooks/useApps"
import { 
  Home, 
  Rocket, 
  Settings, 
  Archive, 
  Shield,
  BarChart3
} from "lucide-react"

export default function AppDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const { apps, loading } = useApps()
  const [app, setApp] = useState<App | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showNewAppDialog, setShowNewAppDialog] = useState(false)

  useEffect(() => {
    if (apps.length > 0 && id) {
      const foundApp = apps.find(a => a.id === id)
      setApp(foundApp || null)
    }
  }, [apps, id])

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

  if (!app) {
    return (
      <DashboardLayout onNewApp={() => setShowNewAppDialog(true)}>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
          <p className="text-muted-foreground mb-4">The app you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout onNewApp={() => setShowNewAppDialog(true)}>
      <div className="space-y-6">
        {/* App Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">{app.name}</h1>
            <p className="text-muted-foreground">{app.description}</p>
          </div>
          <Button onClick={() => setShowEditDialog(true)} variant="outline">
            Edit App
          </Button>
        </div>

        {/* Mobile-friendly tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex h-12 items-center justify-start rounded-none bg-transparent p-0 w-full">
                <TabsTrigger 
                  value="overview" 
                  className="inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="boardroom"
                  className="inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Boardroom</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="launch"
                  className="inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                >
                  <Rocket className="h-4 w-4" />
                  <span className="hidden sm:inline">Launch</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="secrets"
                  className="inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Secrets</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="archive"
                  className="inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                >
                  <Archive className="h-4 w-4" />
                  <span className="hidden sm:inline">Archive</span>
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="mt-6">
            <TabsContent value="overview" className="space-y-6">
              <ProjectOverview app={app} />
            </TabsContent>

            <TabsContent value="boardroom" className="space-y-6">
              <LaunchBoardroom app={app} />
            </TabsContent>

            <TabsContent value="launch" className="space-y-6">
              <TaskManager appId={app.id} />
              <AdvancedNotes appId={app.id} appName={app.name} />
            </TabsContent>

            <TabsContent value="secrets" className="space-y-6">
              <ProjectSecrets appId={app.id} />
            </TabsContent>

            <TabsContent value="archive" className="space-y-6">
              <LaunchArchive appId={app.id} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Dialogs */}
        <AppFormDialog 
          open={showEditDialog} 
          onOpenChange={setShowEditDialog}
          app={app}
        />

        <AppFormDialog 
          open={showNewAppDialog} 
          onOpenChange={setShowNewAppDialog}
          app={null}
        />
      </div>
    </DashboardLayout>
  )
}


import { useState, useEffect } from "react"
import { useParams, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TaskManager } from "@/components/task-manager"
import { AdvancedNotes } from "@/components/advanced-notes"
import { AppFormDialog } from "@/components/app-form-dialog"
import { ProjectOverview } from "@/components/project-overview"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useApps, App } from "@/hooks/useApps"

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
      <div className="space-y-8">
        {/* Main Project Overview */}
        <ProjectOverview app={app} />

        {/* Edit Dialog */}
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

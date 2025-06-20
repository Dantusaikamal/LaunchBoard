
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AppCards } from "@/components/app-cards"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EnhancedAppForm } from "@/components/enhanced-app-form"
import { useApps, App } from "@/hooks/useApps"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function Apps() {
  const { user, loading: authLoading } = useAuth()
  const { apps, loading, createApp, updateApp } = useApps()
  const [showAppDialog, setShowAppDialog] = useState(false)
  const [editingApp, setEditingApp] = useState<App | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleNewApp = () => {
    setEditingApp(null)
    setShowAppDialog(true)
  }

  const handleEditApp = (app: App) => {
    setEditingApp(app)
    setShowAppDialog(true)
  }

  const handleCloseDialog = () => {
    setShowAppDialog(false)
    setEditingApp(null)
  }

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (editingApp) {
        await updateApp(editingApp.id, data)
        toast.success('App updated successfully!')
      } else {
        await createApp(data)
        toast.success('App created successfully!')
      }
      handleCloseDialog()
    } catch (error) {
      toast.error('Failed to save app')
      console.error('Error saving app:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: apps.length,
    idea: apps.filter(app => app.status === 'idea').length,
    building: apps.filter(app => app.status === 'building').length,
    deployed: apps.filter(app => app.status === 'deployed').length,
    live: apps.filter(app => app.status === 'live').length,
    retired: apps.filter(app => app.status === 'retired').length,
  }

  return (
    <DashboardLayout onNewApp={handleNewApp}>
      <div className="space-y-8">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Apps</h1>
              <p className="text-muted-foreground">
                Manage and track all your SaaS applications
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {apps.length} {apps.length === 1 ? 'App' : 'Apps'}
              </Badge>
              <Button onClick={handleNewApp} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                New App
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search apps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
                  <SelectItem value="idea">💡 Idea ({statusCounts.idea})</SelectItem>
                  <SelectItem value="building">🔨 Building ({statusCounts.building})</SelectItem>
                  <SelectItem value="deployed">🚀 Deployed ({statusCounts.deployed})</SelectItem>
                  <SelectItem value="live">✅ Live ({statusCounts.live})</SelectItem>
                  <SelectItem value="retired">📦 Retired ({statusCounts.retired})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-card rounded-lg p-6 space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.length > 0 ? (
              <AppCards apps={filteredApps} onNewApp={handleNewApp} onEditApp={handleEditApp} />
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white font-bold text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No apps found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Create your first app to get started"}
                </p>
              </div>
            )}
          </div>
        )}

        <Dialog open={showAppDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingApp ? 'Edit App' : 'Create New App'}
              </DialogTitle>
            </DialogHeader>
            <EnhancedAppForm
              onSubmit={handleFormSubmit}
              initialData={editingApp || undefined}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

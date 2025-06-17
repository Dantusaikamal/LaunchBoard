
import { Button } from "@/components/ui/button"
import { Plus, Bell } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { EnhancedSearch } from "./enhanced-search"
import { Badge } from "./ui/badge"

interface DashboardHeaderProps {
  onNewApp: () => void
}

export function DashboardHeader({ onNewApp }: DashboardHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b lg:left-64">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex-1 max-w-2xl mx-4">
          <EnhancedSearch />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              3
            </Badge>
          </Button>
          <Button onClick={onNewApp} size="sm" className="animate-scale-in hover:scale-105 transition-transform">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:block">New App</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

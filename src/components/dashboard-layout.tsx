
import { ReactNode } from "react"
import { DashboardHeader } from "./dashboard-header"
import { SidebarNav } from "./sidebar-nav"

interface DashboardLayoutProps {
  children: ReactNode
  onNewApp: () => void
}

export function DashboardLayout({ children, onNewApp }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <DashboardHeader onNewApp={onNewApp} />
        <main className="flex-1 pt-16 overflow-auto">
          <div className="p-4 lg:p-6 w-full">
            <div className="max-w-full mx-auto animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

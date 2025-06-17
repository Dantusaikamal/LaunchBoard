
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  Home, 
  FolderOpen, 
  Code, 
  Megaphone, 
  Rocket,
  DollarSign,
  BarChart3,
  Lightbulb,
  Settings,
  X,
  Menu,
  Zap
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home
  },
  {
    name: "Apps",
    href: "/apps",
    icon: FolderOpen
  },
  {
    name: "Idea Vault",
    href: "/ideas",
    icon: Zap
  },
  {
    name: "Development",
    href: "/development",
    icon: Code
  },
  {
    name: "Marketing",
    href: "/marketing",
    icon: Megaphone
  },
  {
    name: "Deployment",
    href: "/deployment",
    icon: Rocket
  },
  {
    name: "Revenue",
    href: "/revenue",
    icon: DollarSign
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3
  },
  {
    name: "Insights",
    href: "/insights",
    icon: Lightbulb
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings
  }
]

export function SidebarNav() {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full bg-background border-r border-border">
          {/* Logo Section */}
          <div className="flex items-center gap-2 p-6 border-b border-border">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl">LaunchBoard</span>
          </div>

          <div className="flex flex-col flex-grow px-3 py-4">
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02]",
                      isActive
                        ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                        isActive 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                      )}
                    />
                    {item.name}
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}

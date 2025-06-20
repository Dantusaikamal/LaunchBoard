
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  FolderOpen,
  Lightbulb,
  Code,
  Megaphone,
  DollarSign,
  BarChart3,
  Brain,
  Settings,
  Rocket,
  X
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useApps } from "@/hooks/useApps"
import { useIdeas } from "@/hooks/useIdeas"

interface SidebarNavProps {
  className?: string
  onClose?: () => void
}

const navigation = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: Home,
        description: "Your project overview"
      },
      {
        title: "My Apps",
        href: "/apps",
        icon: FolderOpen,
        description: "Manage your applications"
      }
    ]
  },
  {
    title: "Development",
    items: [
      {
        title: "Idea Vault",
        href: "/ideas",
        icon: Lightbulb,
        description: "Store and organize ideas"
      },
      {
        title: "Development",
        href: "/development",
        icon: Code,
        description: "Code and build"
      }
    ]
  },
  {
    title: "Growth",
    items: [
      {
        title: "Marketing",
        href: "/marketing",
        icon: Megaphone,
        description: "Promote your apps"
      },
      {
        title: "Revenue",
        href: "/revenue",
        icon: DollarSign,
        description: "Track earnings"
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        description: "Usage insights"
      }
    ]
  },
  {
    title: "Intelligence",
    items: [
      {
        title: "Insights",
        href: "/insights",
        icon: Brain,
        description: "AI-powered insights"
      }
    ]
  }
]

export function SidebarNav({ className, onClose }: SidebarNavProps) {
  const location = useLocation()
  const { apps } = useApps()
  const { ideas } = useIdeas()

  const getBadgeCount = (href: string) => {
    switch (href) {
      case "/apps":
        return apps.length
      case "/ideas":
        return ideas.length
      default:
        return null
    }
  }

  const getBadgeVariant = (href: string) => {
    switch (href) {
      case "/apps":
        return apps.filter(app => app.status === 'live').length > 0 ? 'default' : 'secondary'
      case "/ideas":
        return ideas.filter(idea => idea.status === 'brainstorm').length > 0 ? 'default' : 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <div className={cn("flex h-full w-64 flex-col bg-background", className)}>
      {/* Header */}
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg">LaunchBoard</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href
                  const badgeCount = getBadgeCount(item.href)
                  const badgeVariant = getBadgeVariant(item.href)
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className="block"
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-auto p-3 font-normal",
                          isActive && "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-200"
                        )}
                      >
                        <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.title}</span>
                            {badgeCount !== null && badgeCount > 0 && (
                              <Badge variant={badgeVariant} className="ml-2 h-5 text-xs">
                                {badgeCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </Button>
                    </Link>
                  )
                })}
              </div>
              {section.title !== "Intelligence" && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="mt-auto p-4 border-t">
        <Link to="/settings" onClick={onClose}>
          <Button
            variant={location.pathname === "/settings" ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  )
}

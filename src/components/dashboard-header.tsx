
import { Button } from "@/components/ui/button"
import { Plus, Bell, LogOut, Menu } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { EnhancedSearch } from "./enhanced-search"
import { Badge } from "./ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { useState } from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DashboardHeaderProps {
  onNewApp: () => void
  onToggleSidebar?: () => void
}

export function DashboardHeader({ onNewApp, onToggleSidebar }: DashboardHeaderProps) {
  const { signOut, user } = useAuth()
  const [notifications] = useState([
    { id: 1, title: "Welcome to LaunchBoard!", read: false },
    { id: 2, title: "Your first app is ready to deploy", read: false },
    { id: 3, title: "New features available", read: true }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Left section - Mobile menu & Logo */}
        <div className="flex items-center gap-2 lg:gap-4">
          {onToggleSidebar && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleSidebar}
              className="lg:hidden h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          
          {/* Logo - hidden on mobile when sidebar toggle is present */}
          <div className={`items-center gap-2 ${onToggleSidebar ? 'hidden sm:flex' : 'flex'}`}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-lg hidden md:block">LaunchBoard</span>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-md lg:max-w-xl mx-2 sm:mx-4">
          <EnhancedSearch />
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0 sm:h-9 sm:w-9">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex items-start gap-2 p-3">
                  <div className={`h-2 w-2 rounded-full mt-2 ${notification.read ? 'bg-muted' : 'bg-blue-600'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* New App Button */}
          <Button 
            onClick={onNewApp} 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700 h-8 sm:h-9"
          >
            <Plus className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden xs:block">New</span>
            <span className="hidden sm:block ml-1">App</span>
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 sm:h-9 sm:w-9">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">My Account</p>
                  <p className="text-xs text-muted-foreground truncate max-w-48">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={signOut}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

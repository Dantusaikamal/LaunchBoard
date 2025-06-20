
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WifiOff, Wifi } from 'lucide-react'
import { useOffline } from '@/hooks/useOffline'

export function OfflineStatus() {
  const { isOnline } = useOffline()
  const [showNotification, setShowNotification] = useState(false)
  const [lastStatus, setLastStatus] = useState(true)

  useEffect(() => {
    // Show notification when status changes
    if (lastStatus !== isOnline) {
      setShowNotification(true)
      setLastStatus(isOnline)
      
      // Hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isOnline, lastStatus])

  if (!showNotification) return null

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <Card className={`shadow-lg ${isOnline ? 'border-green-200' : 'border-red-200'}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Back online' : 'You\'re offline'}
            </span>
            <Badge 
              variant={isOnline ? 'default' : 'destructive'}
              className={isOnline ? 'bg-green-100 text-green-800' : ''}
            >
              {isOnline ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          {!isOnline && (
            <p className="text-xs text-muted-foreground mt-1">
              Some features may be limited
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

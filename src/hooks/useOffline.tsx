
import { createContext, useContext, useEffect, useState } from 'react'

interface OfflineContextType {
  isOnline: boolean
  isOffline: boolean
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isOffline: false
})

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  // Don't render anything until we're on the client
  const [isMounted, setIsMounted] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Mount effect - runs only on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Set initial status
    updateOnlineStatus()

    // Listen for changes
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [isMounted])

  // Don't render children until mounted to prevent hydration issues
  if (!isMounted) {
    return null
  }

  return (
    <OfflineContext.Provider value={{ isOnline, isOffline: !isOnline }}>
      {children}
    </OfflineContext.Provider>
  )
}

export const useOffline = () => useContext(OfflineContext)

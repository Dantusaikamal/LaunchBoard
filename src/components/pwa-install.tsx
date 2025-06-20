
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, X } from 'lucide-react'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstall() {
  // Don't render anything until we're on the client
  const [isMounted, setIsMounted] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallCard, setShowInstallCard] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  // Mount effect - runs only on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if app is already installed (running in standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show install card after a delay if not already installed
      if (!standalone) {
        setTimeout(() => setShowInstallCard(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isMounted])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        toast.success('App installed successfully!')
      }
      
      setDeferredPrompt(null)
      setShowInstallCard(false)
    } catch (error) {
      console.error('Installation failed:', error)
      toast.error('Installation failed')
    }
  }

  const handleDismiss = () => {
    setShowInstallCard(false)
    // Don't show again for this session
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('pwa-install-dismissed', 'true')
    }
  }

  // Don't render children until mounted to prevent hydration issues
  if (!isMounted) {
    return null
  }

  // Don't show if already installed, dismissed, or no prompt available
  if (isStandalone || 
      (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed')) || 
      (!deferredPrompt && !isIOS) || 
      !showInstallCard) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Download className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm">Install LaunchBoard</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {isIOS 
                  ? "Tap the share button and 'Add to Home Screen'"
                  : "Install the app for a better experience"
                }
              </p>
              {!isIOS && (
                <Button 
                  onClick={handleInstall}
                  size="sm" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install App
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 ml-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

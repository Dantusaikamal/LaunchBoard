
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => {
    // Only access localStorage after component mounts
    if (typeof window === 'undefined') {
      return defaultTheme
    }
    return defaultTheme
  })

  // Mount effect - runs only on client side
  useEffect(() => {
    setIsMounted(true)
    
    // Initialize theme from localStorage after mounting
    const initializeTheme = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = localStorage.getItem(storageKey)
          if (stored && (stored === "dark" || stored === "light" || stored === "system")) {
            setTheme(stored as Theme)
          }
        }
      } catch (error) {
        console.log("Theme initialization error:", error)
      }
    }
    
    initializeTheme()
  }, [storageKey])

  // Apply theme to DOM after theme changes
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return

    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme, isMounted])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {      
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(storageKey, newTheme)
        }
      } catch (error) {
        console.warn('Could not save theme to localStorage', error)
      }
      setTheme(newTheme)
    },
  }

  // Return a simple div during initial mount to prevent hydration issues
  if (!isMounted) {
    return <div suppressHydrationWarning>{children}</div>
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

/**
 * Theme context for window manager
 */

import { createContext, useContext, ReactNode } from 'react'
import { Theme } from '../types'
import { defaultTheme } from '../theme/defaultTheme'

interface ThemeContextValue {
  theme: Theme
}

const ThemeContext = createContext<ThemeContextValue>({ theme: defaultTheme })

interface ThemeProviderProps {
  theme?: Theme
  children: ReactNode
}

/**
 * Theme provider for window manager components
 * @param theme - Custom theme configuration (optional)
 * @param children - Child components
 */
export function ThemeProvider({ theme = defaultTheme, children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access current theme
 * @returns Current theme configuration
 */
export function useTheme(): Theme {
  const { theme } = useContext(ThemeContext)
  return theme
}

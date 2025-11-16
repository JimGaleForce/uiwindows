/**
 * Default theme configurations for Window Manager
 */

import { Theme } from '../types'

/**
 * Dark theme with lime accent (LineRunner default)
 */
export const darkTheme: Theme = {
  name: 'Dark',
  colors: {
    background: '#0d0d0d',
    panel: '#161616',
    accent: '#D4FF48',
    text: {
      primary: 'rgb(226 232 240)', // slate-200
      secondary: 'rgb(148 163 184)', // slate-400
      muted: 'rgb(100 116 139)', // slate-500
    },
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(212, 255, 72, 0.3)',
    },
  },
}

/**
 * Light theme alternative
 */
export const lightTheme: Theme = {
  name: 'Light',
  colors: {
    background: '#ffffff',
    panel: '#f8f9fa',
    accent: '#4CAF50',
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      muted: '#999999',
    },
    border: {
      default: 'rgba(0, 0, 0, 0.1)',
      hover: 'rgba(76, 175, 80, 0.3)',
    },
  },
}

/**
 * Available themes
 */
export const themes: Record<string, Theme> = {
  dark: darkTheme,
  light: lightTheme,
}

/**
 * Default theme
 */
export const defaultTheme = darkTheme

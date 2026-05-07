import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const KEY = 'theme'

// Maps semantic preference to the daisyUI theme name
const DAISY_THEME: Record<'light' | 'dark', string> = {
  light: 'lofi',
  dark: 'black',
}

function getStored(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {}
  return 'system'
}

function applyTheme(theme: Theme) {
  const resolved: 'light' | 'dark' =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme
  document.documentElement.setAttribute('data-theme', DAISY_THEME[resolved])
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStored)

  const setTheme = useCallback((t: Theme) => {
    try {
      localStorage.setItem(KEY, t)
    } catch {}
    applyTheme(t)
    setThemeState(t)
  }, [])

  // Re-apply when system preference changes (only relevant when theme === 'system')
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return { theme, setTheme }
}

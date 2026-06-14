import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} })

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    // Ionic dark palette
    document.documentElement.classList.toggle('ion-palette-dark', isDark)
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => useContext(ThemeContext)

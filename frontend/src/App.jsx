import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme as antTheme } from 'antd'
import { useThemeContext } from './context/ThemeContext'
import { lightTheme, darkTheme } from './theme'
import { router } from './router'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { restoreSession } from './features/auth/authSlice'

export default function App() {
  const { isDark } = useThemeContext()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(restoreSession())
  }, [dispatch])

  const themeConfig = isDark
    ? { algorithm: antTheme.darkAlgorithm, ...darkTheme }
    : { algorithm: antTheme.defaultAlgorithm, ...lightTheme }

  return (
    <ConfigProvider
      theme={themeConfig}
      getPopupContainer={() => document.body}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

/* Ionic core CSS — must come before app styles */
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* App global styles (Ionic variable overrides + mobile utility classes) */
import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { setupIonicReact } from '@ionic/react'
import { store } from './store'
import { ThemeProvider } from './context/ThemeContext'
import App from './App'

setupIonicReact({ mode: 'md' })   // Material Design for consistent cross-platform look

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)

import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { IonIcon } from '@ionic/react'
import {
  homeOutline, home,
  cashOutline, cash,
  cartOutline, cart,
  documentTextOutline, documentText,
  leafOutline, leaf,
  moonOutline, sunnyOutline,
  logOutOutline,
  notificationsOutline, chevronForwardOutline,
} from 'ionicons/icons'
import { logout } from '../features/auth/authSlice'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

/* ─── Navigation tabs ────────────────────────────────────────────── */
const TABS = [
  { path: '/',         iconOff: homeOutline,         iconOn: home,         label: 'Home' },
  { path: '/income',   iconOff: cashOutline,         iconOn: cash,         label: 'Income' },
  { path: '/expenses', iconOff: cartOutline,         iconOn: cart,         label: 'Expenses' },
  { path: '/crops',    iconOff: leafOutline,         iconOn: leaf,         label: 'Crops' },
  { path: '/reports',  iconOff: documentTextOutline, iconOn: documentText, label: 'Reports' },
]

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function MobileLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const isHome    = location.pathname === '/'
  const pageTitle = TABS.find(t => t.path === location.pathname)?.label ?? 'FinanceTracker'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="mobile-shell">

      {/* ══ Header ══════════════════════════════════════════════════ */}
      <header className="mobile-header">
        <div className="mobile-header-inner">

          {isHome ? (
            <div className="mobile-header-left">
              <div className="mobile-avatar">{getInitials(user?.full_name)}</div>
              <div>
                <div className="mobile-header-greeting">{getGreeting()} 👋</div>
                <div className="mobile-header-name">{user?.full_name?.split(' ')[0] ?? 'User'}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="mobile-icon-btn" onClick={() => navigate(-1)} style={{ width: 32, height: 32 }}>
                <IonIcon icon={chevronForwardOutline} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <span className="mobile-header-title">{pageTitle}</span>
            </div>
          )}

          <div className="mobile-header-right">
            <button className="mobile-icon-btn" onClick={toggleTheme}>
              <IonIcon icon={isDark ? sunnyOutline : moonOutline} />
            </button>
            {isHome && (
              <button className="mobile-icon-btn">
                <IonIcon icon={notificationsOutline} />
              </button>
            )}
            <button className="mobile-icon-btn logout-btn" onClick={handleLogout} title="Logout">
              <IonIcon icon={logOutOutline} />
            </button>
          </div>
        </div>
      </header>

      {/* ══ Page content ════════════════════════════════════════════ */}
      <div className="mobile-scroll-area">
        <div className="mobile-page-pad">
          <Outlet />
        </div>
      </div>

      {/* ══ Bottom tab bar ══════════════════════════════════════════ */}
      <nav className="mobile-tab-bar">
        {TABS.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              className={`mobile-tab-btn${active ? ' active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <IonIcon icon={active ? tab.iconOn : tab.iconOff} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>

    </div>
  )
}

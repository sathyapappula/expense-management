import { useEffect } from 'react'
import { Form, Input, Button, Alert } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from './authSlice'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { loading, error, token } = useSelector((s) => s.auth)
  const [form] = Form.useForm()

  useEffect(() => {
    if (token) navigate('/', { replace: true })
    return () => dispatch(clearError())
  }, [token])

  const onFinish = (values) => dispatch(loginUser(values))

  if (!isMobile) {
    return <DesktopLogin form={form} onFinish={onFinish} loading={loading} error={error} />
  }

  return (
    <div className="auth-mobile-page">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="auth-hero">
        <div className="auth-hero-blob auth-hero-blob-1" />
        <div className="auth-hero-blob auth-hero-blob-2" />
        <div className="auth-logo-wrap">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="26" fill="rgba(255,255,255,0.15)" />
            <path d="M26 14C19.373 14 14 19.373 14 26s5.373 12 12 12 12-5.373 12-12S32.627 14 26 14zm1 17.5V33h-2v-1.5c-2.206-.46-3.5-1.94-3.5-3.5h2c0 .97.9 1.75 2.25 1.75h.5c1.243 0 2.25-.784 2.25-1.75 0-.785-.634-1.36-2.094-1.684l-1.093-.244C23.197 25.6 21.5 24.376 21.5 22.25c0-1.56 1.294-3.04 3.5-3.5V17h2v1.75c2.206.46 3.5 1.94 3.5 3.5h-2c0-.97-.9-1.75-2.25-1.75h-.5c-1.243 0-2.25.784-2.25 1.75 0 .785.634 1.36 2.094 1.684l1.093.244C28.803 24.65 30.5 25.874 30.5 28c0 1.56-1.294 3.04-3.5 3.5z" fill="white" />
          </svg>
        </div>
        <h1 className="auth-hero-title">FinanceTracker</h1>
        <p className="auth-hero-sub">Your money, your control</p>
        <div className="auth-hero-stats">
          <div className="auth-hero-stat"><span>💰</span> Income</div>
          <div className="auth-hero-stat-dot" />
          <div className="auth-hero-stat"><span>🌾</span> Crops</div>
          <div className="auth-hero-stat-dot" />
          <div className="auth-hero-stat"><span>📊</span> Budget</div>
        </div>
      </div>

      {/* ── Form Panel ───────────────────────────────────────── */}
      <div className="auth-panel">
        <div className="auth-panel-handle" />
        <h2 className="auth-panel-title">Welcome back</h2>
        <p className="auth-panel-sub">Sign in to your account</p>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16, borderRadius: 10 }} />}

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Invalid email' }]}
          >
            <input
              className="auth-input"
              placeholder="Email address"
              type="email"
              autoComplete="email"
              onChange={(e) => form.setFieldValue('email', e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <input
              className="auth-input"
              placeholder="Password"
              type="password"
              autoComplete="current-password"
              onChange={(e) => form.setFieldValue('password', e.target.value)}
            />
          </Form.Item>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            onClick={() => form.submit()}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </Form>

        <div className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </div>
      </div>
    </div>
  )
}

function DesktopLogin({ form, onFinish, loading, error }) {
  return (
    <div className="auth-desktop-card">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💰</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Welcome back</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--ft-text-2)', fontSize: 14 }}>Sign in to FinanceTracker</p>
      </div>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
          <Input size="large" placeholder="Email address" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password size="large" placeholder="Password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ height: 48 }}>
          Sign In
        </Button>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ft-text-2)' }}>
        No account? <Link to="/register" style={{ color: 'var(--ft-primary)', fontWeight: 600 }}>Create one</Link>
      </div>
    </div>
  )
}

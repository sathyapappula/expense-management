import { useEffect } from 'react'
import { Form, Input, Button, Alert } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError } from './authSlice'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { loading, error, token } = useSelector((s) => s.auth)
  const [form] = Form.useForm()

  useEffect(() => {
    if (token) navigate('/', { replace: true })
    return () => dispatch(clearError())
  }, [token])

  const onFinish = (values) => {
    const { confirmPassword, ...rest } = values
    dispatch(registerUser(rest))
  }

  if (!isMobile) {
    return <DesktopRegister form={form} onFinish={onFinish} loading={loading} error={error} />
  }

  return (
    <div className="auth-mobile-page">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="auth-hero auth-hero--short">
        <div className="auth-hero-blob auth-hero-blob-1" />
        <div className="auth-hero-blob auth-hero-blob-2" />
        <div className="auth-logo-wrap">
          <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="26" fill="rgba(255,255,255,0.15)" />
            <path d="M26 14C19.373 14 14 19.373 14 26s5.373 12 12 12 12-5.373 12-12S32.627 14 26 14zm1 17.5V33h-2v-1.5c-2.206-.46-3.5-1.94-3.5-3.5h2c0 .97.9 1.75 2.25 1.75h.5c1.243 0 2.25-.784 2.25-1.75 0-.785-.634-1.36-2.094-1.684l-1.093-.244C23.197 25.6 21.5 24.376 21.5 22.25c0-1.56 1.294-3.04 3.5-3.5V17h2v1.75c2.206.46 3.5 1.94 3.5 3.5h-2c0-.97-.9-1.75-2.25-1.75h-.5c-1.243 0-2.25.784-2.25 1.75 0 .785.634 1.36 2.094 1.684l1.093.244C28.803 24.65 30.5 25.874 30.5 28c0 1.56-1.294 3.04-3.5 3.5z" fill="white" />
          </svg>
        </div>
        <h1 className="auth-hero-title">Get Started</h1>
        <p className="auth-hero-sub">Create your free account</p>
      </div>

      {/* ── Form Panel ───────────────────────────────────────── */}
      <div className="auth-panel auth-panel--scroll">
        <div className="auth-panel-handle" />
        <h2 className="auth-panel-title">Create Account</h2>
        <p className="auth-panel-sub">Start tracking your finances today</p>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16, borderRadius: 10 }} />}

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="full_name" rules={[{ required: true, message: 'Full name is required' }]}>
            <input
              className="auth-input"
              placeholder="Full Name"
              type="text"
              onChange={(e) => form.setFieldValue('full_name', e.target.value)}
            />
          </Form.Item>
          <Form.Item name="username" rules={[{ required: true, message: 'Username is required' }, { min: 3, message: 'At least 3 characters' }]}>
            <input
              className="auth-input"
              placeholder="Username"
              type="text"
              autoComplete="username"
              onChange={(e) => form.setFieldValue('username', e.target.value)}
            />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Invalid email' }]}>
            <input
              className="auth-input"
              placeholder="Email address"
              type="email"
              autoComplete="email"
              onChange={(e) => form.setFieldValue('email', e.target.value)}
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Password is required' }, { min: 8, message: 'At least 8 characters' }]}>
            <input
              className="auth-input"
              placeholder="Password (min 8 chars)"
              type="password"
              autoComplete="new-password"
              onChange={(e) => form.setFieldValue('password', e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('Passwords do not match'))
                },
              }),
            ]}
          >
            <input
              className="auth-input"
              placeholder="Confirm Password"
              type="password"
              autoComplete="new-password"
              onChange={(e) => form.setFieldValue('confirmPassword', e.target.value)}
            />
          </Form.Item>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            onClick={() => form.submit()}
          >
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </Form>

        <div className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

function DesktopRegister({ form, onFinish, loading, error }) {
  return (
    <div className="auth-desktop-card">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>💰</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Create Account</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--ft-text-2)', fontSize: 14 }}>Start managing your finances</p>
      </div>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
          <Input size="large" placeholder="Full Name" />
        </Form.Item>
        <Form.Item name="username" label="Username" rules={[{ required: true }, { min: 3 }]}>
          <Input size="large" placeholder="Username" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
          <Input size="large" placeholder="Email address" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }, { min: 8 }]}>
          <Input.Password size="large" placeholder="Password (min 8 chars)" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve()
                return Promise.reject(new Error('Passwords do not match'))
              },
            }),
          ]}
        >
          <Input.Password size="large" placeholder="Confirm Password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ height: 48 }}>
          Create Account
        </Button>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ft-text-2)' }}>
        Have an account? <Link to="/login" style={{ color: 'var(--ft-primary)', fontWeight: 600 }}>Sign in</Link>
      </div>
    </div>
  )
}

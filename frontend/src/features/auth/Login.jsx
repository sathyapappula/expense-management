import { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Divider } from 'antd'
import { UserOutlined, LockOutlined, DollarCircleOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from './authSlice'

const { Title, Text } = Typography

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector((state) => state.auth)
  const [form] = Form.useForm()

  useEffect(() => {
    if (token) navigate('/', { replace: true })
    return () => dispatch(clearError())
  }, [token])

  const onFinish = (values) => {
    dispatch(loginUser(values))
  }

  return (
    <Card
      style={{ width: '100%', maxWidth: 420, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      bodyStyle={{ padding: '40px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <DollarCircleOutlined style={{ fontSize: 48, color: '#1677ff' }} />
        <Title level={2} style={{ margin: '12px 0 4px' }}>Welcome Back</Title>
        <Text type="secondary">Sign in to your FinanceTracker account</Text>
      </div>

      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Invalid email' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email address" size="large" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Password is required' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          style={{ marginTop: 8, height: 48 }}
        >
          Sign In
        </Button>
      </Form>

      <Divider />
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary">Don't have an account? </Text>
        <Link to="/register">Create one</Link>
      </div>
    </Card>
  )
}

import { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Divider } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, DollarCircleOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError } from './authSlice'

const { Title, Text } = Typography

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector((state) => state.auth)
  const [form] = Form.useForm()

  useEffect(() => {
    if (token) navigate('/', { replace: true })
    return () => dispatch(clearError())
  }, [token])

  const onFinish = (values) => {
    const { confirmPassword, ...rest } = values
    dispatch(registerUser(rest))
  }

  return (
    <Card
      style={{ width: '100%', maxWidth: 440, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      bodyStyle={{ padding: '40px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <DollarCircleOutlined style={{ fontSize: 48, color: '#1677ff' }} />
        <Title level={2} style={{ margin: '12px 0 4px' }}>Create Account</Title>
        <Text type="secondary">Start managing your finances today</Text>
      </div>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item name="full_name" rules={[{ required: true, message: 'Full name is required' }]}>
          <Input prefix={<UserOutlined />} placeholder="Full Name" size="large" />
        </Form.Item>
        <Form.Item name="username" rules={[{ required: true, message: 'Username is required' }, { min: 3, message: 'At least 3 characters' }]}>
          <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
        </Form.Item>
        <Form.Item name="email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Invalid email' }]}>
          <Input prefix={<MailOutlined />} placeholder="Email address" size="large" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: 'Password is required' }, { min: 8, message: 'At least 8 characters' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Password (min 8 chars)" size="large" />
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
          <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ marginTop: 8, height: 48 }}>
          Create Account
        </Button>
      </Form>

      <Divider />
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary">Already have an account? </Text>
        <Link to="/login">Sign in</Link>
      </div>
    </Card>
  )
}

import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  Layout, Menu, Avatar, Dropdown, Button, Typography, Space, Switch,
} from 'antd'
import {
  DashboardOutlined, DollarOutlined, ShoppingCartOutlined,
  BarChartOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  UserOutlined, LogoutOutlined, SunOutlined, MoonOutlined,
  PieChartOutlined, ExperimentOutlined,
} from '@ant-design/icons'
import { logout } from '../features/auth/authSlice'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const menuItems = [
  { key: '/',         icon: <DashboardOutlined />,    label: 'Dashboard' },
  { key: '/income',   icon: <DollarOutlined />,       label: 'Income' },
  { key: '/expenses', icon: <ShoppingCartOutlined />, label: 'Expenses' },
  { key: '/crops',    icon: <ExperimentOutlined />,   label: 'Crops' },
  { key: '/budget',   icon: <PieChartOutlined />,     label: 'Budget Planner' },
  { key: '/reports',  icon: <BarChartOutlined />,     label: 'Reports' },
]

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: user?.full_name || 'Profile' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ]

  const handleUserMenu = ({ key }) => {
    if (key === 'logout') {
      dispatch(logout())
      navigate('/login')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={220}
        style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100, overflow: 'auto' }}
      >
        <div style={{ padding: collapsed ? '16px 8px' : '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', minHeight: 56, display: 'flex', alignItems: 'center' }}>
          {!collapsed ? (
            <Text strong style={{ color: '#fff', fontSize: 16 }}>💰 FinanceTracker</Text>
          ) : (
            <DollarOutlined style={{ color: '#1677ff', fontSize: 20 }} />
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 8, border: 'none' }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          <Space size="middle">
            <Switch
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              checked={isDark}
              onChange={toggleTheme}
            />
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                <Text>{user?.full_name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: '24px', minHeight: 'calc(100vh - 112px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

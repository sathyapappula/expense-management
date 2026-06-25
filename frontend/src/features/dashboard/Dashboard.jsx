import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Typography, Alert, Skeleton } from 'antd'
import {
  DollarOutlined, ShoppingCartOutlined, MoneyCollectOutlined,
  WalletOutlined, ExperimentOutlined, RiseOutlined,
} from '@ant-design/icons'
import { IonIcon } from '@ionic/react'
import {
  addCircleOutline,
  leafOutline, cashOutline, cartOutline,
  trendingUpOutline, briefcaseOutline, cardOutline, sparklesOutline,
} from 'ionicons/icons'
import { fetchDashboard } from './dashboardSlice'
import StatCard from '../../components/common/StatCard'
import LineChart from '../../components/charts/LineChart'
import PieChart from '../../components/charts/PieChart'
import BarChart from '../../components/charts/BarChart'
import { useIsMobile } from '../../hooks/useIsMobile'

const { Title } = Typography

const QUICK_ACTIONS = [
  { icon: addCircleOutline, label: 'Income',    path: '/income',   color: '#10B981', bg: 'var(--ft-success-lt)' },
  { icon: sparklesOutline,  label: 'Ask AI',    path: '/ask-ai',   color: '#7C3AED', bg: '#F5F3FF' },
  { icon: cardOutline,      label: 'Cards',     path: '/cards',    color: '#0EA5E9', bg: '#E0F2FE' },
  { icon: briefcaseOutline, label: 'Portfolio', path: '/assets',   color: '#6366F1', bg: 'var(--ft-indigo-lt)' },
]

const fmt = (v) => {
  if (!v && v !== 0) return '₹0'
  const n = Number(v)
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000)    return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toFixed(0)}`
}

/* ══════════════════════════════════════════════════════════════════
   Mobile Dashboard
   ══════════════════════════════════════════════════════════════════ */
function MobileDashboard({ data, loading }) {
  const navigate = useNavigate()
  const s = data?.summary || {}
  const cropProfitPositive = (s.crop_profit || 0) >= 0

  return (
    <div>
      {/* ── Balance Hero Card ───────────────────────────────────── */}
      <div className="balance-card ft-animate-up">
        <div className="balance-card-content">
          <div className="balance-label">Net Balance</div>
          {loading ? (
            <Skeleton.Input active style={{ width: 180, height: 36, marginBottom: 18, background: 'rgba(255,255,255,0.15)' }} />
          ) : (
            <div className="balance-amount">
              <small>₹</small>
              {Number(s.current_balance || 0).toLocaleString('en-IN')}
            </div>
          )}
          <div className="balance-row">
            <div className="balance-stat">
              <div className="balance-stat-label">Income</div>
              <div className="balance-stat-value up">{loading ? '—' : fmt(s.total_income)}</div>
            </div>
            <div className="balance-stat" style={{ paddingLeft: 12 }}>
              <div className="balance-stat-label">Expenses</div>
              <div className="balance-stat-value down">{loading ? '—' : fmt(s.total_expenses)}</div>
            </div>
            <div className="balance-stat" style={{ paddingLeft: 12 }}>
              <div className="balance-stat-label">Crop Spend</div>
              <div className="balance-stat-value down">{loading ? '—' : fmt(s.total_crop_investment)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Crop snapshot banner (shown only when crops exist) ──── */}
      {!loading && (s.active_crops > 0 || s.total_crop_investment > 0) && (
        <div className="crop-dashboard-banner ft-animate-up" onClick={() => navigate('/crops')}>
          <div className="crop-db-left">
            <div className="crop-db-icon"><IonIcon icon={leafOutline} /></div>
            <div>
              <div className="crop-db-title">
                {s.active_crops > 0 ? `${s.active_crops} Crop${s.active_crops > 1 ? 's' : ''} Growing` : 'Crop Tracker'}
              </div>
              <div className="crop-db-sub">Invested {fmt(s.total_crop_investment)}</div>
            </div>
          </div>
          <div className="crop-db-right">
            <div className="crop-db-profit-label">Harvest P&L</div>
            <div className={`crop-db-profit ${cropProfitPositive ? 'pos' : 'neg'}`}>
              {cropProfitPositive ? '+' : '-'}{fmt(Math.abs(s.crop_profit || 0))}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Actions ────────────────────────────────────────── */}
      <div className="mob-section-head">
        <span className="mob-section-title">Quick Actions</span>
      </div>
      <div className="quick-actions-grid ft-animate-up" style={{ animationDelay: '.05s' }}>
        {QUICK_ACTIONS.map((qa, i) => (
          <button
            key={qa.path}
            className="quick-action-btn"
            onClick={() => navigate(qa.path)}
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <div className="qa-icon-wrap" style={{ background: qa.bg }}>
              <IonIcon icon={qa.icon} style={{ color: qa.color }} />
            </div>
            <span className="qa-label">{qa.label}</span>
          </button>
        ))}
      </div>

      {/* ── Summary Cards ────────────────────────────────────────── */}
      <div className="mob-section-head" style={{ marginTop: 4 }}>
        <span className="mob-section-title">Overview</span>
      </div>
      <div className="summary-grid ft-animate-up" style={{ animationDelay: '.1s' }}>

        <div className="summary-card">
          <div className="summary-card-top">
            <div className="summary-icon-wrap" style={{ background: 'var(--ft-success-lt)' }}>
              <IonIcon icon={cashOutline} style={{ color: 'var(--ft-success)' }} />
            </div>
            <span className="summary-badge" style={{ background: 'var(--ft-success-lt)', color: 'var(--ft-success)' }}>In</span>
          </div>
          <div className="summary-card-label">Total Income</div>
          <div className="summary-card-value">{loading ? <Skeleton.Input active size="small" style={{ width: 70 }} /> : fmt(s.total_income)}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-top">
            <div className="summary-icon-wrap" style={{ background: 'var(--ft-danger-lt)' }}>
              <IonIcon icon={cartOutline} style={{ color: 'var(--ft-danger)' }} />
            </div>
            <span className="summary-badge" style={{ background: 'var(--ft-danger-lt)', color: 'var(--ft-danger)' }}>Out</span>
          </div>
          <div className="summary-card-label">Total Expenses</div>
          <div className="summary-card-value">{loading ? <Skeleton.Input active size="small" style={{ width: 70 }} /> : fmt(s.total_expenses)}</div>
        </div>

        <div className="summary-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/crops')}>
          <div className="summary-card-top">
            <div className="summary-icon-wrap" style={{ background: '#F7FEE7' }}>
              <IonIcon icon={leafOutline} style={{ color: '#84CC16' }} />
            </div>
            <span className="summary-badge" style={{ background: '#F7FEE7', color: '#84CC16' }}>Farm</span>
          </div>
          <div className="summary-card-label">Crop Investment</div>
          <div className="summary-card-value">{loading ? <Skeleton.Input active size="small" style={{ width: 70 }} /> : fmt(s.total_crop_investment)}</div>
        </div>

        <div className="summary-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/crops')}>
          <div className="summary-card-top">
            <div className="summary-icon-wrap" style={{ background: cropProfitPositive ? 'var(--ft-success-lt)' : 'var(--ft-danger-lt)' }}>
              <IonIcon icon={trendingUpOutline} style={{ color: cropProfitPositive ? 'var(--ft-success)' : 'var(--ft-danger)' }} />
            </div>
            <span className="summary-badge" style={{ background: cropProfitPositive ? 'var(--ft-success-lt)' : 'var(--ft-danger-lt)', color: cropProfitPositive ? 'var(--ft-success)' : 'var(--ft-danger)' }}>
              {cropProfitPositive ? 'Profit' : 'Loss'}
            </span>
          </div>
          <div className="summary-card-label">Harvest P&L</div>
          <div className="summary-card-value" style={{ color: cropProfitPositive ? 'var(--ft-success)' : 'var(--ft-danger)' }}>
            {loading ? <Skeleton.Input active size="small" style={{ width: 70 }} /> : `${cropProfitPositive ? '+' : '-'}${fmt(Math.abs(s.crop_profit || 0))}`}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Desktop Dashboard
   ══════════════════════════════════════════════════════════════════ */
function DesktopDashboard({ data, loading, error }) {
  const s = data?.summary || {}
  const cropProfitPositive = (s.crop_profit || 0) >= 0

  const stats = [
    { title: 'Total Income',       value: s.total_income,          icon: <DollarOutlined />,       color: '#52c41a', prefix: '₹' },
    { title: 'Total Expenses',     value: s.total_expenses,        icon: <ShoppingCartOutlined />,  color: '#ff4d4f', prefix: '₹' },
    { title: 'Total Savings',      value: s.total_savings,         icon: <MoneyCollectOutlined />,  color: '#1677ff', prefix: '₹' },
    { title: 'Crop Investment',    value: s.total_crop_investment,  icon: <ExperimentOutlined />,   color: '#84CC16', prefix: '₹' },
    { title: 'Harvest P&L',       value: s.crop_profit,            icon: <RiseOutlined />,         color: cropProfitPositive ? '#52c41a' : '#ff4d4f', prefix: cropProfitPositive ? '+₹' : '-₹' },
    { title: 'Current Balance',    value: s.current_balance,        icon: <WalletOutlined />,       color: '#13c2c2', prefix: '₹' },
  ]

  if (error) return <Alert message={error} type="error" showIcon />

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Financial Overview</Title>

      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col key={stat.title} xs={24} sm={12} lg={8} xl={4}>
            <StatCard title={stat.title} value={Math.abs(stat.value || 0)} prefix={stat.prefix}
              icon={stat.icon} color={stat.color} loading={loading} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} xl={16}>
          <Card title="Monthly Trend (Income vs Expenses vs Savings)" loading={loading}>
            {data?.monthly_trend && (
              <LineChart data={data.monthly_trend} lines={[
                { key: 'income',  name: 'Income',   color: '#52c41a' },
                { key: 'expense', name: 'Expenses', color: '#ff4d4f' },
                { key: 'savings', name: 'Savings',  color: '#1677ff' },
              ]} />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="Expenses by Category" loading={loading} style={{ height: '100%' }}>
            {data?.expense_by_category?.length > 0 && (
              <PieChart data={data.expense_by_category} nameKey="category" valueKey="amount" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Income vs Expenses (Monthly)" loading={loading}>
            {data?.income_vs_expense && (
              <BarChart data={data.income_vs_expense} bars={[
                { key: 'income',  name: 'Income',   color: '#52c41a' },
                { key: 'expense', name: 'Expenses', color: '#ff4d4f' },
              ]} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Main export
   ══════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const { data, loading, error } = useSelector((state) => state.dashboard)

  useEffect(() => { dispatch(fetchDashboard()) }, [dispatch])

  return isMobile
    ? <MobileDashboard data={data} loading={loading} />
    : <DesktopDashboard data={data} loading={loading} error={error} />
}

import { Card, Statistic, Typography } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function StatCard({ title, value, prefix, suffix, icon, color = '#1677ff', trend, loading }) {
  return (
    <Card
      loading={loading}
      style={{ borderTop: `3px solid ${color}`, height: '100%' }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ fontSize: 24, fontWeight: 700, color }}
          />
          {trend !== undefined && (
            <Text
              style={{ fontSize: 12, color: trend >= 0 ? '#52c41a' : '#ff4d4f' }}
            >
              {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {' '}{Math.abs(trend).toFixed(1)}% vs last month
            </Text>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

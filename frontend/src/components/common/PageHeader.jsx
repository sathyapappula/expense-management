import { Typography, Space, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function PageHeader({ title, subtitle, onAdd, addLabel = 'Add New', extra }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div>
        <Title level={4} style={{ margin: 0 }}>{title}</Title>
        {subtitle && <Text type="secondary">{subtitle}</Text>}
      </div>
      <Space>
        {extra}
        {onAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {addLabel}
          </Button>
        )}
      </Space>
    </div>
  )
}

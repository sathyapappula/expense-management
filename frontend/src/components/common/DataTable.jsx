import { Table, Button, Space, Tooltip, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

export default function DataTable({
  columns,
  dataSource,
  loading,
  pagination,
  onEdit,
  onDelete,
  rowKey = 'id',
  scroll,
}) {
  const actionColumn = {
    title: 'Actions',
    key: 'actions',
    fixed: 'right',
    width: 100,
    render: (_, record) => (
      <Space>
        {onEdit && (
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              style={{ color: '#1677ff' }}
            />
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this record?"
              description="This action cannot be undone."
              onConfirm={() => onDelete(record)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        )}
      </Space>
    ),
  }

  const allColumns = onEdit || onDelete ? [...columns, actionColumn] : columns

  return (
    <Table
      columns={allColumns}
      dataSource={dataSource}
      loading={loading}
      rowKey={rowKey}
      pagination={pagination}
      scroll={scroll || { x: 'max-content' }}
      size="middle"
    />
  )
}

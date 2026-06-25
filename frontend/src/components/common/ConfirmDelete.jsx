import { Popconfirm } from 'antd'

export default function ConfirmDelete({ title, onConfirm, children }) {
  return (
    <Popconfirm
      title={title || 'Delete this record?'}
      description="This action cannot be undone."
      onConfirm={onConfirm}
      okText="Delete"
      okType="danger"
      cancelText="Cancel"
      placement="topRight"
    >
      {children}
    </Popconfirm>
  )
}

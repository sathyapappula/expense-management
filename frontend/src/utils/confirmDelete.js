import { Modal } from 'antd'

export function confirmDelete(title, onOk) {
  Modal.confirm({
    title: title || 'Delete this record?',
    content: 'This action cannot be undone.',
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    centered: true,
    onOk,
  })
}

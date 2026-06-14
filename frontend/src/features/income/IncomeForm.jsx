import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, DatePicker, Button } from 'antd'
import dayjs from 'dayjs'

export default function IncomeForm({ open, onClose, onSubmit, initialValues, loading }) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({ ...initialValues, date: initialValues.date ? dayjs(initialValues.date) : null })
      } else {
        form.resetFields()
      }
    }
  }, [open, initialValues])

  const handleFinish = (values) => {
    onSubmit({ ...values, date: values.date?.format('YYYY-MM-DD') })
  }

  return (
    <Modal
      title={initialValues ? 'Edit Income' : 'Add Income'}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Date is required' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="source" label="Source" rules={[{ required: true, message: 'Source is required' }]}>
          <Input placeholder="e.g. Salary, Freelance, Business" />
        </Form.Item>
        <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true, message: 'Amount is required' }, { type: 'number', min: 0.01, message: 'Must be positive' }]}>
          <InputNumber style={{ width: '100%' }} min={0.01} precision={2} placeholder="0.00" prefix="₹" />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} placeholder="Optional notes" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Update' : 'Add Income'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

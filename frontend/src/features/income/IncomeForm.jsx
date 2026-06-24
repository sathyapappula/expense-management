import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, DatePicker, Button } from 'antd'
import dayjs from 'dayjs'
import { useIsMobile } from '../../hooks/useIsMobile'
import MobileFormPage from '../../components/common/MobileFormPage'

function IncomeFormFields({ form, onClose, onSubmit, initialValues, loading }) {
  const handleFinish = (values) => {
    onSubmit({ ...values, date: values.date?.format('YYYY-MM-DD') })
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Date is required' }]}>
        <DatePicker style={{ width: '100%' }} size="large" />
      </Form.Item>
      <Form.Item name="source" label="Source" rules={[{ required: true, message: 'Source is required' }]}>
        <Input placeholder="e.g. Salary, Freelance, Business" size="large" />
      </Form.Item>
      <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true, message: 'Amount is required' }, { type: 'number', min: 0.01, message: 'Must be positive' }]}>
        <InputNumber style={{ width: '100%' }} min={0.01} precision={2} placeholder="0.00" prefix="₹" size="large" />
      </Form.Item>
      <Form.Item name="notes" label="Notes">
        <Input.TextArea rows={3} placeholder="Optional notes" />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          {initialValues ? 'Update Income' : 'Add Income'}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default function IncomeForm({ open, onClose, onSubmit, initialValues, loading }) {
  const isMobile = useIsMobile()
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

  if (isMobile) {
    return (
      <MobileFormPage
        open={open}
        onClose={onClose}
        title={initialValues ? 'Edit Income' : 'Add Income'}
      >
        <IncomeFormFields form={form} onClose={onClose} onSubmit={onSubmit} initialValues={initialValues} loading={loading} />
      </MobileFormPage>
    )
  }

  return (
    <Modal
      title={initialValues ? 'Edit Income' : 'Add Income'}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div style={{ marginTop: 16 }}>
        <IncomeFormFields form={form} onClose={onClose} onSubmit={onSubmit} initialValues={initialValues} loading={loading} />
      </div>
    </Modal>
  )
}

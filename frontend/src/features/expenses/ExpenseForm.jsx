import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button } from 'antd'
import dayjs from 'dayjs'
import { useIsMobile } from '../../hooks/useIsMobile'
import MobileFormPage from '../../components/common/MobileFormPage'

const CATEGORIES = [
  'Food & Dining', 'Transport', 'Housing', 'Healthcare',
  'Shopping', 'Education', 'Entertainment', 'Personal Care',
  'Travel', 'Utilities', 'Family', 'Others',
]

const SUBCATEGORIES = {
  'Food & Dining':  ['Groceries', 'Restaurant', 'Snacks', 'Home Cooking', 'Coffee', 'Other'],
  'Transport':      ['Fuel', 'Auto/Taxi', 'Bus/Train', 'Vehicle Service', 'Parking', 'Other'],
  'Housing':        ['Rent', 'Electricity', 'Water', 'Maintenance', 'Internet', 'Other'],
  'Healthcare':     ['Doctor', 'Medicine', 'Hospital', 'Tests/Lab', 'Insurance', 'Other'],
  'Shopping':       ['Clothing', 'Electronics', 'Household', 'Furniture', 'Appliances', 'Other'],
  'Education':      ['School Fees', 'Books', 'Courses', 'Stationery', 'Tuition', 'Other'],
  'Entertainment':  ['Movies', 'Streaming', 'Events', 'Games', 'Hobbies', 'Other'],
  'Personal Care':  ['Salon', 'Gym', 'Cosmetics', 'Spa', 'Other'],
  'Travel':         ['Hotel', 'Flights', 'Local Travel', 'Sightseeing', 'Holiday Package', 'Other'],
  'Utilities':      ['Phone Bill', 'DTH', 'Gas', 'Subscriptions', 'Other'],
  'Family':         ['Gifts', 'Events', 'Children', 'Parents Support', 'Celebrations', 'Other'],
  'Others':         ['Miscellaneous', 'Other'],
}

function ExpenseFormFields({ form, onSubmit, initialValues, loading }) {
  const category = Form.useWatch('category', form)

  const handleFinish = (values) => {
    onSubmit({ ...values, date: values.date?.format('YYYY-MM-DD') })
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Required' }]}>
        <DatePicker style={{ width: '100%' }} size="large" />
      </Form.Item>
      <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Required' }]}>
        <Select placeholder="Select category" size="large" onChange={() => form.setFieldValue('subcategory', undefined)}>
          {CATEGORIES.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item name="subcategory" label="Subcategory">
        <Select placeholder="Select subcategory (optional)" size="large" allowClear disabled={!category}>
          {(SUBCATEGORIES[category] || []).map((s) => <Select.Option key={s} value={s}>{s}</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true }, { type: 'number', min: 0.01, message: 'Must be positive' }]}>
        <InputNumber style={{ width: '100%' }} min={0.01} precision={2} placeholder="0.00" prefix="₹" size="large" />
      </Form.Item>
      <Form.Item name="notes" label="Notes">
        <Input.TextArea rows={3} placeholder="Optional notes" />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          {initialValues ? 'Update Expense' : 'Add Expense'}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default function ExpenseForm({ open, onClose, onSubmit, initialValues, loading }) {
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
        title={initialValues ? 'Edit Expense' : 'Add Expense'}
      >
        <ExpenseFormFields form={form} onSubmit={onSubmit} initialValues={initialValues} loading={loading} />
      </MobileFormPage>
    )
  }

  return (
    <Modal title={initialValues ? 'Edit Expense' : 'Add Expense'} open={open} onCancel={onClose} footer={null} destroyOnClose>
      <div style={{ marginTop: 16 }}>
        <ExpenseFormFields form={form} onSubmit={onSubmit} initialValues={initialValues} loading={loading} />
      </div>
    </Modal>
  )
}

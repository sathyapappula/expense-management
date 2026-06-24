import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Card, Row, Col, Modal, Form, InputNumber, Select, Button,
  Progress, Typography, Alert, Space, DatePicker,
} from 'antd'
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { fetchBudgetByMonth, createBudget, updateBudget, deleteBudget } from './budgetSlice'
import PageHeader from '../../components/common/PageHeader'
import MobileFormPage from '../../components/common/MobileFormPage'
import { formatCurrency } from '../../utils/formatters'
import { useIsMobile } from '../../hooks/useIsMobile'

const { Text } = Typography
const CATEGORIES = [
  'Food & Dining', 'Transport', 'Housing', 'Healthcare',
  'Shopping', 'Education', 'Entertainment', 'Personal Care',
  'Travel', 'Utilities', 'Family', 'Others',
]
const CATEGORY_COLORS = {
  'Food & Dining':  '#F97316',
  'Transport':      '#3B82F6',
  'Housing':        '#8B5CF6',
  'Healthcare':     '#EF4444',
  'Shopping':       '#EC4899',
  'Education':      '#6366F1',
  'Entertainment':  '#A855F7',
  'Personal Care':  '#F59E0B',
  'Travel':         '#06B6D4',
  'Utilities':      '#10B981',
  'Family':         '#F43F5E',
  'Others':         '#6B7280',
}

function BudgetFormFields({ form, onSubmit, editing, loading, onClose }) {
  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Form.Item name="category" label="Category" rules={[{ required: true }]}>
        <Select placeholder="Select category" size="large" disabled={!!editing}>
          {CATEGORIES.map((c) => (
            <Select.Option key={c} value={c}>
              <span style={{ color: CATEGORY_COLORS[c], marginRight: 6 }}>●</span>{c}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="allocated_amount" label="Budget Amount (₹)" rules={[{ required: true }, { type: 'number', min: 1 }]}>
        <InputNumber style={{ width: '100%' }} min={1} precision={2} prefix="₹" size="large" />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          {editing ? 'Update Budget' : 'Set Budget'}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default function BudgetPlanner() {
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const { monthItems, loading } = useSelector((s) => s.budget)
  const [selectedMonth, setSelectedMonth] = useState(dayjs())
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchBudgetByMonth({ year: selectedMonth.year(), month: selectedMonth.month() + 1 }))
  }, [dispatch, selectedMonth])

  const handleSubmit = async (values) => {
    const payload = { ...values, year: selectedMonth.year(), month: selectedMonth.month() + 1 }
    if (editing) {
      await dispatch(updateBudget({ id: editing.id, allocated_amount: values.allocated_amount }))
    } else {
      await dispatch(createBudget(payload))
    }
    setFormOpen(false)
    setEditing(null)
    dispatch(fetchBudgetByMonth({ year: selectedMonth.year(), month: selectedMonth.month() + 1 }))
  }

  const handleDelete = async (id) => {
    await dispatch(deleteBudget(id))
    dispatch(fetchBudgetByMonth({ year: selectedMonth.year(), month: selectedMonth.month() + 1 }))
  }

  const openEdit = (budget) => {
    setEditing(budget)
    form.setFieldsValue({ category: budget.category, allocated_amount: budget.allocated_amount })
    setFormOpen(true)
  }

  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    setFormOpen(true)
  }

  const closeForm = () => { setFormOpen(false); setEditing(null) }

  const overBudget = monthItems.filter((b) => b.is_over_budget)

  return (
    <div>
      <PageHeader
        title="Budget Planner"
        subtitle="Set monthly budgets and track utilization"
        onAdd={openAdd}
        addLabel="Set Budget"
        extra={
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(d) => d && setSelectedMonth(d)}
            allowClear={false}
            format="MMM YYYY"
          />
        }
      />

      {overBudget.length > 0 && (
        <Alert
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          message={`Over budget in ${overBudget.length} categor${overBudget.length > 1 ? 'ies' : 'y'}: ${overBudget.map((b) => b.category).join(', ')}`}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        {monthItems.length === 0 && !loading && (
          <Col span={24}>
            <Card>
              <Text type="secondary">No budgets set for this month. Click "Set Budget" to add one.</Text>
            </Card>
          </Col>
        )}
        {monthItems.map((budget) => {
          const color = CATEGORY_COLORS[budget.category] || '#6B7280'
          return (
            <Col key={budget.id} xs={24} sm={12} xl={8}>
              <Card
                title={<span style={{ color }}>{budget.category}</span>}
                extra={
                  <Space>
                    <Button size="small" onClick={() => openEdit(budget)}>Edit</Button>
                    <Button size="small" danger onClick={() => handleDelete(budget.id)}>Delete</Button>
                  </Space>
                }
                style={{ borderTop: `3px solid ${color}` }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Budget: </Text>
                  <Text strong>{formatCurrency(budget.allocated_amount)}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Spent: </Text>
                  <Text strong style={{ color: budget.is_over_budget ? '#ff4d4f' : '#52c41a' }}>
                    {formatCurrency(budget.spent_amount)}
                  </Text>
                </div>
                <Progress
                  percent={Math.min(Math.round(budget.utilization_pct), 100)}
                  status={budget.is_over_budget ? 'exception' : budget.utilization_pct > 80 ? 'active' : 'normal'}
                  strokeColor={budget.is_over_budget ? '#ff4d4f' : color}
                  format={(pct) => `${pct}%`}
                />
                {budget.is_over_budget ? (
                  <Text type="danger" style={{ fontSize: 12 }}>
                    <WarningOutlined /> Over by {formatCurrency(budget.spent_amount - budget.allocated_amount)}
                  </Text>
                ) : (
                  <Text type="success" style={{ fontSize: 12 }}>
                    <CheckCircleOutlined /> {formatCurrency(budget.allocated_amount - budget.spent_amount)} remaining
                  </Text>
                )}
              </Card>
            </Col>
          )
        })}
      </Row>

      {/* Mobile: full page */}
      {isMobile ? (
        <MobileFormPage open={formOpen} onClose={closeForm} title={editing ? 'Edit Budget' : 'Set Budget'}>
          <BudgetFormFields form={form} onSubmit={handleSubmit} editing={editing} loading={loading} onClose={closeForm} />
        </MobileFormPage>
      ) : (
        <Modal
          title={editing ? 'Edit Budget' : 'Set Budget'}
          open={formOpen}
          onCancel={closeForm}
          footer={null}
          destroyOnClose
        >
          <div style={{ marginTop: 16 }}>
            <BudgetFormFields form={form} onSubmit={handleSubmit} editing={editing} loading={loading} onClose={closeForm} />
          </div>
        </Modal>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Input, DatePicker, Space, Tag, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { fetchIncome, createIncome, updateIncome, deleteIncome } from './incomeSlice'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import IncomeForm from './IncomeForm'
import { formatCurrency, formatDate } from '../../utils/formatters'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function IncomeList() {
  const dispatch = useDispatch()
  const { items, total, page, page_size, loading } = useSelector((s) => s.income)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filters, setFilters] = useState({ page: 1, page_size: 20 })

  useEffect(() => {
    dispatch(fetchIncome(filters))
  }, [dispatch, filters])

  const handleSubmit = async (values) => {
    if (editing) {
      await dispatch(updateIncome({ id: editing.id, ...values }))
    } else {
      await dispatch(createIncome(values))
    }
    setFormOpen(false)
    setEditing(null)
    dispatch(fetchIncome(filters))
  }

  const handleDelete = async (record) => {
    await dispatch(deleteIncome(record.id))
    dispatch(fetchIncome(filters))
  }

  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date', render: (v) => formatDate(v), sorter: true },
    { title: 'Source', dataIndex: 'source', key: 'source' },
    {
      title: 'Amount', dataIndex: 'amount', key: 'amount',
      render: (v) => <Typography.Text strong style={{ color: '#52c41a' }}>{formatCurrency(v)}</Typography.Text>,
    },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: (v) => v || '-' },
  ]

  return (
    <div>
      <PageHeader
        title="Income Management"
        subtitle="Track all your income sources"
        onAdd={() => { setEditing(null); setFormOpen(true) }}
        addLabel="Add Income"
      />

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Search by source"
            prefix={<SearchOutlined />}
            style={{ width: 220 }}
            allowClear
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
          />
          <RangePicker
            onChange={(dates) => {
              setFilters((f) => ({
                ...f,
                date_from: dates?.[0]?.format('YYYY-MM-DD'),
                date_to: dates?.[1]?.format('YYYY-MM-DD'),
                page: 1,
              }))
            }}
          />
        </Space>
      </Card>

      <Card>
        <DataTable
          columns={columns}
          dataSource={items}
          loading={loading}
          pagination={{
            current: page,
            pageSize: page_size,
            total,
            onChange: (p, ps) => setFilters((f) => ({ ...f, page: p, page_size: ps })),
            showTotal: (t) => `Total ${t} records`,
          }}
          onEdit={(record) => { setEditing(record); setFormOpen(true) }}
          onDelete={handleDelete}
        />
      </Card>

      <IncomeForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initialValues={editing}
        loading={loading}
      />
    </div>
  )
}

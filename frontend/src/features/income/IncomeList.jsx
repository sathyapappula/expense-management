import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Input, DatePicker, Space, Typography, Skeleton, Empty } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { IonIcon } from '@ionic/react'
import { addOutline, cashOutline } from 'ionicons/icons'
import { fetchIncome, createIncome, updateIncome, deleteIncome } from './incomeSlice'
import { confirmDelete } from '../../utils/confirmDelete'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import IncomeForm from './IncomeForm'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { useIsMobile } from '../../hooks/useIsMobile'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const fmt = (v) => {
  if (!v && v !== 0) return '₹0'
  const n = Number(v)
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000)    return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toFixed(0)}`
}

/* ════════════════════════════════════════════════════════════════
   Mobile Income View
   ════════════════════════════════════════════════════════════════ */
function MobileIncomeView({ items, loading, onAdd, onEdit, onDelete }) {
  const total = items.reduce((s, i) => s + i.amount, 0)
  const thisMonth = items.filter(i => dayjs(i.date).month() === dayjs().month() && dayjs(i.date).year() === dayjs().year())
  const monthTotal = thisMonth.reduce((s, i) => s + i.amount, 0)

  // group by date
  const grouped = {}
  items.forEach(i => {
    if (!grouped[i.date]) grouped[i.date] = []
    grouped[i.date].push(i)
  })
  const groupedEntries = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Page heading */}
      <div className="mob-page-heading">
        <div>
          <div className="mob-page-title">Income</div>
          <div className="mob-page-sub">All your income sources</div>
        </div>
      </div>

      {/* Summary card */}
      <div className="income-hero-card">
        <div className="income-hero-content">
          <div className="income-hero-label">This Month's Income</div>
          <div className="income-hero-amount"><small>₹</small>{Number(monthTotal).toLocaleString('en-IN')}</div>
          <div className="income-hero-row">
            <div className="income-hero-stat">
              <div className="income-hero-stat-label">All Time</div>
              <div className="income-hero-stat-value">{fmt(total)}</div>
            </div>
            <div className="income-hero-stat">
              <div className="income-hero-stat-label">Entries</div>
              <div className="income-hero-stat-value">{items.length}</div>
            </div>
            <div className="income-hero-stat">
              <div className="income-hero-stat-label">This Month</div>
              <div className="income-hero-stat-value">{thisMonth.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} active avatar paragraph={{ rows: 1 }} style={{ marginBottom: 8, padding: '0 4px' }} />
        ))
      ) : groupedEntries.length === 0 ? (
        <Empty description="No income recorded yet. Tap + to add." style={{ marginTop: 40 }} />
      ) : (
        groupedEntries.map(([date, dayItems]) => (
          <div key={date} className="exp-date-group">
            <div className="exp-date-label">{formatDate(date)}</div>
            {dayItems.map(item => (
              <div key={item.id} className="exp-item-card">
                <div className="exp-item-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                  <IonIcon icon={cashOutline} style={{ color: '#10B981' }} />
                </div>
                <div className="exp-item-info">
                  <div className="exp-item-cat">{item.source}</div>
                  {item.notes && <div className="exp-item-note">{item.notes}</div>}
                </div>
                <div className="exp-item-right">
                  <div className="exp-item-amt" style={{ color: '#10B981' }}>+{fmt(item.amount)}</div>
                  <div className="exp-item-actions">
                    <button className="exp-action-btn" onClick={() => onEdit(item)}>
                      <EditOutlined />
                    </button>
                    <button className="exp-action-btn danger" onClick={() => confirmDelete('Delete this income?', () => onDelete(item))}>
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {/* FAB */}
      <button className="exp-fab" onClick={onAdd}>
        <IonIcon icon={addOutline} style={{ fontSize: 24 }} />
      </button>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   Main Export
   ════════════════════════════════════════════════════════════════ */
export default function IncomeList() {
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const { items, total, page, page_size, loading } = useSelector((s) => s.income)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filters, setFilters] = useState({ page: 1, page_size: 100 })

  useEffect(() => { dispatch(fetchIncome(filters)) }, [dispatch, filters])

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

  const openAdd = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (record) => { setEditing(record); setFormOpen(true) }

  if (isMobile) {
    return (
      <>
        <MobileIncomeView
          items={items}
          loading={loading}
          onAdd={openAdd}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
        <IncomeForm
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditing(null) }}
          onSubmit={handleSubmit}
          initialValues={editing}
          loading={loading}
        />
      </>
    )
  }

  const columns = [
    { title: 'Date',   dataIndex: 'date',   key: 'date',   render: (v) => formatDate(v), sorter: true },
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
        onAdd={openAdd}
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
            onChange={(dates) => setFilters((f) => ({
              ...f,
              date_from: dates?.[0]?.format('YYYY-MM-DD'),
              date_to: dates?.[1]?.format('YYYY-MM-DD'),
              page: 1,
            }))}
          />
        </Space>
      </Card>
      <Card>
        <DataTable
          columns={columns}
          dataSource={items}
          loading={loading}
          pagination={{
            current: page, pageSize: page_size, total,
            onChange: (p, ps) => setFilters((f) => ({ ...f, page: p, page_size: ps })),
            showTotal: (t) => `Total ${t} records`,
          }}
          onEdit={openEdit}
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

import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Input, DatePicker, Tag, Typography, Progress, Empty, Skeleton, Button } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { IonIcon } from '@ionic/react'
import {
  restaurantOutline, carOutline, homeOutline, medkitOutline,
  bagOutline, schoolOutline, filmOutline, personOutline,
  airplaneOutline, flashOutline, peopleOutline,
  ellipsisHorizontalOutline, addOutline, cloudUploadOutline,
} from 'ionicons/icons'
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from './expenseSlice'
import ConfirmDelete from '../../components/common/ConfirmDelete'
import ExpenseForm from './ExpenseForm'
import ImportExpenses from './ImportExpenses'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { useIsMobile } from '../../hooks/useIsMobile'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'

const { RangePicker } = DatePicker

/* ── Category meta ──────────────────────────────────────────────── */
const CAT_META = {
  'Food & Dining':  { icon: restaurantOutline, color: '#F97316', bg: '#FFF4ED' },
  'Transport':      { icon: carOutline,        color: '#3B82F6', bg: '#EFF6FF' },
  'Housing':        { icon: homeOutline,       color: '#8B5CF6', bg: '#F5F3FF' },
  'Healthcare':     { icon: medkitOutline,     color: '#EF4444', bg: '#FEF2F2' },
  'Shopping':       { icon: bagOutline,        color: '#EC4899', bg: '#FDF2F8' },
  'Education':      { icon: schoolOutline,     color: '#6366F1', bg: '#EEF2FF' },
  'Entertainment':  { icon: filmOutline,       color: '#A855F7', bg: '#FAF5FF' },
  'Personal Care':  { icon: personOutline,     color: '#F59E0B', bg: '#FFFBEB' },
  'Travel':         { icon: airplaneOutline,   color: '#06B6D4', bg: '#ECFEFF' },
  'Utilities':      { icon: flashOutline,      color: '#10B981', bg: '#ECFDF5' },
  'Family':         { icon: peopleOutline,     color: '#F43F5E', bg: '#FFF1F2' },
  'Others':         { icon: ellipsisHorizontalOutline, color: '#6B7280', bg: '#F9FAFB' },
}

const ALL_CATS = Object.keys(CAT_META)

const fmt = (v) => {
  if (!v && v !== 0) return '₹0'
  const n = Number(v)
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000)    return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toFixed(0)}`
}

/* ════════════════════════════════════════════════════════════════
   Mobile Expense View
   ════════════════════════════════════════════════════════════════ */
function MobileExpenseView({ items, loading, onAdd, onEdit, onDelete, onImport }) {
  const [activeTab, setActiveTab] = useState('All')

  const filtered = useMemo(() =>
    activeTab === 'All' ? items : items.filter(i => i.category === activeTab),
    [items, activeTab]
  )

  /* category totals for breakdown bar */
  const catTotals = useMemo(() => {
    const map = {}
    items.forEach(i => { map[i.category] = (map[i.category] || 0) + i.amount })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [items])

  const grandTotal = catTotals.reduce((s, [, v]) => s + v, 0)

  /* group filtered items by date */
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(i => {
      const d = i.date
      if (!map[d]) map[d] = []
      map[d].push(i)
    })
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  return (
    <div style={{ paddingBottom: 100 }}>

      {/* ── Page heading ─────────────────────────────────── */}
      <div className="mob-page-heading">
        <div>
          <div className="mob-page-title">Expenses</div>
          <div className="mob-page-sub">Track & categorize your spending</div>
        </div>
        <button className="imp-fab-chip" onClick={onImport}>
          <IonIcon icon={cloudUploadOutline} style={{ fontSize: 15 }} />
          Import
        </button>
      </div>

      {/* ── Category breakdown ────────────────────────────── */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} style={{ marginBottom: 16 }} />
      ) : catTotals.length > 0 ? (
        <div className="exp-breakdown-card">
          <div className="exp-breakdown-title">Spending Breakdown</div>
          <div className="exp-breakdown-total">{fmt(grandTotal)}</div>
          <div style={{ marginTop: 12 }}>
            {catTotals.slice(0, 5).map(([cat, amt]) => {
              const m = CAT_META[cat] || CAT_META['Others']
              const pct = grandTotal ? Math.round((amt / grandTotal) * 100) : 0
              return (
                <div key={cat} className="exp-bar-row" onClick={() => setActiveTab(cat)}>
                  <div className="exp-bar-icon" style={{ background: m.bg }}>
                    <IonIcon icon={m.icon} style={{ color: m.color, fontSize: 15 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="exp-bar-label-row">
                      <span className="exp-bar-name">{cat}</span>
                      <span className="exp-bar-amt">{fmt(amt)}</span>
                    </div>
                    <Progress
                      percent={pct} showInfo={false} size="small"
                      strokeColor={m.color}
                      trailColor="var(--ft-border)"
                      style={{ margin: 0 }}
                    />
                  </div>
                  <span className="exp-bar-pct">{pct}%</span>
                </div>
              )
            })}
            {catTotals.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: 6, fontSize: 12, color: 'var(--ft-text-3)', cursor: 'pointer' }}
                onClick={() => setActiveTab('All')}>
                +{catTotals.length - 5} more categories
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ── Category filter tabs ──────────────────────────── */}
      <div className="exp-tab-scroll">
        {['All', ...ALL_CATS].map(tab => (
          <button
            key={tab}
            className={`exp-tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab !== 'All' && (
              <IonIcon icon={CAT_META[tab]?.icon} style={{ fontSize: 13, marginRight: 4 }} />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* ── Expense list grouped by date ──────────────────── */}
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} active avatar paragraph={{ rows: 1 }} style={{ marginBottom: 8, padding: '0 4px' }} />
        ))
      ) : grouped.length === 0 ? (
        <Empty description="No expenses found" style={{ marginTop: 40 }} />
      ) : (
        grouped.map(([date, dayItems]) => (
          <div key={date} className="exp-date-group">
            <div className="exp-date-label">{formatDate(date)}</div>
            {dayItems.map(item => {
              const m = CAT_META[item.category] || CAT_META['Others']
              return (
                <div key={item.id} className="exp-item-card">
                  <div className="exp-item-icon" style={{ background: m.bg }}>
                    <IonIcon icon={m.icon} style={{ color: m.color }} />
                  </div>
                  <div className="exp-item-info">
                    <div className="exp-item-cat">{item.category}</div>
                    {item.subcategory && <div className="exp-item-sub">{item.subcategory}</div>}
                    {item.notes && <div className="exp-item-note">{item.notes}</div>}
                  </div>
                  <div className="exp-item-right">
                    <div className="exp-item-amt">-{fmt(item.amount)}</div>
                    <div className="exp-item-actions">
                      <button className="exp-action-btn" onClick={() => onEdit(item)}>
                        <EditOutlined />
                      </button>
                      <ConfirmDelete title="Delete this expense?" onConfirm={() => onDelete(item)}>
                        <button className="exp-action-btn danger">
                          <DeleteOutlined />
                        </button>
                      </ConfirmDelete>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))
      )}

      {/* ── FAB ──────────────────────────────────────────── */}
      <button className="exp-fab" onClick={onAdd}>
        <IonIcon icon={addOutline} style={{ fontSize: 24 }} />
      </button>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   Desktop Expense View
   ════════════════════════════════════════════════════════════════ */
const CATEGORIES = ALL_CATS
const CAT_COLORS = {
  'Food & Dining': 'orange', 'Transport': 'blue', 'Housing': 'purple',
  'Healthcare': 'red', 'Shopping': 'pink', 'Education': 'geekblue',
  'Entertainment': 'magenta', 'Personal Care': 'gold', 'Travel': 'cyan',
  'Utilities': 'green', 'Family': 'volcano', 'Others': 'default',
}

function DesktopExpenseView({ items, total, page, page_size, loading, filters, setFilters, onAdd, onEdit, onDelete }) {
  const columns = [
    { title: 'Date',        dataIndex: 'date',        key: 'date',        render: (v) => formatDate(v) },
    { title: 'Category',    dataIndex: 'category',    key: 'category',    render: (v) => <Tag color={CAT_COLORS[v] || 'default'}>{v}</Tag> },
    { title: 'Subcategory', dataIndex: 'subcategory', key: 'subcategory', render: (v) => v || '-' },
    { title: 'Amount',      dataIndex: 'amount',      key: 'amount',      render: (v) => <Typography.Text strong style={{ color: '#ff4d4f' }}>{formatCurrency(v)}</Typography.Text> },
    { title: 'Notes',       dataIndex: 'notes',       key: 'notes',       render: (v) => v || '-', ellipsis: true },
  ]

  return (
    <div>
      <PageHeader title="Expense Management" subtitle="Track and categorize all your expenses" onAdd={onAdd} addLabel="Add Expense" />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input
            placeholder="Search notes"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            allowClear
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
          />
          <select
            style={{ height: 32, borderRadius: 6, border: '1px solid #d9d9d9', padding: '0 8px', fontSize: 13 }}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || undefined, page: 1 }))}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <RangePicker onChange={(d) => setFilters((f) => ({ ...f, date_from: d?.[0]?.format('YYYY-MM-DD'), date_to: d?.[1]?.format('YYYY-MM-DD'), page: 1 }))} />
        </div>
      </Card>
      <Card>
        <DataTable
          columns={columns}
          dataSource={items}
          loading={loading}
          pagination={{ current: page, pageSize: page_size, total, onChange: (p, ps) => setFilters((f) => ({ ...f, page: p, page_size: ps })), showTotal: (t) => `Total ${t} records` }}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Card>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   Main Export
   ════════════════════════════════════════════════════════════════ */
export default function ExpenseList() {
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const { items, total, page, page_size, loading } = useSelector((s) => s.expense)
  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filters, setFilters] = useState({ page: 1, page_size: 100 })

  useEffect(() => { dispatch(fetchExpenses(filters)) }, [dispatch, filters])

  const handleSubmit = async (values) => {
    if (editing) await dispatch(updateExpense({ id: editing.id, ...values }))
    else await dispatch(createExpense(values))
    setFormOpen(false)
    setEditing(null)
    dispatch(fetchExpenses(filters))
  }

  const handleEdit = (record) => { setEditing(record); setFormOpen(true) }
  const handleDelete = async (record) => { await dispatch(deleteExpense(record.id)); dispatch(fetchExpenses(filters)) }
  const handleAdd = () => { setEditing(null); setFormOpen(true) }

  return (
    <>
      {isMobile ? (
        <MobileExpenseView
          items={items}
          loading={loading}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onImport={() => setImportOpen(true)}
        />
      ) : (
        <DesktopExpenseView
          items={items} total={total} page={page} page_size={page_size} loading={loading}
          filters={filters} setFilters={setFilters}
          onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}
        />
      )}
      <ExpenseForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initialValues={editing}
        loading={loading}
      />
      <ImportExpenses
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => { setImportOpen(false); dispatch(fetchExpenses(filters)) }}
      />
    </>
  )
}

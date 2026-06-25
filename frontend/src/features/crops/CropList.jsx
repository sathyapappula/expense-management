import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Input, Select, DatePicker, InputNumber, Button, Skeleton, Empty } from 'antd'
import { IonIcon } from '@ionic/react'
import {
  leafOutline, addOutline, trashOutline, createOutline,
  calendarOutline, scaleOutline, cashOutline, trendingUpOutline,
  checkmarkCircleOutline, alertCircleOutline, timeOutline,
} from 'ionicons/icons'
import dayjs from 'dayjs'
import {
  fetchCrops, createCrop, updateCrop, deleteCrop, addCropExpense, deleteCropExpense,
} from './cropSlice'
import { formatCurrency } from '../../utils/formatters'
import MobileFormPage from '../../components/common/MobileFormPage'

const CROP_TYPES = ['Paddy', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Groundnut', 'Sunflower', 'Soybean', 'Vegetables', 'Fruits', 'Other']
const EXPENSE_TYPES = ['Seeds', 'Fertilizer', 'Pesticide', 'Irrigation', 'Labor', 'Equipment', 'Transport', 'Other']

const STATUS_META = {
  active:    { label: 'Growing',   color: '#10B981', bg: '#D1FAE5', icon: timeOutline },
  harvested: { label: 'Harvested', color: '#6366F1', bg: '#EEF2FF', icon: checkmarkCircleOutline },
  failed:    { label: 'Failed',    color: '#EF4444', bg: '#FEE2E2', icon: alertCircleOutline },
}

const fmt = (v) => {
  if (!v && v !== 0) return '₹0'
  const n = Number(v)
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000)    return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toFixed(0)}`
}

/* ── Crop Form ──────────────────────────────────────────────────── */
function CropForm({ open, onClose, onSubmit, initial, loading }) {
  const [form] = Form.useForm()
  useEffect(() => {
    if (open) {
      initial
        ? form.setFieldsValue({
            ...initial,
            start_date: initial.start_date ? dayjs(initial.start_date) : null,
            expected_harvest_date: initial.expected_harvest_date ? dayjs(initial.expected_harvest_date) : null,
          })
        : form.resetFields()
    }
  }, [open, initial])

  return (
    <MobileFormPage open={open} onClose={onClose} title={initial ? 'Edit Crop' : 'New Crop'}>
      <Form form={form} layout="vertical" onFinish={(v) => onSubmit({ ...v, start_date: v.start_date?.format('YYYY-MM-DD'), expected_harvest_date: v.expected_harvest_date?.format('YYYY-MM-DD') })}>
        <Form.Item name="name" label="Crop Name / Label" rules={[{ required: true }]} extra="e.g. Paddy - Kharif 2024">
          <Input placeholder="e.g. Paddy Kharif 2024" size="large" />
        </Form.Item>
        <Form.Item name="crop_type" label="Crop Type" rules={[{ required: true }]}>
          <Select placeholder="Select crop type" size="large">
            {CROP_TYPES.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="area_acres" label="Area (Acres)">
          <InputNumber style={{ width: '100%' }} min={0.1} step={0.5} placeholder="e.g. 2.5" size="large" />
        </Form.Item>
        <Form.Item name="start_date" label="Sowing / Start Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} size="large" />
        </Form.Item>
        <Form.Item name="expected_harvest_date" label="Expected Harvest Date">
          <DatePicker style={{ width: '100%' }} size="large" />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} placeholder="Field location, variety, etc." />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            {initial ? 'Update Crop' : 'Create Crop'}
          </Button>
        </Form.Item>
      </Form>
    </MobileFormPage>
  )
}

/* ── Crop Expense Form ──────────────────────────────────────────── */
function CropExpenseForm({ open, onClose, onSubmit, loading }) {
  const [form] = Form.useForm()
  useEffect(() => { if (open) form.resetFields() }, [open])
  return (
    <MobileFormPage open={open} onClose={onClose} title="Add Crop Expense">
      <Form form={form} layout="vertical" onFinish={(v) => onSubmit({ ...v, date: v.date?.format('YYYY-MM-DD') })}>
        <Form.Item name="date" label="Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} defaultValue={dayjs()} size="large" />
        </Form.Item>
        <Form.Item name="expense_type" label="Expense Type" rules={[{ required: true }]}>
          <Select placeholder="Select type" size="large">
            {EXPENSE_TYPES.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true }, { type: 'number', min: 0.01 }]}>
          <InputNumber style={{ width: '100%' }} min={0.01} precision={2} prefix="₹" size="large" />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input placeholder="Supplier, quantity, etc." size="large" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">Add Expense</Button>
        </Form.Item>
      </Form>
    </MobileFormPage>
  )
}

/* ── Harvest Form ───────────────────────────────────────────────── */
function HarvestForm({ open, onClose, onSubmit, crop, loading }) {
  const [form] = Form.useForm()
  useEffect(() => { if (open) form.resetFields() }, [open])
  return (
    <MobileFormPage open={open} onClose={onClose} title="Record Harvest & Sale">
      <div style={{ background: '#F0FDF4', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#15803D', fontWeight: 600 }}>Total Spent on {crop?.name}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#166534' }}>{fmt(crop?.total_expenses)}</div>
      </div>
      <Form form={form} layout="vertical" onFinish={(v) => onSubmit({ ...v, actual_harvest_date: v.actual_harvest_date?.format('YYYY-MM-DD'), status: 'harvested' })}>
        <Form.Item name="actual_harvest_date" label="Harvest Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} defaultValue={dayjs()} size="large" />
        </Form.Item>
        <Form.Item name="sale_amount" label="Total Sale Amount (₹)" rules={[{ required: true }, { type: 'number', min: 0 }]}>
          <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="₹" placeholder="Amount received from buyer" size="large" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button htmlType="submit" loading={loading} block size="large" style={{ background: '#16A34A', borderColor: '#16A34A', color: '#fff', height: 52, borderRadius: 14, fontWeight: 700 }}>
            Mark Harvested
          </Button>
        </Form.Item>
      </Form>
    </MobileFormPage>
  )
}

/* ── Crop Detail Page ───────────────────────────────────────────── */
function CropDetail({ crop, onClose, onAddExpense, onDeleteExpense, onHarvest, onEdit, onDelete, loading }) {
  const [expFormOpen, setExpFormOpen] = useState(false)
  const [harvestOpen, setHarvestOpen] = useState(false)
  const sm = STATUS_META[crop.status] || STATUS_META.active
  const isProfitable = crop.net_profit >= 0

  return (
    <>
      <MobileFormPage open={true} onClose={onClose} title={crop.name}>
        {/* Type / area / status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ color: 'var(--ft-text-3)', fontSize: 13 }}>
            {crop.crop_type}{crop.area_acres ? ` · ${crop.area_acres} acres` : ''}
          </div>
          <div className="crop-status-badge" style={{ background: sm.bg, color: sm.color }}>
            <IonIcon icon={sm.icon} style={{ fontSize: 11 }} /> {sm.label}
          </div>
        </div>

        {/* P&L Summary */}
        <div className="crop-pl-row">
          <div className="crop-pl-card spent">
            <div className="crop-pl-label">Total Spent</div>
            <div className="crop-pl-value">{fmt(crop.total_expenses)}</div>
          </div>
          <div className="crop-pl-card sale">
            <div className="crop-pl-label">Sale Amount</div>
            <div className="crop-pl-value">{fmt(crop.sale_amount)}</div>
          </div>
          <div className={`crop-pl-card profit ${isProfitable ? 'pos' : 'neg'}`}>
            <div className="crop-pl-label">Net {isProfitable ? 'Profit' : 'Loss'}</div>
            <div className="crop-pl-value">{fmt(Math.abs(crop.net_profit))}</div>
            {crop.total_expenses > 0 && (
              <div className="crop-pl-roi">{crop.roi_pct > 0 ? '+' : ''}{crop.roi_pct}% ROI</div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <div className="crop-date-chip">
            <IonIcon icon={calendarOutline} />
            <span>Sown: {crop.start_date}</span>
          </div>
          {crop.expected_harvest_date && crop.status === 'active' && (
            <div className="crop-date-chip">
              <IonIcon icon={timeOutline} />
              <span>Expected: {crop.expected_harvest_date}</span>
            </div>
          )}
          {crop.actual_harvest_date && (
            <div className="crop-date-chip" style={{ color: '#16A34A' }}>
              <IonIcon icon={checkmarkCircleOutline} />
              <span>Harvested: {crop.actual_harvest_date}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <button className="crop-action-pill" onClick={() => setExpFormOpen(true)}>
            <IonIcon icon={addOutline} /> Add Expense
          </button>
          {crop.status === 'active' && (
            <button className="crop-action-pill harvest" onClick={() => setHarvestOpen(true)}>
              <IonIcon icon={checkmarkCircleOutline} /> Mark Harvested
            </button>
          )}
          <button className="crop-action-pill edit" onClick={() => onEdit(crop)}>
            <IonIcon icon={createOutline} /> Edit
          </button>
          <button className="crop-action-pill danger" onClick={() => { if (window.confirm('Delete this crop?')) onDelete(crop.id) }}>
            <IonIcon icon={trashOutline} /> Delete
          </button>
        </div>

        {/* Expense list */}
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: 'var(--ft-text-3)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Expense Ledger ({crop.expenses.length})
        </div>
        {crop.expenses.length === 0 ? (
          <div style={{ color: 'var(--ft-text-3)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
            No expenses yet. Tap "Add Expense" above.
          </div>
        ) : (
          crop.expenses.map(e => (
            <div key={e.id} className="crop-exp-row">
              <div className="crop-exp-type-badge">{e.expense_type}</div>
              <div className="crop-exp-info">
                <div className="crop-exp-note">{e.notes || '—'}</div>
                <div className="crop-exp-date">{e.date}</div>
              </div>
              <div className="crop-exp-amount">-{fmt(e.amount)}</div>
              <button className="exp-action-btn danger" onClick={() => onDeleteExpense(crop.id, e.id)}>
                <IonIcon icon={trashOutline} style={{ fontSize: 12 }} />
              </button>
            </div>
          ))
        )}
      </MobileFormPage>

      <CropExpenseForm
        open={expFormOpen}
        onClose={() => setExpFormOpen(false)}
        onSubmit={(v) => { onAddExpense(crop.id, v); setExpFormOpen(false) }}
        loading={loading}
      />
      <HarvestForm
        open={harvestOpen}
        onClose={() => setHarvestOpen(false)}
        onSubmit={(v) => { onHarvest(crop.id, v); setHarvestOpen(false) }}
        crop={crop}
        loading={loading}
      />
    </>
  )
}

/* ── Main CropList ──────────────────────────────────────────────── */
export default function CropList() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector(s => s.crops)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { dispatch(fetchCrops()) }, [dispatch])

  const filtered = items.filter(c => filter === 'all' ? true : c.status === filter)

  const handleCreate = async (data) => { await dispatch(createCrop(data)); setFormOpen(false) }
  const handleUpdate = async (data) => {
    await dispatch(updateCrop({ id: editing.id, ...data }))
    setEditing(null); setFormOpen(false)
    if (selected?.id === editing.id) setSelected(items.find(c => c.id === editing.id))
  }
  const handleDelete = async (id) => { await dispatch(deleteCrop(id)); if (selected?.id === id) setSelected(null) }
  const handleAddExpense = async (cropId, data) => {
    const result = await dispatch(addCropExpense({ cropId, ...data }))
    if (result.payload) setSelected(result.payload)
  }
  const handleDeleteExpense = async (cropId, expenseId) => {
    await dispatch(deleteCropExpense({ cropId, expenseId }))
    await dispatch(fetchCrops())
    const updated = items.find(c => c.id === cropId)
    if (updated) setSelected(updated)
  }
  const handleHarvest = async (cropId, data) => {
    const result = await dispatch(updateCrop({ id: cropId, ...data }))
    if (result.payload) setSelected(result.payload)
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Page heading */}
      <div className="mob-page-heading">
        <div>
          <div className="mob-page-title">Crops</div>
          <div className="mob-page-sub">Track investment & harvest P&L</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="exp-tab-scroll" style={{ marginBottom: 12 }}>
        {[['all','All Crops'],['active','Growing'],['harvested','Harvested']].map(([k, l]) => (
          <button key={k} className={`exp-tab-btn${filter === k ? ' active' : ''}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      {/* Stats bar */}
      {items.length > 0 && (
        <div className="crop-stats-bar">
          <div className="crop-stat">
            <div className="crop-stat-val">{items.filter(c => c.status === 'active').length}</div>
            <div className="crop-stat-lbl">Growing</div>
          </div>
          <div className="crop-stat-div" />
          <div className="crop-stat">
            <div className="crop-stat-val">{fmt(items.reduce((s, c) => s + c.total_expenses, 0))}</div>
            <div className="crop-stat-lbl">Total Spent</div>
          </div>
          <div className="crop-stat-div" />
          <div className="crop-stat">
            <div className="crop-stat-val" style={{ color: items.reduce((s, c) => s + c.net_profit, 0) >= 0 ? '#10B981' : '#EF4444' }}>
              {fmt(Math.abs(items.reduce((s, c) => s + c.net_profit, 0)))}
            </div>
            <div className="crop-stat-lbl">Net P&L</div>
          </div>
        </div>
      )}

      {/* Crop cards */}
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} active paragraph={{ rows: 3 }} style={{ marginBottom: 12 }} />)
      ) : filtered.length === 0 ? (
        <Empty description={filter === 'all' ? 'No crops yet. Tap + to add your first crop.' : `No ${filter} crops.`} style={{ marginTop: 40 }} />
      ) : (
        filtered.map(crop => {
          const sm = STATUS_META[crop.status] || STATUS_META.active
          const isProfitable = crop.net_profit >= 0
          return (
            <div key={crop.id} className="crop-card" onClick={() => setSelected(crop)}>
              <div className="crop-card-header">
                <div className="crop-card-icon" style={{ background: sm.bg }}>
                  <IonIcon icon={leafOutline} style={{ color: sm.color, fontSize: 20 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="crop-card-name">{crop.name}</div>
                  <div className="crop-card-type">{crop.crop_type}{crop.area_acres ? ` · ${crop.area_acres} acres` : ''}</div>
                </div>
                <div className="crop-status-badge" style={{ background: sm.bg, color: sm.color }}>
                  <IonIcon icon={sm.icon} style={{ fontSize: 11 }} /> {sm.label}
                </div>
              </div>
              <div className="crop-card-metrics">
                <div className="crop-metric">
                  <IonIcon icon={cashOutline} style={{ color: '#EF4444' }} />
                  <div>
                    <div className="crop-metric-val" style={{ color: '#EF4444' }}>{fmt(crop.total_expenses)}</div>
                    <div className="crop-metric-lbl">Spent</div>
                  </div>
                </div>
                <div className="crop-metric">
                  <IonIcon icon={scaleOutline} style={{ color: '#6366F1' }} />
                  <div>
                    <div className="crop-metric-val" style={{ color: '#6366F1' }}>{fmt(crop.sale_amount)}</div>
                    <div className="crop-metric-lbl">Sale</div>
                  </div>
                </div>
                <div className="crop-metric">
                  <IonIcon icon={trendingUpOutline} style={{ color: isProfitable ? '#10B981' : '#EF4444' }} />
                  <div>
                    <div className="crop-metric-val" style={{ color: isProfitable ? '#10B981' : '#EF4444' }}>
                      {isProfitable ? '+' : '-'}{fmt(Math.abs(crop.net_profit))}
                    </div>
                    <div className="crop-metric-lbl">{isProfitable ? 'Profit' : 'Loss'}</div>
                  </div>
                </div>
              </div>
              <div className="crop-card-footer">
                <IonIcon icon={calendarOutline} style={{ fontSize: 12 }} />
                <span>Started {crop.start_date}</span>
                {crop.expenses.length > 0 && <span className="crop-exp-count">{crop.expenses.length} expenses</span>}
              </div>
            </div>
          )
        })
      )}

      {/* FAB */}
      <button className="exp-fab" onClick={() => { setEditing(null); setFormOpen(true) }}>
        <IonIcon icon={addOutline} style={{ fontSize: 24 }} />
      </button>

      <CropForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null) }} onSubmit={editing ? handleUpdate : handleCreate} initial={editing} loading={loading} />

      {selected && (
        <CropDetail
          crop={selected}
          onClose={() => setSelected(null)}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
          onHarvest={handleHarvest}
          onEdit={(c) => { setEditing(c); setFormOpen(true); setSelected(null) }}
          onDelete={async (id) => { await handleDelete(id); setSelected(null) }}
          loading={loading}
        />
      )}
    </div>
  )
}

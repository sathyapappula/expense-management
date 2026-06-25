import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IonIcon } from '@ionic/react'
import {
  cardOutline, addOutline, pencilOutline, trashOutline,
  checkmarkCircleOutline, timeOutline, alertCircleOutline,
  chevronDownOutline, chevronUpOutline,
} from 'ionicons/icons'
import { Form, Input, InputNumber, DatePicker, Select, Button } from 'antd'
import dayjs from 'dayjs'
import MobileFormPage from '../../components/common/MobileFormPage'
import ConfirmDelete from '../../components/common/ConfirmDelete'
import {
  fetchCards, createCard, updateCard, deleteCard,
  fetchBills, addBill, deleteBill, payBill,
} from './creditCardsSlice'

const { Option } = Select

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_OPTS = MONTHS.map((m, i) => ({ label: m, value: i + 1 }))
const YEAR_OPTS  = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i)

const fmt = (v) => {
  if (!v && v !== 0) return '₹0'
  const n = Number(v)
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)}L`
  if (n >= 1_000)    return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toLocaleString('en-IN')}`
}

const statusIcon  = (s) => s === 'paid' ? checkmarkCircleOutline : s === 'partial' ? alertCircleOutline : timeOutline
const statusColor = (s) => s === 'paid' ? '#10B981' : s === 'partial' ? '#F59E0B' : '#EF4444'
const statusLabel = (s) => s === 'paid' ? 'Paid' : s === 'partial' ? 'Partial' : 'Pending'

/* ══════════════════════════════════════════════════════════════════
   Card Form
═══════════════════════════════════════════════════════════════════ */
function CardForm({ open, onClose, editing, onSave, loading }) {
  const [form] = Form.useForm()
  useEffect(() => {
    if (open) editing ? form.setFieldsValue(editing) : form.resetFields()
  }, [open, editing, form])

  return (
    <MobileFormPage open={open} title={editing ? 'Edit Card' : 'Add Credit Card'} onClose={onClose}>
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item name="bank_name" label="Bank / Issuer" rules={[{ required: true }]}>
          <Input placeholder="e.g. HDFC, ICICI, SBI" size="large" />
        </Form.Item>
        <Form.Item name="card_name" label="Card Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Regalia, Amazon Pay, Simply Click" size="large" />
        </Form.Item>
        <Form.Item name="last_four" label="Last 4 Digits">
          <Input placeholder="e.g. 4567" maxLength={4} size="large" />
        </Form.Item>
        <Form.Item name="credit_limit" label="Credit Limit (₹)">
          <InputNumber min={0} style={{ width: '100%' }} size="large"
            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
        <Form.Item name="billing_cycle_day" label="Billing Cycle Day (Statement Date)">
          <InputNumber min={1} max={31} style={{ width: '100%' }} size="large" placeholder="e.g. 20" />
        </Form.Item>
        <Form.Item name="due_date_day" label="Payment Due Day">
          <InputNumber min={1} max={31} style={{ width: '100%' }} size="large" placeholder="e.g. 5" />
        </Form.Item>
        <Form.Item name="interest_rate" label="Interest Rate (% p.a.)">
          <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} size="large" placeholder="e.g. 42" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, paddingBottom: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            {editing ? 'Update Card' : 'Add Card'}
          </Button>
        </Form.Item>
      </Form>
    </MobileFormPage>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Add Bill Form
═══════════════════════════════════════════════════════════════════ */
function AddBillForm({ open, onClose, card, onSave, loading }) {
  const [form] = Form.useForm()
  useEffect(() => {
    if (open) {
      const now = new Date()
      form.resetFields()
      form.setFieldsValue({ billing_month: now.getMonth() + 1, billing_year: now.getFullYear() })
    }
  }, [open, form])

  const handleFinish = (vals) => {
    onSave({ ...vals, card_id: card.id, due_date: vals.due_date ? vals.due_date.format('YYYY-MM-DD') : null })
  }

  return (
    <MobileFormPage open={open} title={`Add Bill – ${card?.bank_name || ''}`} onClose={onClose}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item name="billing_month" label="Month" style={{ flex: 1 }} rules={[{ required: true }]}>
            <Select size="large" getPopupContainer={() => document.body}>
              {MONTH_OPTS.map(m => <Option key={m.value} value={m.value}>{m.label}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="billing_year" label="Year" style={{ flex: 1 }} rules={[{ required: true }]}>
            <Select size="large" getPopupContainer={() => document.body}>
              {YEAR_OPTS.map(y => <Option key={y} value={y}>{y}</Option>)}
            </Select>
          </Form.Item>
        </div>
        <Form.Item name="bill_amount" label="Bill Amount (₹)" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} size="large"
            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
        <Form.Item name="minimum_due" label="Minimum Amount Due (₹)">
          <InputNumber min={0} style={{ width: '100%' }} size="large"
            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
        <Form.Item name="due_date" label="Payment Due Date">
          <DatePicker style={{ width: '100%' }} size="large" format="DD-MM-YYYY" getPopupContainer={() => document.body} />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} placeholder="Optional" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, paddingBottom: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">Add Bill</Button>
        </Form.Item>
      </Form>
    </MobileFormPage>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Pay Bill Form
═══════════════════════════════════════════════════════════════════ */
function PayBillForm({ open, onClose, bill, card, onSave, loading }) {
  const [form] = Form.useForm()
  useEffect(() => {
    if (open && bill) {
      form.setFieldsValue({ paid_amount: bill.bill_amount, paid_date: dayjs() })
    }
  }, [open, bill, form])

  const handleFinish = (vals) => {
    onSave({ id: bill.id, paid_amount: vals.paid_amount, paid_date: vals.paid_date?.format('YYYY-MM-DD'), notes: vals.notes })
  }

  const label = bill ? `${MONTHS[bill.billing_month - 1]} ${bill.billing_year}` : ''

  return (
    <MobileFormPage open={open} title={`Pay Bill – ${label}`} onClose={onClose}>
      <div className="cc-pay-banner">
        <div className="cc-pay-card-name">{card?.bank_name} {card?.card_name}</div>
        <div className="cc-pay-bill-amt">Bill: {fmt(bill?.bill_amount)}</div>
        {bill?.minimum_due > 0 && <div className="cc-pay-min-due">Minimum Due: {fmt(bill?.minimum_due)}</div>}
      </div>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="paid_amount" label="Amount Paying (₹)" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} size="large"
            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
        <Form.Item name="paid_date" label="Payment Date">
          <DatePicker style={{ width: '100%' }} size="large" format="DD-MM-YYYY" getPopupContainer={() => document.body} />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} placeholder="e.g. Paid via net banking" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, paddingBottom: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ background: '#10B981' }}>
            Mark as Paid — Deduct from Salary
          </Button>
        </Form.Item>
      </Form>
    </MobileFormPage>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Single Card Row with Bills
═══════════════════════════════════════════════════════════════════ */
function CardRow({ card }) {
  const dispatch = useDispatch()
  const { bills, loading } = useSelector(s => s.cc)
  const [expanded, setExpanded]   = useState(false)
  const [addBillOpen, setAddBill] = useState(false)
  const [payOpen, setPayOpen]     = useState(false)
  const [payingBill, setPayingBill] = useState(null)
  const [editOpen, setEditOpen]   = useState(false)

  const cardBills = bills.filter(b => b.card_id === card.id)
  const pending   = cardBills.filter(b => b.status !== 'paid')
  const totalPending = pending.reduce((s, b) => s + Number(b.bill_amount - (b.paid_amount || 0)), 0)

  const handleExpand = () => {
    if (!expanded) dispatch(fetchBills(card.id))
    setExpanded(e => !e)
  }

  const handlePay = (bill) => {
    setPayingBill(bill)
    setPayOpen(true)
  }

  const handlePaySave = async (data) => {
    await dispatch(payBill(data))
    setPayOpen(false); setPayingBill(null)
  }

  const handleEditSave = async (vals) => {
    await dispatch(updateCard({ id: card.id, ...vals }))
    setEditOpen(false)
  }

  const handleAddBillSave = async (vals) => {
    await dispatch(addBill(vals))
    setAddBill(false)
  }

  const usedPct = card.credit_limit ? Math.min((totalPending / card.credit_limit) * 100, 100) : 0

  return (
    <div className="cc-card">
      {/* Card header */}
      <div className="cc-card-header" onClick={handleExpand}>
        <div className="cc-card-icon-wrap">
          <IonIcon icon={cardOutline} />
        </div>
        <div className="cc-card-info">
          <div className="cc-card-name">{card.bank_name} · {card.card_name}</div>
          {card.last_four && <div className="cc-card-num">•••• {card.last_four}</div>}
          {card.credit_limit > 0 && (
            <div className="cc-util-bar-wrap">
              <div className="cc-util-bar" style={{
                width: `${usedPct}%`,
                background: usedPct > 80 ? '#EF4444' : usedPct > 50 ? '#F59E0B' : '#6366F1',
              }} />
            </div>
          )}
        </div>
        <div className="cc-card-right">
          <div className="cc-card-due">{fmt(totalPending)}</div>
          <div className="cc-card-due-label">{pending.length > 0 ? `${pending.length} pending` : 'All paid'}</div>
          <IonIcon icon={expanded ? chevronUpOutline : chevronDownOutline} style={{ color: '#94a3b8', fontSize: 16, marginTop: 4 }} />
        </div>
      </div>

      {/* Expanded bills section */}
      {expanded && (
        <div className="cc-bills-section">
          <div className="cc-bills-actions">
            <button className="cc-add-bill-btn" onClick={() => setAddBill(true)}>
              <IonIcon icon={addOutline} /> Add Bill
            </button>
            <button className="cc-edit-btn" onClick={() => setEditOpen(true)}>
              <IonIcon icon={pencilOutline} />
            </button>
            <ConfirmDelete title="Delete this card and all bills?" onConfirm={() => dispatch(deleteCard(card.id))}>
              <button className="cc-edit-btn danger"><IonIcon icon={trashOutline} /></button>
            </ConfirmDelete>
          </div>

          {cardBills.length === 0 && <div className="cc-no-bills">No bills yet — tap "Add Bill" to add this month's bill</div>}

          {cardBills.map(bill => (
            <div key={bill.id} className="cc-bill-row">
              <div className="cc-bill-left">
                <IonIcon icon={statusIcon(bill.status)} style={{ color: statusColor(bill.status), fontSize: 20, flexShrink: 0 }} />
                <div>
                  <div className="cc-bill-month">{MONTHS[bill.billing_month - 1]} {bill.billing_year}</div>
                  {bill.due_date && <div className="cc-bill-due">Due: {dayjs(bill.due_date).format('DD MMM')}</div>}
                </div>
              </div>
              <div className="cc-bill-right">
                <div className="cc-bill-amount">{fmt(bill.bill_amount)}</div>
                <div className="cc-bill-status" style={{ color: statusColor(bill.status) }}>{statusLabel(bill.status)}</div>
                {bill.minimum_due > 0 && bill.status !== 'paid' && (
                  <div className="cc-bill-min">Min: {fmt(bill.minimum_due)}</div>
                )}
              </div>
              <div className="cc-bill-btns">
                {bill.status !== 'paid' && (
                  <button className="cc-pay-btn" onClick={() => handlePay(bill)}>Pay</button>
                )}
                <ConfirmDelete title="Delete this bill?" onConfirm={() => dispatch(deleteBill(bill.id))}>
                  <button className="cc-del-bill-btn"><IonIcon icon={trashOutline} /></button>
                </ConfirmDelete>
              </div>
            </div>
          ))}
        </div>
      )}

      <CardForm open={editOpen} onClose={() => setEditOpen(false)} editing={card} onSave={handleEditSave} loading={loading} />
      <AddBillForm open={addBillOpen} onClose={() => setAddBill(false)} card={card} onSave={handleAddBillSave} loading={loading} />
      <PayBillForm open={payOpen} onClose={() => { setPayOpen(false); setPayingBill(null) }} bill={payingBill} card={card} onSave={handlePaySave} loading={loading} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Main CreditCards Page
═══════════════════════════════════════════════════════════════════ */
export default function CreditCards() {
  const dispatch = useDispatch()
  const { cards, bills, loading } = useSelector(s => s.cc)
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchCards())
    dispatch(fetchBills(null))
  }, [dispatch])

  const allBills     = bills
  const totalPending = allBills.filter(b => b.status !== 'paid').reduce((s, b) => s + Number(b.bill_amount - (b.paid_amount || 0)), 0)
  const totalLimit   = cards.reduce((s, c) => s + Number(c.credit_limit || 0), 0)
  const pendingCount = allBills.filter(b => b.status !== 'paid').length

  const handleAddCard = async (vals) => {
    await dispatch(createCard(vals))
    setAddOpen(false)
  }

  return (
    <div className="cc-page">
      {/* Hero summary */}
      <div className="cc-hero-card">
        <div className="cc-hero-label">Total Outstanding Bills</div>
        <div className="cc-hero-amount"><small>₹</small>{Number(totalPending).toLocaleString('en-IN')}</div>
        <div className="cc-hero-note">⚡ Payments deduct from your salary automatically</div>
        <div className="cc-hero-row">
          <div className="cc-hero-stat">
            <div className="cc-hero-stat-label">Cards</div>
            <div className="cc-hero-stat-value">{cards.length}</div>
          </div>
          <div className="cc-hero-stat">
            <div className="cc-hero-stat-label">Pending Bills</div>
            <div className="cc-hero-stat-value">{pendingCount}</div>
          </div>
          <div className="cc-hero-stat">
            <div className="cc-hero-stat-label">Total Limit</div>
            <div className="cc-hero-stat-value">{fmt(totalLimit)}</div>
          </div>
        </div>
      </div>

      <button className="cc-add-card-btn" onClick={() => setAddOpen(true)}>
        <IonIcon icon={addOutline} /> Add Credit Card
      </button>

      {cards.length === 0 && !loading && (
        <div className="cc-empty">No credit cards added yet.<br />Tap "Add Credit Card" to get started.</div>
      )}

      {cards.map(card => <CardRow key={card.id} card={card} />)}

      <CardForm open={addOpen} onClose={() => setAddOpen(false)} onSave={handleAddCard} loading={loading} />
    </div>
  )
}

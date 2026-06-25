import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IonIcon } from '@ionic/react'
import {
  homeOutline, carOutline, schoolOutline, cashOutline,
  trendingUpOutline, addOutline, pencilOutline, trashOutline,
} from 'ionicons/icons'
import { Form, Input, Select, DatePicker, InputNumber, Button } from 'antd'
import dayjs from 'dayjs'
import MobileFormPage from '../../components/common/MobileFormPage'
import ConfirmDelete from '../../components/common/ConfirmDelete'
import {
  fetchLoans, createLoan, updateLoan, deleteLoan,
  fetchInvestments, createInvestment, updateInvestment, deleteInvestment,
} from './assetsSlice'

const { Option } = Select

const LOAN_TYPES = ['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Gold Loan', 'Business Loan', 'Other']

const LOAN_ICONS = {
  'Home Loan': homeOutline, 'Car Loan': carOutline, 'Education Loan': schoolOutline,
}
const loanIcon = (type) => LOAN_ICONS[type] || cashOutline

const fmt = (v) => {
  if (!v && v !== 0) return '₹0'
  const n = Number(v)
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)}L`
  if (n >= 1_000)    return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toLocaleString('en-IN')}`
}

const pct = (gain, invested) => {
  if (!invested) return '0%'
  return `${((gain / invested) * 100).toFixed(1)}%`
}

/* ── Tabs ──────────────────────────────────────────────────────────── */
const TABS = [
  { key: 'loans',        label: 'Loans',        icon: homeOutline },
  { key: 'shares',       label: 'Shares',       icon: trendingUpOutline },
  { key: 'mutualfunds',  label: 'Mutual Funds', icon: trendingUpOutline },
]

/* ══════════════════════════════════════════════════════════════════
   Loan Form
═══════════════════════════════════════════════════════════════════ */
function LoanForm({ open, onClose, editing, onSave, loading }) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({ ...editing, start_date: editing.start_date ? dayjs(editing.start_date) : null })
      } else {
        form.resetFields()
      }
    }
  }, [open, editing, form])

  const handleFinish = (vals) => {
    const payload = { ...vals, start_date: vals.start_date ? vals.start_date.format('YYYY-MM-DD') : null }
    onSave(payload)
  }

  return (
    <MobileFormPage open={open} title={editing ? 'Edit Loan' : 'Add Loan'} onClose={onClose}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="loan_type" label="Loan Type" rules={[{ required: true }]}>
          <Select placeholder="Select type" getPopupContainer={() => document.body} style={{ zIndex: 10100 }}>
            {LOAN_TYPES.map(t => <Option key={t} value={t}>{t}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="lender" label="Lender / Bank" rules={[{ required: true }]}>
          <Input placeholder="e.g. SBI, HDFC" />
        </Form.Item>
        <Form.Item name="principal_amount" label="Principal Amount (₹)" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Total loan amount" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
        <Form.Item name="outstanding_amount" label="Outstanding Amount (₹)" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Remaining balance" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
        <Form.Item name="interest_rate" label="Interest Rate (% p.a.)">
          <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} placeholder="e.g. 8.5" />
        </Form.Item>
        <Form.Item name="emi_amount" label="Monthly EMI (₹)">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Monthly EMI" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
        <Form.Item name="start_date" label="Start Date">
          <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" getPopupContainer={() => document.body} />
        </Form.Item>
        <Form.Item name="tenure_months" label="Tenure (months)">
          <InputNumber min={1} max={600} style={{ width: '100%' }} placeholder="e.g. 240 for 20 years" />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} placeholder="Optional notes" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, paddingBottom: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            {editing ? 'Update Loan' : 'Add Loan'}
          </Button>
        </Form.Item>
      </Form>
    </MobileFormPage>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Investment Form
═══════════════════════════════════════════════════════════════════ */
function InvestmentForm({ open, onClose, editing, onSave, loading, investmentType }) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({ ...editing, buy_date: editing.buy_date ? dayjs(editing.buy_date) : null })
      } else {
        form.resetFields()
        form.setFieldValue('investment_type', investmentType === 'shares' ? 'shares' : 'mutual_fund')
      }
    }
  }, [open, editing, form, investmentType])

  const handleFinish = (vals) => {
    const payload = { ...vals, buy_date: vals.buy_date ? vals.buy_date.format('YYYY-MM-DD') : null }
    onSave(payload)
  }

  const isShares = investmentType === 'shares'

  return (
    <MobileFormPage
      open={open}
      title={editing ? `Edit ${isShares ? 'Share' : 'Mutual Fund'}` : `Add ${isShares ? 'Share' : 'Mutual Fund'}`}
      onClose={onClose}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="investment_type" hidden><Input /></Form.Item>
        <Form.Item name="name" label={isShares ? 'Company Name' : 'Fund Name'} rules={[{ required: true }]}>
          <Input placeholder={isShares ? 'e.g. Reliance Industries' : 'e.g. SBI Blue Chip Fund'} />
        </Form.Item>
        {isShares ? (
          <Form.Item name="ticker" label="Ticker Symbol">
            <Input placeholder="e.g. RELIANCE" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
        ) : (
          <Form.Item name="fund_house" label="Fund House">
            <Input placeholder="e.g. SBI MF, HDFC MF" />
          </Form.Item>
        )}
        {isShares && (
          <Form.Item name="quantity" label="Number of Shares" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Qty" />
          </Form.Item>
        )}
        <Form.Item name="total_invested" label="Total Amount Invested (₹)" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Total invested" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
        {isShares && (
          <Form.Item name="buy_price" label="Buy Price per Share (₹)">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Avg buy price" />
          </Form.Item>
        )}
        <Form.Item name="current_price" label={isShares ? 'Current Market Price (₹)' : 'Current NAV / Value (₹)'}>
          <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Current value" />
        </Form.Item>
        <Form.Item name="buy_date" label="Date of Purchase">
          <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" getPopupContainer={() => document.body} />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} placeholder="Optional notes" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, paddingBottom: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            {editing ? `Update ${isShares ? 'Share' : 'Mutual Fund'}` : `Add ${isShares ? 'Share' : 'Mutual Fund'}`}
          </Button>
        </Form.Item>
      </Form>
    </MobileFormPage>
  )
}


/* ══════════════════════════════════════════════════════════════════
   Loans Tab
═══════════════════════════════════════════════════════════════════ */
function LoansTab() {
  const dispatch = useDispatch()
  const { loans, loading } = useSelector(s => s.assets)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null)

  useEffect(() => { dispatch(fetchLoans()) }, [dispatch])

  const totalOutstanding = loans.reduce((s, l) => s + Number(l.outstanding_amount || 0), 0)
  const totalEMI         = loans.reduce((s, l) => s + Number(l.emi_amount || 0), 0)

  const handleSave = async (vals) => {
    if (editing) await dispatch(updateLoan({ id: editing.id, ...vals }))
    else          await dispatch(createLoan(vals))
    setFormOpen(false); setEditing(null)
  }

  return (
    <div>
      <div className="ast-hero-card red">
        <div className="ast-hero-label">Total Outstanding</div>
        <div className="ast-hero-amount"><small>₹</small>{Number(totalOutstanding).toLocaleString('en-IN')}</div>
        <div className="ast-hero-row">
          <div className="ast-hero-stat"><div className="ast-hero-stat-label">Loans</div><div className="ast-hero-stat-value">{loans.length}</div></div>
          <div className="ast-hero-stat"><div className="ast-hero-stat-label">Monthly EMI</div><div className="ast-hero-stat-value">{fmt(totalEMI)}</div></div>
        </div>
      </div>

      <button className="ast-add-btn" onClick={() => { setEditing(null); setFormOpen(true) }}>
        <IonIcon icon={addOutline} /> Add Loan
      </button>

      {loans.length === 0 && !loading && (
        <div className="ast-empty">No loans added yet</div>
      )}

      {loans.map(loan => (
        <div key={loan.id} className="ast-card">
          <div className="ast-card-left">
            <div className="ast-card-icon red"><IonIcon icon={loanIcon(loan.loan_type)} /></div>
            <div>
              <div className="ast-card-title">{loan.loan_type}</div>
              <div className="ast-card-sub">{loan.lender}</div>
            </div>
          </div>
          <div className="ast-card-right">
            <div className="ast-card-amount red">{fmt(loan.outstanding_amount)}</div>
            {loan.emi_amount > 0 && <div className="ast-card-sub">EMI {fmt(loan.emi_amount)}/mo</div>}
            {loan.interest_rate > 0 && <div className="ast-card-sub">{loan.interest_rate}% p.a.</div>}
          </div>
          <div className="ast-card-actions">
            <button className="ast-act-btn" onClick={() => { setEditing(loan); setFormOpen(true) }}>
              <IonIcon icon={pencilOutline} />
            </button>
            <ConfirmDelete title="Delete this loan?" onConfirm={() => dispatch(deleteLoan(loan.id))}>
              <button className="ast-act-btn danger"><IonIcon icon={trashOutline} /></button>
            </ConfirmDelete>
          </div>
        </div>
      ))}

      <LoanForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        editing={editing}
        onSave={handleSave}
        loading={loading}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Investments Tab (Shares or Mutual Funds)
═══════════════════════════════════════════════════════════════════ */
function InvestmentsTab({ type }) {
  const dispatch = useDispatch()
  const { investments, loading } = useSelector(s => s.assets)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null)

  const apiType = type === 'shares' ? 'shares' : 'mutual_fund'
  const filtered = investments.filter(i => i.investment_type === apiType)

  useEffect(() => { dispatch(fetchInvestments()) }, [dispatch])

  const totalInvested = filtered.reduce((s, i) => s + Number(i.total_invested || 0), 0)
  const totalCurrent  = filtered.reduce((s, i) => {
    if (i.current_price && i.quantity) return s + (Number(i.current_price) * Number(i.quantity))
    if (i.current_price) return s + Number(i.current_price)
    return s + Number(i.total_invested || 0)
  }, 0)
  const gain = totalCurrent - totalInvested

  const currentVal = (inv) => {
    if (inv.current_price && inv.quantity) return Number(inv.current_price) * Number(inv.quantity)
    if (inv.current_price) return Number(inv.current_price)
    return Number(inv.total_invested || 0)
  }

  const handleSave = async (vals) => {
    const payload = { ...vals, investment_type: apiType }
    if (editing) await dispatch(updateInvestment({ id: editing.id, ...payload }))
    else          await dispatch(createInvestment(payload))
    setFormOpen(false); setEditing(null)
  }

  return (
    <div>
      <div className="ast-hero-card green">
        <div className="ast-hero-label">Total Invested</div>
        <div className="ast-hero-amount"><small>₹</small>{Number(totalInvested).toLocaleString('en-IN')}</div>
        <div className="ast-hero-row">
          <div className="ast-hero-stat">
            <div className="ast-hero-stat-label">Current Value</div>
            <div className="ast-hero-stat-value">{fmt(totalCurrent)}</div>
          </div>
          <div className="ast-hero-stat">
            <div className="ast-hero-stat-label">Gain/Loss</div>
            <div className={`ast-hero-stat-value ${gain >= 0 ? 'pos' : 'neg'}`}>
              {gain >= 0 ? '+' : ''}{fmt(gain)}
            </div>
          </div>
          <div className="ast-hero-stat">
            <div className="ast-hero-stat-label">Return</div>
            <div className={`ast-hero-stat-value ${gain >= 0 ? 'pos' : 'neg'}`}>{pct(gain, totalInvested)}</div>
          </div>
        </div>
      </div>

      <button className="ast-add-btn" onClick={() => { setEditing(null); setFormOpen(true) }}>
        <IonIcon icon={addOutline} /> Add {type === 'shares' ? 'Share' : 'Mutual Fund'}
      </button>

      {filtered.length === 0 && !loading && (
        <div className="ast-empty">No {type === 'shares' ? 'shares' : 'mutual funds'} added yet</div>
      )}

      {filtered.map(inv => {
        const cur  = currentVal(inv)
        const g    = cur - Number(inv.total_invested || 0)
        const isUp = g >= 0
        return (
          <div key={inv.id} className="ast-card">
            <div className="ast-card-left">
              <div className="ast-card-icon green"><IonIcon icon={trendingUpOutline} /></div>
              <div>
                <div className="ast-card-title">{inv.name}</div>
                <div className="ast-card-sub">{inv.ticker || inv.fund_house || ''}</div>
              </div>
            </div>
            <div className="ast-card-right">
              <div className="ast-card-amount green">{fmt(cur)}</div>
              <div className={`ast-card-sub ${isUp ? 'pos' : 'neg'}`}>{isUp ? '+' : ''}{fmt(g)} ({pct(g, inv.total_invested)})</div>
              <div className="ast-card-sub">Invested {fmt(inv.total_invested)}</div>
            </div>
            <div className="ast-card-actions">
              <button className="ast-act-btn" onClick={() => { setEditing(inv); setFormOpen(true) }}>
                <IonIcon icon={pencilOutline} />
              </button>
              <ConfirmDelete title="Delete this investment?" onConfirm={() => dispatch(deleteInvestment(inv.id))}>
                <button className="ast-act-btn danger"><IonIcon icon={trashOutline} /></button>
              </ConfirmDelete>
            </div>
          </div>
        )
      })}

      <InvestmentForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        editing={editing}
        onSave={handleSave}
        loading={loading}
        investmentType={type}
      />
    </div>
  )
}


/* ══════════════════════════════════════════════════════════════════
   Main Assets Page
═══════════════════════════════════════════════════════════════════ */
export default function Assets() {
  const [activeTab, setActiveTab] = useState('loans')

  return (
    <div className="ast-page">
      <div className="ast-page-header">
        <div className="ast-page-title">Portfolio</div>
        <div className="ast-page-sub">Loans · Shares · Mutual Funds</div>
      </div>

      <div className="ast-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`ast-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <IonIcon icon={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="ast-tab-content">
        {activeTab === 'loans'       && <LoansTab />}
        {activeTab === 'shares'      && <InvestmentsTab type="shares" />}
        {activeTab === 'mutualfunds' && <InvestmentsTab type="mutual_fund" />}
      </div>
    </div>
  )
}

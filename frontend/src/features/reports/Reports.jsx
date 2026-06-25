import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message } from 'antd'
import { IonIcon } from '@ionic/react'
import {
  documentTextOutline, cashOutline, cartOutline, leafOutline, downloadOutline,
} from 'ionicons/icons'
import { fetchIncome } from '../income/incomeSlice'
import { fetchExpenses } from '../expenses/expenseSlice'
import { fetchCrops } from '../crops/cropSlice'
import { useAuth } from '../../hooks/useAuth'
import dayjs from 'dayjs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/* ── PDF colour palette ─────────────────────────────────────────── */
const C_GREEN  = [16, 185, 129]
const C_RED    = [239, 68, 68]
const C_INDIGO = [99, 102, 241]
const C_GRAY   = [107, 114, 128]
const C_DARK   = [17, 24, 39]

const n2 = (v) =>
  Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* ── PDF helpers ────────────────────────────────────────────────── */
function drawHeader(doc, user) {
  const W = doc.internal.pageSize.width
  doc.setFillColor(...C_GREEN)
  doc.rect(0, 0, W, 34, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('FinanceTracker Report', 14, 13)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(user?.full_name || 'User', 14, 21)
  doc.text(`Generated: ${dayjs().format('DD MMM YYYY, hh:mm A')}`, 14, 28)
  doc.setTextColor(...C_DARK)
  return 40
}

function drawSectionBadge(doc, title, color, y) {
  const W = doc.internal.pageSize.width
  doc.setFillColor(...color)
  doc.roundedRect(14, y, W - 28, 7.5, 1.5, 1.5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 17, y + 5.2)
  doc.setTextColor(...C_DARK)
  return y + 11
}

function drawSummaryBox(doc, { income, expenses, crops }, y) {
  const W = doc.internal.pageSize.width
  const totalIncome   = income.reduce((s, i) => s + i.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalCrop     = crops.reduce((s, c) => s + c.total_expenses, 0)
  const netSavings    = totalIncome - totalExpenses - totalCrop

  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, y, W - 28, 28, 2, 2, 'F')
  doc.setDrawColor(...C_GREEN)
  doc.setLineWidth(0.4)
  doc.roundedRect(14, y, W - 28, 28, 2, 2, 'S')

  const cols = [
    { label: 'Total Income',   value: `Rs.${n2(totalIncome)}`,   color: C_GREEN },
    { label: 'Total Expenses', value: `Rs.${n2(totalExpenses)}`, color: C_RED },
    { label: 'Crop Invested',  value: `Rs.${n2(totalCrop)}`,     color: C_INDIGO },
    { label: 'Net Savings',    value: `Rs.${n2(netSavings)}`,    color: netSavings >= 0 ? C_GREEN : C_RED },
  ]
  const colW = (W - 28) / 4
  cols.forEach((col, i) => {
    const cx = 14 + i * colW + colW / 2
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C_GRAY)
    doc.text(col.label, cx, y + 10, { align: 'center' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...col.color)
    doc.text(col.value, cx, y + 20, { align: 'center' })
  })
  doc.setTextColor(...C_DARK)
  doc.setLineWidth(0.2)
  return y + 32
}

function drawFooters(doc) {
  const pages = doc.internal.getNumberOfPages()
  const W = doc.internal.pageSize.width
  const H = doc.internal.pageSize.height
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C_GRAY)
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.line(14, H - 12, W - 14, H - 12)
    doc.text('FinanceTracker', 14, H - 7)
    doc.text(`Page ${i} of ${pages}`, W / 2, H - 7, { align: 'center' })
    doc.text(dayjs().format('DD/MM/YYYY'), W - 14, H - 7, { align: 'right' })
  }
}

/* ── Main PDF generator ─────────────────────────────────────────── */
function generatePDF({ type, incomeItems, expenseItems, cropItems, user }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let y = drawHeader(doc, user)

  // ── INCOME ──────────────────────────────────────────────────────
  if (type === 'full' || type === 'income') {
    if (type === 'full') {
      y = drawSummaryBox(doc, { income: incomeItems, expenses: expenseItems, crops: cropItems }, y)
    }
    y = drawSectionBadge(doc, 'INCOME', C_GREEN, y)

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Date', 'Source', 'Amount (Rs.)', 'Notes']],
      body: incomeItems.length
        ? incomeItems.map(i => [i.date, i.source, n2(i.amount), i.notes || '—'])
        : [['—', 'No income records', '—', '—']],
      foot: incomeItems.length
        ? [['', 'TOTAL', n2(incomeItems.reduce((s, i) => s + i.amount, 0)), '']]
        : [],
      headStyles: { fillColor: C_GREEN, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      footStyles: { fillColor: [240, 253, 244], textColor: C_GREEN, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 255, 252] },
      styles: { fontSize: 8, cellPadding: 2.8, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 22 }, 2: { halign: 'right', cellWidth: 30 } },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ── EXPENSES ─────────────────────────────────────────────────────
  if (type === 'full' || type === 'expenses') {
    if (type === 'full') { doc.addPage(); y = drawHeader(doc, user) }
    y = drawSectionBadge(doc, 'EXPENSES', C_RED, y)

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Date', 'Category', 'Subcategory', 'Amount (Rs.)', 'Notes']],
      body: expenseItems.length
        ? expenseItems.map(e => [e.date, e.category, e.subcategory || '—', n2(e.amount), e.notes || '—'])
        : [['—', 'No expense records', '—', '—', '—']],
      foot: expenseItems.length
        ? [['', '', 'TOTAL', n2(expenseItems.reduce((s, e) => s + e.amount, 0)), '']]
        : [],
      headStyles: { fillColor: C_RED, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      footStyles: { fillColor: [255, 242, 242], textColor: C_RED, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: [255, 250, 250] },
      styles: { fontSize: 8, cellPadding: 2.8, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 22 }, 3: { halign: 'right', cellWidth: 30 } },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ── CROPS ────────────────────────────────────────────────────────
  if (type === 'full' || type === 'crops') {
    if (type === 'full') { doc.addPage(); y = drawHeader(doc, user) }
    y = drawSectionBadge(doc, 'CROPS & HARVEST', C_INDIGO, y)

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Crop', 'Type', 'Area', 'Sown', 'Status', 'Invested', 'Sale Amt', 'P & L']],
      body: cropItems.length
        ? cropItems.map(c => [
            c.name,
            c.crop_type,
            c.area_acres ? `${c.area_acres} ac` : '—',
            c.start_date,
            c.status.charAt(0).toUpperCase() + c.status.slice(1),
            n2(c.total_expenses),
            n2(c.sale_amount),
            (c.net_profit >= 0 ? '+' : '') + n2(c.net_profit),
          ])
        : [['—', '—', '—', '—', 'No crop records', '—', '—', '—']],
      headStyles: { fillColor: C_INDIGO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 255] },
      styles: { fontSize: 7.5, cellPadding: 2.5, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 28 },
        5: { halign: 'right', cellWidth: 24 },
        6: { halign: 'right', cellWidth: 24 },
        7: { halign: 'right', cellWidth: 22 },
      },
      willDrawCell: (data) => {
        if (data.column.index === 7 && data.section === 'body' && cropItems.length) {
          const crop = cropItems[data.row.index]
          if (crop) data.cell.styles.textColor = crop.net_profit >= 0 ? C_GREEN : C_RED
        }
      },
    })
  }

  drawFooters(doc)

  const names = { full: 'full_report', income: 'income', expenses: 'expenses', crops: 'crops' }
  doc.save(`finance_${names[type]}_${dayjs().format('YYYY-MM-DD')}.pdf`)
}

/* ── Short formatter for UI display ────────────────────────────── */
const fmtShort = (v) => {
  const n = Number(v || 0)
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n.toFixed(0)}`
}

/* ── Component ──────────────────────────────────────────────────── */
export default function Reports() {
  const dispatch = useDispatch()
  const { user }       = useAuth()
  const incomeItems    = useSelector(s => s.income.items)
  const expenseItems   = useSelector(s => s.expense.items)
  const cropItems      = useSelector(s => s.crops.items)
  const dataLoading    = useSelector(s => s.income.loading || s.expense.loading || s.crops.loading)
  const [generating, setGenerating] = useState(null)

  useEffect(() => {
    dispatch(fetchIncome({ page: 1, page_size: 1000 }))
    dispatch(fetchExpenses({ page: 1, page_size: 1000 }))
    dispatch(fetchCrops())
  }, [dispatch])

  const handleDownload = (type) => {
    if (generating) return
    setGenerating(type)
    setTimeout(() => {
      try {
        generatePDF({ type, incomeItems, expenseItems, cropItems, user })
        message.success('PDF downloaded successfully!')
      } catch {
        message.error('Failed to generate PDF. Please try again.')
      } finally {
        setGenerating(null)
      }
    }, 80)
  }

  const totalIncome   = incomeItems.reduce((s, i) => s + i.amount, 0)
  const totalExpenses = expenseItems.reduce((s, e) => s + e.amount, 0)
  const totalCrop     = cropItems.reduce((s, c) => s + c.total_expenses, 0)
  const netSavings    = totalIncome - totalExpenses - totalCrop

  const REPORT_CARDS = [
    {
      type: 'income',
      icon: cashOutline,
      label: 'Income Report',
      sub: `${incomeItems.length} entries · ${fmtShort(totalIncome)}`,
      color: '#10B981',
      bg: '#D1FAE5',
    },
    {
      type: 'expenses',
      icon: cartOutline,
      label: 'Expenses Report',
      sub: `${expenseItems.length} entries · ${fmtShort(totalExpenses)}`,
      color: '#EF4444',
      bg: '#FEE2E2',
    },
    {
      type: 'crops',
      icon: leafOutline,
      label: 'Crops Report',
      sub: `${cropItems.length} crops · ${fmtShort(totalCrop)} invested`,
      color: '#6366F1',
      bg: '#EEF2FF',
    },
  ]

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Page heading */}
      <div className="mob-page-heading">
        <div>
          <div className="mob-page-title">Reports</div>
          <div className="mob-page-sub">Download your financial data as PDF</div>
        </div>
      </div>

      {/* Full Report hero */}
      <div className="rpt-hero-card">
        <div className="rpt-hero-top">
          <div className="rpt-hero-icon-wrap">
            <IonIcon icon={documentTextOutline} />
          </div>
          <div>
            <div className="rpt-hero-title">Full Financial Report</div>
            <div className="rpt-hero-sub">Income · Expenses · Crops — all in one PDF</div>
          </div>
        </div>

        <div className="rpt-hero-stats">
          <div className="rpt-stat">
            <div className="rpt-stat-val">{incomeItems.length + expenseItems.length + cropItems.length}</div>
            <div className="rpt-stat-lbl">Records</div>
          </div>
          <div className="rpt-stat-sep" />
          <div className="rpt-stat">
            <div className="rpt-stat-val">{fmtShort(totalIncome)}</div>
            <div className="rpt-stat-lbl">Income</div>
          </div>
          <div className="rpt-stat-sep" />
          <div className="rpt-stat">
            <div className="rpt-stat-val" style={{ color: netSavings >= 0 ? '#6EE7B7' : '#FCA5A5' }}>
              {fmtShort(netSavings)}
            </div>
            <div className="rpt-stat-lbl">Net Savings</div>
          </div>
        </div>

        <button
          className="rpt-download-btn"
          onClick={() => handleDownload('full')}
          disabled={!!generating || dataLoading}
        >
          {generating === 'full' ? (
            <span className="rpt-spinner" />
          ) : (
            <IonIcon icon={downloadOutline} style={{ fontSize: 18 }} />
          )}
          {generating === 'full' ? 'Generating PDF…' : 'Download Full Report'}
        </button>
      </div>

      {/* Individual section cards */}
      <div className="rpt-section-head">Individual Reports</div>
      <div className="rpt-cards">
        {REPORT_CARDS.map(({ type, icon, label, sub, color, bg }) => (
          <div
            key={type}
            className="rpt-card"
            onClick={() => handleDownload(type)}
            style={{ opacity: generating && generating !== type ? 0.6 : 1 }}
          >
            <div className="rpt-card-icon" style={{ background: bg }}>
              <IonIcon icon={icon} style={{ color, fontSize: 22 }} />
            </div>
            <div className="rpt-card-info">
              <div className="rpt-card-label">{label}</div>
              <div className="rpt-card-sub">{sub}</div>
            </div>
            <div className="rpt-card-dl" style={{ color }}>
              {generating === type
                ? <span className="rpt-spinner" style={{ borderColor: `${color}30`, borderTopColor: color }} />
                : <IonIcon icon={downloadOutline} style={{ fontSize: 20 }} />
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

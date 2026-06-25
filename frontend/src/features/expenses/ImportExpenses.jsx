import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Select, message } from 'antd'
import { IonIcon } from '@ionic/react'
import {
  cloudUploadOutline, chatbubbleOutline, checkmarkCircleOutline,
  trashOutline, chevronBackOutline, documentOutline,
} from 'ionicons/icons'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import MobileFormPage from '../../components/common/MobileFormPage'
import { createExpense, fetchExpenses } from './expenseSlice'

dayjs.extend(customParseFormat)

/* ── Auto-categorisation keyword rules ─────────────────────────── */
const CATEGORY_RULES = [
  { category: 'Food & Dining',  words: ['swiggy','zomato','blinkit','dunzo','bigbasket','restaurant','food','cafe','dhaba','pizza','burger','kfc','mcdonalds','dominos','subway','haldiram','hotel','grocer','milk'] },
  { category: 'Transport',      words: ['ola','uber','rapido','irctc','railways','railway','metro','petrol','fuel','parking','fastag','toll','bus','auto ride','cab'] },
  { category: 'Housing',        words: ['rent','electricity','power','water bill','maintenance','housing','home loan','landlord','pg ','nri'] },
  { category: 'Healthcare',     words: ['apollo','medplus','netmeds','pharmeasy','1mg','hospital','clinic','doctor','pharmacy','medical','diagnostic','lab','nursing','health'] },
  { category: 'Shopping',       words: ['amazon','flipkart','myntra','nykaa','meesho','ajio','snapdeal','lifestyle','mall','cloth','fashion','decathlon','reliance digital'] },
  { category: 'Education',      words: ['school','college','university','udemy','coursera','byju','unacademy','tuition','education','books','stationery','fees'] },
  { category: 'Entertainment',  words: ['netflix','hotstar','spotify','zee5','sonyliv','prime video','pvr','inox','cinema','movie','theatre','gaming','steam','youtube premium'] },
  { category: 'Personal Care',  words: ['salon','gym','fitness','spa','cosmetic','beauty','grooming','parlour','barbershop'] },
  { category: 'Travel',         words: ['oyo','makemytrip','goibibo','cleartrip','yatra','airbnb','booking','resort','flight','airways','indigo','air india','spicejet'] },
  { category: 'Utilities',      words: ['jio','airtel','vi ','bsnl','vodafone','recharge','dth','tataplay','tata sky','gas','lpg','subscription','broadband','internet bill'] },
  { category: 'Family',         words: ['gift','celebration','wedding','birthday','family','child','parent','relative','donation','charity'] },
]

function autoCategory(desc = '') {
  const d = desc.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.words.some(w => d.includes(w))) return rule.category
  }
  return 'Others'
}

/* ── Date normaliser ────────────────────────────────────────────── */
const DATE_FORMATS = ['DD/MM/YYYY','DD-MM-YYYY','DD/MM/YY','DD-MM-YY','D/M/YYYY','YYYY-MM-DD',
  'DD MMM YYYY','DD-MMM-YYYY','DD MMM YY','D MMM YYYY']

function parseDate(raw = '') {
  raw = String(raw).trim()
  for (const fmt of DATE_FORMATS) {
    const d = dayjs(raw, fmt, true)
    if (d.isValid()) return d.format('YYYY-MM-DD')
  }
  // Try JS native
  const d = dayjs(raw)
  return d.isValid() ? d.format('YYYY-MM-DD') : null
}

/* ── Bank CSV column detector ───────────────────────────────────── */
function detectCols(headers) {
  const norm = headers.map(h => h.toLowerCase().trim())
  const find = (...keys) => {
    const idx = norm.findIndex(h => keys.some(k => h.includes(k)))
    return idx >= 0 ? headers[idx] : null
  }
  return {
    dateCol: find('txn date','transaction date','tran date','date','value date'),
    descCol: find('narration','description','particulars','particular','details','remarks','transaction remarks'),
    debitCol: find('debit','withdrawal','dr amount','dr amt','amount','paid','debit amount'),
  }
}

/* ── Parse bank CSV/Excel rows into transactions ────────────────── */
function parseRows(rows) {
  if (!rows || rows.length < 2) return []
  const headers = Object.keys(rows[0])
  const { dateCol, descCol, debitCol } = detectCols(headers)
  const results = []

  rows.forEach((row, idx) => {
    const rawDate  = dateCol  ? row[dateCol]  : Object.values(row)[0]
    const rawDesc  = descCol  ? row[descCol]  : Object.values(row)[1]
    const rawDebit = debitCol ? row[debitCol] : Object.values(row)[2]

    const date = parseDate(rawDate)
    if (!date) return

    const amtStr = String(rawDebit || '').replace(/[₹,\s]/g, '')
    const amount = parseFloat(amtStr)
    if (!amount || amount <= 0) return

    const desc = String(rawDesc || '').trim()
    if (!desc) return

    results.push({
      _id: idx,
      date,
      notes: desc,
      amount,
      category: autoCategory(desc),
      subcategory: null,
      selected: true,
    })
  })
  return results
}

/* ── PhonePe / Bank SMS parser ──────────────────────────────────── */
const SMS_PATTERNS = [
  // PhonePe: "Rs.500 debited from A/c..." or "Sent Rs 500 to XYZ"
  /(?:rs\.?|inr\.?)\s*([0-9,]+(?:\.[0-9]+)?)/i,
]
const MERCHANT_PATTERNS = [
  /(?:to|at|via)\s+([A-Za-z0-9 &'-]{2,30}?)(?:\.|,|\s+on\s|\s+ref|\s+upi|\s*$)/i,
]

function parseSMS(text = '') {
  const results = []
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)

  lines.forEach((line, idx) => {
    // Skip credit lines
    if (/credited|received|refund/i.test(line)) return

    let amount = null
    for (const p of SMS_PATTERNS) {
      const m = line.match(p)
      if (m) { amount = parseFloat(m[1].replace(/,/g, '')); break }
    }
    if (!amount || amount <= 0) return

    // Extract merchant/description
    let desc = ''
    for (const p of MERCHANT_PATTERNS) {
      const m = line.match(p)
      if (m) { desc = m[1].trim(); break }
    }
    if (!desc) desc = line.slice(0, 60)

    // Extract date
    let date = null
    const dateMatch = line.match(/(\d{2}[-\/]\d{2}[-\/]\d{2,4}|\d{2}[-\s]\w{3}[-\s]\d{2,4})/i)
    if (dateMatch) date = parseDate(dateMatch[1])
    if (!date) date = dayjs().format('YYYY-MM-DD')

    results.push({
      _id: idx,
      date,
      notes: desc,
      amount,
      category: autoCategory(desc + ' ' + line),
      subcategory: null,
      selected: true,
    })
  })
  return results
}

/* ── Categories list ────────────────────────────────────────────── */
const CATEGORIES = [
  'Food & Dining','Transport','Housing','Healthcare','Shopping',
  'Education','Entertainment','Personal Care','Travel','Utilities','Family','Others',
]

/* ══════════════════════════════════════════════════════════════════
   Main component
   ══════════════════════════════════════════════════════════════════ */
export default function ImportExpenses({ open, onClose, onImported }) {
  const dispatch = useDispatch()
  const fileRef = useRef()
  const [step, setStep] = useState('method')   // method | file | sms | review | done
  const [transactions, setTransactions] = useState([])
  const [smsText, setSmsText] = useState('')
  const [fileInfo, setFileInfo] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  const reset = () => {
    setStep('method')
    setTransactions([])
    setSmsText('')
    setFileInfo(null)
    setImporting(false)
  }

  const handleClose = () => { reset(); onClose() }

  /* ── File parsing ─────────────────────────────────────────────── */
  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileInfo(file.name)
    const ext = file.name.split('.').pop().toLowerCase()

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: ({ data }) => {
          const rows = parseRows(data)
          if (!rows.length) { message.error('No debit transactions found. Check your CSV format.'); return }
          setTransactions(rows)
          setStep('review')
        },
        error: () => message.error('Failed to read CSV file.'),
      })
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const wb = XLSX.read(ev.target.result, { type: 'binary', cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
        const rows = parseRows(data)
        if (!rows.length) { message.error('No debit transactions found. Check your Excel format.'); return }
        setTransactions(rows)
        setStep('review')
      }
      reader.readAsBinaryString(file)
    } else {
      message.error('Only CSV and Excel (.xlsx/.xls) files are supported.')
    }
  }

  /* ── SMS parsing ──────────────────────────────────────────────── */
  const handleParseSMS = () => {
    const rows = parseSMS(smsText)
    if (!rows.length) { message.error('Could not find any debit transactions. Make sure the SMS shows debited/sent amounts.'); return }
    setTransactions(rows)
    setStep('review')
  }

  /* ── Review table helpers ─────────────────────────────────────── */
  const toggleAll = (val) => setTransactions(t => t.map(r => ({ ...r, selected: val })))
  const toggleRow = (id) => setTransactions(t => t.map(r => r._id === id ? { ...r, selected: !r.selected } : r))
  const setCategory = (id, cat) => setTransactions(t => t.map(r => r._id === id ? { ...r, category: cat } : r))
  const removeRow = (id) => setTransactions(t => t.filter(r => r._id !== id))
  const selectedRows = transactions.filter(r => r.selected)

  /* ── Import ───────────────────────────────────────────────────── */
  const handleImport = async () => {
    if (!selectedRows.length) { message.warning('Select at least one transaction.'); return }
    setImporting(true)
    let count = 0
    for (const row of selectedRows) {
      try {
        await dispatch(createExpense({
          date: row.date,
          category: row.category,
          subcategory: row.subcategory || null,
          amount: row.amount,
          notes: row.notes,
        })).unwrap()
        count++
      } catch { /* skip failed rows */ }
    }
    setImportedCount(count)
    setImporting(false)
    setStep('done')
    dispatch(fetchExpenses({ page: 1, page_size: 100 }))
  }

  /* ── Render ───────────────────────────────────────────────────── */
  const title =
    step === 'method' ? 'Import Expenses' :
    step === 'file'   ? 'Upload Bank Statement' :
    step === 'sms'    ? 'Paste SMS / Message' :
    step === 'review' ? `Review (${transactions.length} found)` :
    'Import Complete'

  return (
    <MobileFormPage open={open} onClose={handleClose} title={title}>

      {/* ── STEP: METHOD ──────────────────────────────────────────── */}
      {step === 'method' && (
        <div>
          <div className="imp-desc">
            Choose how you want to import your PhonePe / bank transactions.
          </div>

          <div className="imp-method-card" onClick={() => setStep('file')}>
            <div className="imp-method-icon" style={{ background: '#EEF2FF' }}>
              <IonIcon icon={documentOutline} style={{ color: '#6366F1', fontSize: 26 }} />
            </div>
            <div className="imp-method-info">
              <div className="imp-method-title">Bank Statement (CSV / Excel)</div>
              <div className="imp-method-sub">
                Download from your bank app → upload here. Works for SBI, HDFC, ICICI, Axis, and all banks.
              </div>
            </div>
            <div className="imp-method-arrow">›</div>
          </div>

          <div className="imp-method-card" onClick={() => setStep('sms')}>
            <div className="imp-method-icon" style={{ background: '#FFF7ED' }}>
              <IonIcon icon={chatbubbleOutline} style={{ color: '#F97316', fontSize: 26 }} />
            </div>
            <div className="imp-method-info">
              <div className="imp-method-title">Paste PhonePe / Bank SMS</div>
              <div className="imp-method-sub">
                Copy transaction SMS messages and paste them here. App auto-extracts amount, merchant, and date.
              </div>
            </div>
            <div className="imp-method-arrow">›</div>
          </div>

          <div className="imp-note">
            <strong>Tip:</strong> Only debit / payment transactions are imported as expenses. Credits and refunds are skipped automatically.
          </div>
        </div>
      )}

      {/* ── STEP: FILE UPLOAD ─────────────────────────────────────── */}
      {step === 'file' && (
        <div>
          <button className="imp-back-row" onClick={() => setStep('method')}>
            <IonIcon icon={chevronBackOutline} /> Back
          </button>

          <div className="imp-upload-zone" onClick={() => fileRef.current?.click()}>
            <IonIcon icon={cloudUploadOutline} style={{ fontSize: 48, color: '#6366F1', marginBottom: 12 }} />
            <div className="imp-upload-title">
              {fileInfo ? fileInfo : 'Tap to select file'}
            </div>
            <div className="imp-upload-sub">CSV or Excel (.xlsx / .xls)</div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFile} />
          </div>

          <div className="imp-banks-label">Supported bank formats</div>
          <div className="imp-banks-grid">
            {['SBI','HDFC','ICICI','Axis','Kotak','Yes Bank','PNB','Any bank CSV'].map(b => (
              <span key={b} className="imp-bank-chip">{b}</span>
            ))}
          </div>

          <div className="imp-howto">
            <div className="imp-howto-title">How to download bank statement:</div>
            <ol className="imp-howto-list">
              <li>Open your bank's mobile app</li>
              <li>Go to Account → Statements</li>
              <li>Choose date range and download as CSV / Excel</li>
              <li>Upload the file above</li>
            </ol>
          </div>
        </div>
      )}

      {/* ── STEP: SMS PASTE ───────────────────────────────────────── */}
      {step === 'sms' && (
        <div>
          <button className="imp-back-row" onClick={() => setStep('method')}>
            <IonIcon icon={chevronBackOutline} /> Back
          </button>

          <div className="imp-desc" style={{ marginTop: 4 }}>
            Open your SMS app, copy all PhonePe / bank messages, and paste them below. You can paste multiple messages at once.
          </div>

          <div className="imp-sms-example">
            <div className="imp-sms-ex-label">Example SMS format:</div>
            <div className="imp-sms-ex-text">
              "Rs.500.00 debited from A/c linked to VPA user@ybl on 13-Jun-25. Sent to Swiggy."
            </div>
          </div>

          <textarea
            className="imp-sms-area"
            placeholder="Paste your PhonePe or bank SMS messages here…"
            value={smsText}
            onChange={e => setSmsText(e.target.value)}
            rows={8}
          />

          <button
            className="imp-primary-btn"
            onClick={handleParseSMS}
            disabled={!smsText.trim()}
          >
            Parse Messages
          </button>
        </div>
      )}

      {/* ── STEP: REVIEW ──────────────────────────────────────────── */}
      {step === 'review' && (
        <div>
          <div className="imp-review-bar">
            <span className="imp-review-count">
              {selectedRows.length} of {transactions.length} selected
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="imp-sel-btn" onClick={() => toggleAll(true)}>All</button>
              <button className="imp-sel-btn" onClick={() => toggleAll(false)}>None</button>
            </div>
          </div>

          <div className="imp-review-list">
            {transactions.map(row => (
              <div key={row._id} className={`imp-row${row.selected ? ' selected' : ''}`}>
                <input
                  type="checkbox"
                  className="imp-checkbox"
                  checked={row.selected}
                  onChange={() => toggleRow(row._id)}
                />
                <div className="imp-row-body">
                  <div className="imp-row-top">
                    <span className="imp-row-date">{row.date}</span>
                    <span className="imp-row-amt">-₹{row.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="imp-row-desc">{row.notes}</div>
                  <Select
                    size="small"
                    value={row.category}
                    onChange={val => setCategory(row._id, val)}
                    style={{ width: '100%', marginTop: 4 }}
                    options={CATEGORIES.map(c => ({ label: c, value: c }))}
                  />
                </div>
                <button className="imp-del-btn" onClick={() => removeRow(row._id)}>
                  <IonIcon icon={trashOutline} style={{ fontSize: 14 }} />
                </button>
              </div>
            ))}
          </div>

          <button
            className="imp-primary-btn"
            onClick={handleImport}
            disabled={importing || !selectedRows.length}
          >
            {importing ? 'Importing…' : `Import ${selectedRows.length} Expense${selectedRows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* ── STEP: DONE ────────────────────────────────────────────── */}
      {step === 'done' && (
        <div className="imp-done">
          <div className="imp-done-icon">
            <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 64, color: '#10B981' }} />
          </div>
          <div className="imp-done-title">{importedCount} expenses imported!</div>
          <div className="imp-done-sub">
            All transactions have been added to your expense list and categorized automatically.
          </div>
          <button className="imp-primary-btn" onClick={() => { reset(); onImported?.() }}>
            View Expenses
          </button>
          <button className="imp-secondary-btn" onClick={reset}>
            Import More
          </button>
        </div>
      )}

    </MobileFormPage>
  )
}

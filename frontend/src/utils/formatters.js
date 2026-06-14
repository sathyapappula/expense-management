import dayjs from 'dayjs'

export const formatCurrency = (amount, currency = '₹') => {
  if (amount === null || amount === undefined) return `${currency}0`
  return `${currency}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('DD MMM YYYY')
}

export const formatPercent = (value) => {
  if (value === null || value === undefined) return '0%'
  const num = Number(value)
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
}

export const getMonthName = (month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[month - 1] || ''
}

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

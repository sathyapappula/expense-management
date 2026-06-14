import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '../../utils/formatters'

export default function BarChart({ data, bars = [], title }) {
  const COLORS = ['#1677ff', '#ff4d4f', '#52c41a', '#faad14', '#722ed1']
  return (
    <div>
      {title && <div style={{ fontWeight: 600, marginBottom: 12 }}>{title}</div>}
      <ResponsiveContainer width="100%" height={300}>
        <ReBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          {bars.map((bar, i) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color || COLORS[i % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}

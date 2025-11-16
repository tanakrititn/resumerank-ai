'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'

type ChartData = {
  status: string
  count: number
}

export default function CandidatesStatusChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-muted-foreground">No candidate data available</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase().replace(/ /g, '_')
    if (statusUpper === 'PENDING_REVIEW' || statusUpper === 'PENDING REVIEW') return '#3b82f6' // blue
    if (statusUpper === 'REVIEWING') return '#8b5cf6' // purple
    if (statusUpper === 'SHORTLISTED') return '#ec4899' // pink
    if (statusUpper === 'INTERVIEWING') return '#f59e0b' // orange
    if (statusUpper === 'OFFER') return '#10b981' // green
    if (statusUpper === 'REJECTED') return '#ef4444' // red
    return '#06b6d4' // cyan default
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-blue-200">
          <p className="font-semibold text-sm mb-1">{payload[0].payload.status}</p>
          <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {payload[0].value} candidates
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="status"
          stroke="#888"
          tick={{ fontSize: 12 }}
          angle={-15}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="#888" tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="count"
          radius={[8, 8, 0, 0]}
          animationDuration={1000}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

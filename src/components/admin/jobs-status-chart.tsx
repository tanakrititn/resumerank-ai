'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'

type ChartData = {
  status: string
  count: number
}

export default function JobsStatusChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-muted-foreground">No job data available</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase()
    if (statusUpper === 'OPEN') return '#10b981' // green
    if (statusUpper === 'CLOSED') return '#ef4444' // red
    if (statusUpper === 'PAUSED') return '#f59e0b' // orange
    return '#9333ea' // purple default
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-purple-200">
          <p className="font-semibold text-sm mb-1">{payload[0].payload.status}</p>
          <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {payload[0].value} jobs
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

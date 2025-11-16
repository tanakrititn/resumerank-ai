'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type ChartData = {
  title: string
  candidates: number
  color: string
}

export default function TopJobsChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-muted-foreground">No jobs available</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-blue-200">
          <p className="font-semibold text-sm mb-1">{payload[0].payload.title}</p>
          <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {payload[0].value} candidates
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.7}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="title"
          stroke="#888"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 11 }}
        />
        <YAxis stroke="#888" tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="candidates"
          radius={[8, 8, 0, 0]}
          animationDuration={1000}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || 'url(#barGradient)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

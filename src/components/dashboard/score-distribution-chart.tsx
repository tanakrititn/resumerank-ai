'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type ChartData = {
  range: string
  count: number
}

export default function ScoreDistributionChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-muted-foreground">No score data available</p>
      </div>
    )
  }

  const getBarColor = (range: string) => {
    if (range.includes('90-100')) return '#22c55e' // green
    if (range.includes('80-89')) return '#84cc16' // lime
    if (range.includes('70-79')) return '#eab308' // yellow
    if (range.includes('60-69')) return '#f59e0b' // orange
    return '#ef4444' // red
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-primary/30">
          <p className="text-sm text-muted-foreground">Score Range</p>
          <p className="font-semibold text-lg">{payload[0].payload.range}</p>
          <p className="text-lg font-bold text-primary">{payload[0].value} candidates</p>
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
          dataKey="range"
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
            <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

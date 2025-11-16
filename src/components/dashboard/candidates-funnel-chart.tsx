'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type ChartData = {
  status: string
  count: number
  color: string
}

export default function CandidatesFunnelChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">No candidates yet</p>
          <p className="text-xs text-muted-foreground">Add candidates to see your hiring pipeline</p>
        </div>
      </div>
    )
  }

  // Check if all counts are 0 - show helpful message
  const totalCount = data.reduce((sum, item) => sum + item.count, 0)
  const hasData = totalCount > 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2">
          <p className="font-semibold">{payload[0].payload.status}</p>
          <p className="text-lg font-bold text-primary">{payload[0].value} candidates</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" stroke="#888" />
          <YAxis dataKey="status" type="category" stroke="#888" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={hasData ? entry.color : '#e5e7eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border-2">
            <p className="text-sm font-medium text-muted-foreground mb-1">Pipeline structure ready</p>
            <p className="text-xs text-muted-foreground">Add candidates to populate this view</p>
          </div>
        </div>
      )}
    </div>
  )
}

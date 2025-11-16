'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type ChartData = {
  date: string
  credits: number
}

export default function CreditsUsageChart({ data }: { data: ChartData[] }) {
  // Don't show empty state if we have data (even if all zeros)
  // This allows showing the chart structure
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">No AI analysis activity yet</p>
          <p className="text-xs text-muted-foreground">Start analyzing candidates to see usage trends</p>
        </div>
      </div>
    )
  }

  // Check if all credits are 0
  const totalCredits = data.reduce((sum, item) => sum + item.credits, 0)
  const hasData = totalCredits > 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-purple-200">
          <p className="text-sm text-muted-foreground">{payload[0].payload.date}</p>
          <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {payload[0].value} credits
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={hasData ? "#9333ea" : "#d1d5db"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={hasData ? "#3b82f6" : "#e5e7eb"} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#888"
            tick={{ fontSize: 12 }}
          />
          <YAxis stroke="#888" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="credits"
            stroke="url(#colorCredits)"
            strokeWidth={3}
            fill="url(#colorCredits)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border-2">
            <p className="text-sm font-medium text-muted-foreground mb-1">Tracking ready for last 7 days</p>
            <p className="text-xs text-muted-foreground">Start analyzing candidates to see credit usage</p>
          </div>
        </div>
      )}
    </div>
  )
}

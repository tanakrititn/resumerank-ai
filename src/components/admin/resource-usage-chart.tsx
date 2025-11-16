'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type ChartData = {
  name: string
  jobs: number
  candidates: number
  analyses: number
}

export default function ResourceUsageChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-muted-foreground">No resource data available</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-purple-200">
          <p className="font-semibold mb-2">{payload[0].payload.name}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm">Jobs</span>
              </div>
              <span className="font-bold text-purple-600">{payload[0].value}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Candidates</span>
              </div>
              <span className="font-bold text-blue-600">{payload[1].value}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Analyses</span>
              </div>
              <span className="font-bold text-green-600">{payload[2].value}</span>
            </div>
          </div>
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
          dataKey="name"
          stroke="#888"
          tick={{ fontSize: 12 }}
        />
        <YAxis stroke="#888" tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        <Bar
          dataKey="jobs"
          stackId="a"
          fill="#9333ea"
          radius={[0, 0, 0, 0]}
          animationDuration={1000}
        />
        <Bar
          dataKey="candidates"
          stackId="a"
          fill="#3b82f6"
          radius={[0, 0, 0, 0]}
          animationDuration={1000}
        />
        <Bar
          dataKey="analyses"
          stackId="a"
          fill="#10b981"
          radius={[8, 8, 0, 0]}
          animationDuration={1000}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

'use client'

interface ScoreGaugeProps {
  score: number
  size?: number
  strokeWidth?: number
}

export default function ScoreGauge({
  score,
  size = 180,
  strokeWidth = 12,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const dashOffset = circumference - progress

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 80) return '#22c55e' // green
    if (score >= 60) return '#3b82f6' // blue
    if (score >= 40) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const getGradient = (score: number) => {
    if (score >= 80) return { from: '#22c55e', to: '#16a34a' }
    if (score >= 60) return { from: '#3b82f6', to: '#2563eb' }
    if (score >= 40) return { from: '#f59e0b', to: '#d97706' }
    return { from: '#ef4444', to: '#dc2626' }
  }

  const gradient = getGradient(score)
  const color = getColor(score)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={`scoreGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient.from} />
            <stop offset="100%" stopColor={gradient.to} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#scoreGradient-${score})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold" style={{ color }}>
          {score}
        </div>
        <div className="text-sm text-muted-foreground font-medium">out of 100</div>
      </div>
    </div>
  )
}

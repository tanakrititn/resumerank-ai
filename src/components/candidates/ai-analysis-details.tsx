'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
} from 'lucide-react'

interface AIAnalysisDetailsProps {
  score: number
  summary: string
  strengths?: string[]
  weaknesses?: string[]
  recommendation?: 'HIRE' | 'INTERVIEW' | 'REJECT' | null
  compact?: boolean
}

const recommendationConfig = {
  HIRE: {
    label: 'Recommend to Hire',
    color: 'bg-green-500 text-white',
    icon: CheckCircle2,
    description: 'Strong candidate, recommended for immediate hiring',
  },
  INTERVIEW: {
    label: 'Recommend to Interview',
    color: 'bg-blue-500 text-white',
    icon: Target,
    description: 'Promising candidate, worth conducting an interview',
  },
  REJECT: {
    label: 'Not Recommended',
    color: 'bg-red-500 text-white',
    icon: XCircle,
    description: 'Does not meet the minimum requirements',
  },
}

export default function AIAnalysisDetails({
  score,
  summary,
  strengths = [],
  weaknesses = [],
  recommendation,
  compact = false,
}: AIAnalysisDetailsProps) {
  const recommendationInfo = recommendation
    ? recommendationConfig[recommendation]
    : null

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Recommendation Badge */}
        {recommendationInfo && (
          <div className="flex items-center gap-2">
            <Badge className={`${recommendationInfo.color} flex items-center gap-1.5 px-3 py-1`}>
              {React.createElement(recommendationInfo.icon, { className: 'h-4 w-4' })}
              {recommendationInfo.label}
            </Badge>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </div>
        )}

        {/* Strengths & Weaknesses - Compact */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {strengths.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  Strengths ({strengths.length})
                </div>
                <ul className="space-y-1">
                  {strengths.slice(0, 2).map((strength, index) => (
                    <li key={index} className="text-xs flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{strength}</span>
                    </li>
                  ))}
                  {strengths.length > 2 && (
                    <li className="text-xs text-muted-foreground pl-5">
                      +{strengths.length - 2} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {weaknesses.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-amber-600" />
                  Areas for Growth ({weaknesses.length})
                </div>
                <ul className="space-y-1">
                  {weaknesses.slice(0, 2).map((weakness, index) => (
                    <li key={index} className="text-xs flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{weakness}</span>
                    </li>
                  ))}
                  {weaknesses.length > 2 && (
                    <li className="text-xs text-muted-foreground pl-5">
                      +{weaknesses.length - 2} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Full detailed view
  return (
    <div className="space-y-6">
      {/* Recommendation Card */}
      {recommendationInfo && (
        <Card className="border-2 overflow-hidden pt-0">
          <CardHeader className={`${recommendationInfo.color} text-white`}>
            <CardTitle className="flex items-center gap-2 text-lg pt-2">
              {React.createElement(recommendationInfo.icon, { className: 'h-5 w-5' })}
              {recommendationInfo.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              {recommendationInfo.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {summary && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-primary" />
            Analysis Summary
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        </div>
      )}

      <Separator />

      {/* Strengths Section */}
      {strengths.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            Key Strengths
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-green-900 dark:text-green-100">
                  {strength}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses Section */}
      {weaknesses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Areas for Growth
          </div>
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900"
              >
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-amber-900 dark:text-amber-100">
                  {weakness}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {strengths.length === 0 && weaknesses.length === 0 && !summary && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No detailed analysis available
        </div>
      )}
    </div>
  )
}

// Add React import for createElement
import React from 'react'

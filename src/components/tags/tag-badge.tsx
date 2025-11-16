'use client'

import { X } from 'lucide-react'
import { getTagColorClasses, type Tag } from '@/lib/utils/tags'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
  tag: Tag
  onRemove?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function TagBadge({
  tag,
  onRemove,
  size = 'md',
  className,
}: TagBadgeProps) {
  const colorClasses = getTagColorClasses(tag.color)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border transition-all duration-200',
        colorClasses.bg,
        colorClasses.text,
        colorClasses.border,
        sizeClasses[size],
        onRemove && 'pr-1',
        'hover:shadow-sm',
        className
      )}
    >
      <span>{tag.name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
          className={cn(
            'rounded-full p-0.5 hover:bg-black/10 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'focus:ring-current'
          )}
          aria-label={`Remove ${tag.name} tag`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

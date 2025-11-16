'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, Command as CommandIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CommandAction {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  shortcut?: string
  action: () => void
  category?: string
  keywords?: string[]
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actions: CommandAction[]
}

export default function CommandPalette({
  open,
  onOpenChange,
  actions,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    if (!query) return actions

    const lowerQuery = query.toLowerCase()
    return actions.filter(
      (action) =>
        action.label.toLowerCase().includes(lowerQuery) ||
        action.description?.toLowerCase().includes(lowerQuery) ||
        action.keywords?.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
    )
  }, [actions, query])

  // Group by category
  const groupedActions = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {}

    filteredActions.forEach((action) => {
      const category = action.category || 'Actions'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(action)
    })

    return groups
  }, [filteredActions])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredActions.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredActions.length - 1
        )
      } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
        e.preventDefault()
        filteredActions[selectedIndex].action()
        onOpenChange(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, filteredActions, selectedIndex, onOpenChange])

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  const handleActionClick = (action: CommandAction) => {
    action.action()
    onOpenChange(false)
    setQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-auto p-0"
            autoFocus
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ↓↑
            </kbd>
            <span>to navigate</span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CommandIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No commands found</p>
              <p className="text-sm mt-1">Try searching for something else</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedActions).map(([category, categoryActions]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {categoryActions.map((action, index) => {
                      const globalIndex = filteredActions.indexOf(action)
                      const isSelected = globalIndex === selectedIndex

                      return (
                        <button
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          className={cn(
                            'w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg transition-all duration-150',
                            'text-left group',
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {action.icon && (
                              <span
                                className={cn(
                                  'flex-shrink-0',
                                  isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                                )}
                              >
                                {action.icon}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{action.label}</div>
                              {action.description && (
                                <div
                                  className={cn(
                                    'text-xs truncate',
                                    isSelected
                                      ? 'text-primary-foreground/80'
                                      : 'text-muted-foreground'
                                  )}
                                >
                                  {action.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {action.shortcut && (
                            <kbd
                              className={cn(
                                'pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border px-2 font-mono text-[10px] font-medium',
                                isSelected
                                  ? 'border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground'
                                  : 'border-border bg-muted text-muted-foreground'
                              )}
                            >
                              {action.shortcut}
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                ↵
              </kbd>
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                ESC
              </kbd>
              to close
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CommandIcon className="h-3 w-3" />
            <span>Command Palette</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

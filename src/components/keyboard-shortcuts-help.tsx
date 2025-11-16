'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard, Zap } from 'lucide-react'
import { formatShortcut, type KeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcuts'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortcuts: KeyboardShortcut[]
}

export default function KeyboardShortcutsHelp({
  open,
  onOpenChange,
  shortcuts,
}: KeyboardShortcutsHelpProps) {
  // Group shortcuts by category (you can enhance this)
  const groupedShortcuts: Record<string, KeyboardShortcut[]> = {
    'Navigation': shortcuts.filter(s =>
      ['/', 'Escape', 'k'].includes(s.key)
    ),
    'Selection': shortcuts.filter(s =>
      ['a', 'x'].some(k => s.key.toLowerCase() === k)
    ),
    'Actions': shortcuts.filter(s =>
      ['s', 't', 'c', 'Delete', 'r'].some(k => s.key.toLowerCase() === k || k === s.key)
    ),
    'View': shortcuts.filter(s =>
      ['?'].includes(s.key)
    ),
  }

  // Remove empty groups
  Object.keys(groupedShortcuts).forEach(key => {
    if (groupedShortcuts[key].length === 0) {
      delete groupedShortcuts[key]
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Power user shortcuts to speed up your workflow
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Tip */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-purple-900">Pro Tip</p>
                <p className="text-sm text-purple-700 mt-1">
                  Press{' '}
                  <kbd className="px-2 py-0.5 rounded bg-white border border-purple-300 text-purple-900 font-mono text-xs">
                    ?
                  </kbd>{' '}
                  anytime to see this shortcuts guide, or{' '}
                  <kbd className="px-2 py-0.5 rounded bg-white border border-purple-300 text-purple-900 font-mono text-xs">
                    {formatShortcut({ key: 'k', ctrlKey: true, description: '' } as KeyboardShortcut)}
                  </kbd>{' '}
                  to open the command palette
                </p>
              </div>
            </div>
          </div>

          {/* Shortcuts by Category */}
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{shortcut.description}</p>
                    </div>
                    <kbd className="px-3 py-1.5 rounded-md bg-muted border border-border font-mono text-sm font-medium shadow-sm">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t text-center text-sm text-muted-foreground">
          <p>
            Right-click on any candidate for quick actions, or use the command palette for fuzzy search
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

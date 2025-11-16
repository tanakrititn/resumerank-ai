'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ContextMenuItem {
  label?: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  shortcut?: string
  danger?: boolean
  divider?: boolean
  submenu?: ContextMenuItem[]
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  position: { x: number; y: number } | null
  onClose: () => void
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [submenuOpen, setSubmenuOpen] = useState<number | null>(null)

  useEffect(() => {
    if (!position) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleScroll = () => {
      onClose()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('scroll', handleScroll, true)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('scroll', handleScroll, true)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [position, onClose])

  if (!position) return null

  // Adjust position if menu would go off screen
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: position.y,
    left: position.x,
    zIndex: 9999,
  }

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled || !item.onClick) return
    item.onClick()
    onClose()
  }

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="animate-in fade-in-0 zoom-in-95 duration-100"
    >
      <Card className="min-w-[200px] p-1 shadow-2xl border-2">
        {items.map((item, index) => (
          <div key={index}>
            {item.divider ? (
              <div className="h-px bg-border my-1" />
            ) : (
              <div className="relative">
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  onMouseEnter={() => item.submenu && setSubmenuOpen(index)}
                  onMouseLeave={() => setSubmenuOpen(null)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    item.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : item.danger
                      ? 'hover:bg-red-50 hover:text-red-600'
                      : 'hover:bg-accent hover:text-accent-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.shortcut && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {item.shortcut}
                      </span>
                    )}
                    {item.submenu && (
                      <span className="text-muted-foreground">▸</span>
                    )}
                  </div>
                </button>

                {/* Submenu */}
                {item.submenu && submenuOpen === index && (
                  <div className="absolute left-full top-0 ml-1">
                    <Card className="min-w-[180px] p-1 shadow-2xl border-2">
                      {item.submenu.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => handleItemClick(subItem)}
                          disabled={subItem.disabled}
                          className={cn(
                            'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                            subItem.disabled
                              ? 'opacity-50 cursor-not-allowed'
                              : subItem.danger
                              ? 'hover:bg-red-50 hover:text-red-600'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {subItem.icon && (
                              <span className="flex-shrink-0">{subItem.icon}</span>
                            )}
                            <span>{subItem.label}</span>
                          </div>
                        </button>
                      ))}
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}

/**
 * Hook to handle context menu
 */
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(
    null
  )

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
  }
}

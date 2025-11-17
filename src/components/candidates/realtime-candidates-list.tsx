'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Mail, Phone, Download, Loader2, RefreshCw, Wifi, WifiOff, Trash2, CheckCircle2, X, Scale, Search, Filter, SlidersHorizontal, Calendar, Tag as TagIcon, Plus, Command as CommandIcon, Keyboard, Eye, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import ComparisonDialog from '@/components/candidates/comparison-dialog'
import BulkReAnalyzeDialog from '@/components/candidates/bulk-re-analyze-dialog'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { notificationService } from '@/lib/utils/notifications'
import type { Database } from '@/types/database'
import TagBadge from '@/components/tags/tag-badge'
import TagInput from '@/components/tags/tag-input'
import { type Tag, getUniqueTags } from '@/lib/utils/tags'
import { useKeyboardShortcuts, type KeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcuts'
import { ContextMenu, useContextMenu, type ContextMenuItem } from '@/components/ui/context-menu-custom'
import CommandPalette, { type CommandAction } from '@/components/command-palette'
import KeyboardShortcutsHelp from '@/components/keyboard-shortcuts-help'
import { config } from '@/lib/config'

type Candidate = Database['public']['Tables']['candidates']['Row']

const statusColors = {
  PENDING_REVIEW: 'secondary',
  REVIEWED: 'default',
  SHORTLISTED: 'default',
  REJECTED: 'destructive',
  HIRED: 'default',
} as const

const statusLabels = {
  PENDING_REVIEW: 'Pending Review',
  REVIEWING: 'Reviewing',
  SHORTLISTED: 'Shortlisted',
  INTERVIEWED: 'Interviewed',
  REJECTED: 'Rejected',
  HIRED: 'Hired',
} as const

interface RealtimeCandidatesListProps {
  jobId: string
  initialCandidates: Candidate[]
  onCandidatesChange?: (candidates: Candidate[]) => void
}

export default function RealtimeCandidatesList({
  jobId,
  initialCandidates,
  onCandidatesChange,
}: RealtimeCandidatesListProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionAttempted, setConnectionAttempted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showComparisonDialog, setShowComparisonDialog] = useState(false)
  const [showBulkReAnalyzeDialog, setShowBulkReAnalyzeDialog] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  })
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [editingTagsFor, setEditingTagsFor] = useState<string | null>(null)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [isBulkTagging, setIsBulkTagging] = useState(false)
  const [showBulkTagDialog, setShowBulkTagDialog] = useState(false)
  const [bulkTagOperation, setBulkTagOperation] = useState<'add' | 'remove' | 'replace'>('add')
  const [bulkTags, setBulkTags] = useState<Tag[]>([])
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [contextMenuCandidate, setContextMenuCandidate] = useState<string | null>(null)

  const router = useRouter()
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu()

  // Ensure component is mounted for portal
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Fetch fresh candidate data from server
  const fetchCandidates = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCandidates(data)

      // Extract unique tags from all candidates
      const candidatesTags = data.map(c => (c.tags as unknown as Tag[]) || [])
      const uniqueTags = getUniqueTags(candidatesTags)
      setAvailableTags(uniqueTags)
    }
  }

  // Update candidate tags
  const handleUpdateTags = async (candidateId: string, tags: Tag[]) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      })

      if (!response.ok) {
        throw new Error('Failed to update tags')
      }

      toast.success('Tags Updated')
      await fetchCandidates()
      setEditingTagsFor(null)
    } catch (error) {
      console.error('Update tags error:', error)
      toast.error('Failed to Update Tags')
    }
  }

  // Handle bulk tag operations
  const handleBulkTag = async () => {
    if (selectedIds.size === 0 || bulkTags.length === 0) return

    setIsBulkTagging(true)
    try {
      const response = await fetch('/api/candidates/bulk-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: Array.from(selectedIds),
          action: bulkTagOperation,
          tags: bulkTags,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update tags')
      }

      toast.success('Tags Updated', {
        description: `Updated tags for ${result.count} candidate(s)`,
      })

      setShowBulkTagDialog(false)
      setBulkTags([])
      clearSelection()
      await fetchCandidates()
    } catch (error) {
      console.error('Bulk tag error:', error)
      toast.error('Failed to Update Tags')
    } finally {
      setIsBulkTagging(false)
    }
  }

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(candidates.map((c) => c.id)))
    }
  }

  const toggleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  // Bulk actions
  const handleBulkUpdateStatus = async (status: string) => {
    if (selectedIds.size === 0) return

    setIsBulkUpdating(true)
    try {
      const response = await fetch('/api/candidates/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: Array.from(selectedIds),
          status,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update candidates')
      }

      toast.success('Bulk Update Successful', {
        description: `Updated ${result.count} candidate(s) to ${statusLabels[status as keyof typeof statusLabels]}`,
      })

      clearSelection()
      await fetchCandidates()
    } catch (error) {
      console.error('Bulk update error:', error)
      toast.error('Bulk Update Failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    setIsBulkDeleting(true)
    try {
      const response = await fetch('/api/candidates/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: Array.from(selectedIds),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete candidates')
      }

      toast.success('Bulk Delete Successful', {
        description: `Deleted ${result.count} candidate(s)`,
      })

      setShowDeleteDialog(false)
      clearSelection()
      await fetchCandidates()
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('Bulk Delete Failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  // Handle status change from comparison dialog
  const handleComparisonStatusChange = async (candidateId: string, status: string) => {
    const response = await fetch('/api/candidates/bulk-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateIds: [candidateId],
        status,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update candidate')
    }

    await fetchCandidates()
  }

  // Get selected candidates for comparison
  const selectedCandidates = candidates.filter((c) => selectedIds.has(c.id))

  // Filter candidates based on search and filters
  const filteredCandidates = candidates.filter((candidate) => {
    // Search filter (name, email, summary)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.ai_summary?.toLowerCase().includes(query) ||
        candidate.resume_text?.toLowerCase().includes(query)

      if (!matchesSearch) return false
    }

    // Tag filter
    if (tagFilter.length > 0) {
      const candidateTags = (candidate.tags as unknown as Tag[]) || []
      const candidateTagNames = candidateTags.map(t => t.name.toLowerCase())
      const hasAllTags = tagFilter.every(filterTag =>
        candidateTagNames.includes(filterTag.toLowerCase())
      )
      if (!hasAllTags) return false
    }

    // Score range filter
    if (candidate.ai_score !== null) {
      if (candidate.ai_score < scoreRange[0] || candidate.ai_score > scoreRange[1]) {
        return false
      }
    }

    // Status filter
    if (statusFilter.length > 0 && !statusFilter.includes(candidate.status)) {
      return false
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      const candidateDate = new Date(candidate.created_at)
      if (dateRange.from && candidateDate < dateRange.from) return false
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        if (candidateDate > endOfDay) return false
      }
    }

    return true
  })

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('')
    setScoreRange([0, 100])
    setStatusFilter([])
    setDateRange({ from: null, to: null })
    setTagFilter([])
  }

  // Count active filters
  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (scoreRange[0] > 0 || scoreRange[1] < 100 ? 1 : 0) +
    (statusFilter.length > 0 ? 1 : 0) +
    (dateRange.from || dateRange.to ? 1 : 0) +
    (tagFilter.length > 0 ? 1 : 0)

  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  // Toggle tag filter
  const toggleTagFilter = (tagName: string) => {
    setTagFilter((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    )
  }

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrlKey: true,
      description: 'Open command palette',
      action: () => setShowCommandPalette(true),
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcutsHelp(true),
    },
    {
      key: 'a',
      ctrlKey: true,
      description: 'Select all candidates',
      action: () => {
        if (candidates.length > 0) {
          setSelectedIds(new Set(candidates.map(c => c.id)))
          toast.success(`Selected ${candidates.length} candidates`)
        }
      },
    },
    {
      key: 'Escape',
      description: 'Clear selection',
      action: () => {
        if (selectedIds.size > 0) {
          clearSelection()
          toast.info('Selection cleared')
        }
      },
      preventDefault: false,
    },
    {
      key: 'Delete',
      description: 'Delete selected',
      action: () => {
        if (selectedIds.size > 0) {
          setShowDeleteDialog(true)
        }
      },
    },
    {
      key: 'r',
      description: 'Refresh candidates',
      action: () => {
        handleRefresh()
        toast.info('Refreshing candidates...')
      },
    },
    {
      key: '/',
      description: 'Focus search',
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
    },
  ]

  useKeyboardShortcuts({ shortcuts, enabled: true })

  // Command palette actions
  const commandActions: CommandAction[] = [
    {
      id: 'select-all',
      label: 'Select All Candidates',
      description: `Select all ${candidates.length} candidates`,
      icon: <CheckCircle2 className="h-4 w-4" />,
      shortcut: 'Ctrl+A',
      category: 'Selection',
      action: () => setSelectedIds(new Set(candidates.map(c => c.id))),
      keywords: ['select', 'all', 'check'],
    },
    {
      id: 'clear-selection',
      label: 'Clear Selection',
      description: `Clear ${selectedIds.size} selected candidates`,
      icon: <X className="h-4 w-4" />,
      shortcut: 'ESC',
      category: 'Selection',
      action: () => clearSelection(),
      keywords: ['clear', 'deselect', 'uncheck'],
    },
    {
      id: 'refresh',
      label: 'Refresh Candidates',
      description: 'Reload the candidates list',
      icon: <RefreshCw className="h-4 w-4" />,
      shortcut: 'R',
      category: 'View',
      action: () => handleRefresh(),
      keywords: ['refresh', 'reload', 'update'],
    },
    {
      id: 'bulk-tag',
      label: 'Manage Tags for Selected',
      description: `Add or remove tags from ${selectedIds.size} candidates`,
      icon: <TagIcon className="h-4 w-4" />,
      category: 'Actions',
      action: () => setShowBulkTagDialog(true),
      keywords: ['tag', 'label', 'bulk', 'organize'],
    },
    {
      id: 'bulk-reanalyze',
      label: 'Re-analyze Selected Candidates',
      description: `Re-analyze ${selectedIds.size} candidates with AI`,
      icon: <RefreshCw className="h-4 w-4" />,
      category: 'Actions',
      action: () => setShowBulkReAnalyzeDialog(true),
      keywords: ['reanalyze', 'ai', 'score', 'bulk', 'analyze again'],
    },
    {
      id: 'bulk-delete',
      label: 'Delete Selected Candidates',
      description: `Delete ${selectedIds.size} selected candidates`,
      icon: <Trash2 className="h-4 w-4" />,
      category: 'Actions',
      action: () => setShowDeleteDialog(true),
      keywords: ['delete', 'remove', 'bulk'],
    },
    {
      id: 'compare',
      label: 'Compare Selected Candidates',
      description: `Compare ${selectedIds.size} candidates side-by-side`,
      icon: <Scale className="h-4 w-4" />,
      category: 'Actions',
      action: () => setShowComparisonDialog(true),
      keywords: ['compare', 'contrast', 'side by side'],
    },
    {
      id: 'shortcuts',
      label: 'View Keyboard Shortcuts',
      description: 'See all available keyboard shortcuts',
      icon: <Keyboard className="h-4 w-4" />,
      shortcut: '?',
      category: 'Help',
      action: () => setShowShortcutsHelp(true),
      keywords: ['keyboard', 'shortcuts', 'help', 'hotkeys'],
    },
  ]

  // Context menu items for a candidate
  const getContextMenuItems = (candidate: Candidate): ContextMenuItem[] => [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: () => router.push(`/jobs/${jobId}/candidates/${candidate.id}`),
    },
    {
      label: 'Download Resume',
      icon: <Download className="h-4 w-4" />,
      onClick: () => {
        if (candidate.resume_url) {
          window.open(candidate.resume_url, '_blank', 'noopener,noreferrer')
        }
      },
      disabled: !candidate.resume_url,
    },
    { divider: true },
    {
      label: 'Change Status',
      icon: <Filter className="h-4 w-4" />,
      submenu: Object.entries(statusLabels).map(([key, label]) => ({
        label,
        icon: candidate.status === key ? <CheckCircle2 className="h-4 w-4" /> : undefined,
        onClick: () => handleBulkUpdateStatus(key),
      })),
    },
    {
      label: 'Manage Tags',
      icon: <TagIcon className="h-4 w-4" />,
      onClick: () => setEditingTagsFor(candidate.id),
    },
    { divider: true },
    {
      label: 'Delete Candidate',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => {
        setSelectedIds(new Set([candidate.id]))
        setShowDeleteDialog(true)
      },
      danger: true,
    },
  ]

  // Notify parent when candidates change
  useEffect(() => {
    if (onCandidatesChange) {
      onCandidatesChange(candidates)
    }
  }, [candidates, onCandidatesChange])

  useEffect(() => {
    console.log('🔄 Real-time useEffect triggered for job:', jobId)
    console.log('🔧 Config enableRealtime:', config.features.enableRealtime)

    // Check if real-time is enabled
    if (!config.features.enableRealtime) {
      console.log('⚠️ Real-time is disabled in configuration')
      setConnectionAttempted(true)
      setIsConnected(false)
      return
    }

    const supabase = createClient()
    console.log('✅ Supabase client created')
    console.log('📡 Setting up real-time subscription for job:', jobId)

    // Use broadcast channel - works without enabling Database Replication
    const channel = supabase
      .channel(`job:${jobId}:candidates`)
      .on('broadcast', { event: 'candidate-change' }, async (payload) => {
        console.log('🔔 Real-time broadcast received:', payload)

        // Fetch fresh data when we receive a broadcast
        await fetchCandidates()

        // Show toast notification
        if (payload.payload?.action === 'insert') {
          toast.info('New candidate added!', {
            description: 'The list has been updated.',
          })
        } else if (payload.payload?.action === 'update') {
          toast.info('Candidate updated!', {
            description: 'The list has been refreshed.',
          })
        } else if (payload.payload?.action === 'delete') {
          toast.info('Candidate deleted!', {
            description: 'The list has been updated.',
          })
        }
      })
      .subscribe((status) => {
        console.log('📶 Real-time channel status:', status)
        console.log('🔍 Current isConnected before update:', isConnected)
        setConnectionAttempted(true)

        if (status === 'SUBSCRIBED') {
          console.log('🎉 Setting isConnected to TRUE')
          setIsConnected(true)
          console.log('✅ Real-time enabled - updates will appear instantly!')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Only show warning for actual errors, not for CLOSED (which is normal cleanup)
          console.log('❌ Setting isConnected to FALSE (error)')
          setIsConnected(false)
          console.log('⚠️ Real-time connection failed - use refresh button for updates')
          toast.error('Real-time connection failed', {
            description: 'Please refresh the page to try again.',
          })
        } else if (status === 'CLOSED') {
          // Normal cleanup - just update state, no toast
          console.log('🔌 Setting isConnected to FALSE (closed)')
          setIsConnected(false)
        } else {
          console.log('❓ Unknown status:', status)
        }
      })

    return () => {
      console.log('🔌 Cleaning up real-time subscription')
      supabase.removeChannel(channel)
    }
  }, [jobId])

  const isAllSelected = candidates.length > 0 && selectedIds.size === candidates.length
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < candidates.length

  // Bulk Action Toolbar Component
  const BulkActionToolbar = () => {
    if (!isMounted || selectedIds.size === 0) return null

    return createPortal(
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          WebkitTransform: 'translateX(-50%)',
          MozTransform: 'translateX(-50%)',
          msTransform: 'translateX(-50%)',
          zIndex: 99999,
          pointerEvents: 'auto',
          animation: 'slideUp 0.3s ease-out',
          WebkitAnimation: 'slideUp 0.3s ease-out',
          maxWidth: 'calc(100vw - 32px)',
          width: 'auto',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(to right, rgb(250, 245, 255), rgb(239, 246, 255))',
            borderRadius: '0.75rem',
            border: '2px solid rgb(226, 232, 240)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '12px',
          }}
        >
          {/* Mobile Layout: Compact with dropdown menu for all actions */}
          <div className="flex sm:hidden items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="whitespace-nowrap">{selectedIds.size}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkUpdating || isBulkDeleting}
                  className="bg-white hover:bg-primary/10 px-3"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-[100000]">
                {selectedIds.size >= 2 && selectedIds.size <= 3 && (
                  <DropdownMenuItem onClick={() => setShowComparisonDialog(true)}>
                    <Scale className="mr-2 h-4 w-4" />
                    Compare
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowBulkTagDialog(true)}>
                  <TagIcon className="mr-2 h-4 w-4" />
                  Manage Tags
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowBulkReAnalyzeDialog(true)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-analyze
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkUpdating || isBulkDeleting}
                  className="bg-white hover:bg-primary/10 flex-1 max-w-[120px]"
                >
                  {isBulkUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Filter className="mr-1 h-4 w-4" />
                      <span className="truncate">Status</span>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[100000]">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => handleBulkUpdateStatus(key)}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={isBulkUpdating || isBulkDeleting}
              className="px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Layout: Full horizontal layout */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>{selectedIds.size} selected</span>
            </div>

            <div style={{ height: '24px', width: '1px', backgroundColor: 'rgb(226, 232, 240)' }} />

            {selectedIds.size >= 2 && selectedIds.size <= 3 && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowComparisonDialog(true)}
                  disabled={isBulkUpdating || isBulkDeleting}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Scale className="mr-2 h-4 w-4" />
                  Compare
                </Button>
                <div style={{ height: '24px', width: '1px', backgroundColor: 'rgb(226, 232, 240)' }} />
              </>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowBulkTagDialog(true)}
              disabled={isBulkUpdating || isBulkDeleting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <TagIcon className="mr-2 h-4 w-4" />
              Tags
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowBulkReAnalyzeDialog(true)}
              disabled={isBulkUpdating || isBulkDeleting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-analyze
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkUpdating || isBulkDeleting}
                  className="bg-white hover:bg-primary/10"
                >
                  {isBulkUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Filter className="mr-2 h-4 w-4" />
                      Change Status
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="z-[100000]">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => handleBulkUpdateStatus(key)}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isBulkUpdating || isBulkDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>

            <div style={{ height: '24px', width: '1px', backgroundColor: 'rgb(226, 232, 240)' }} />

            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={isBulkUpdating || isBulkDeleting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return (
    <>
      <Card className="border-2 shadow-sm">
        <CardHeader className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {candidates.length > 0 && (
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all candidates"
                  className={isSomeSelected ? 'data-[state=checked]:bg-primary' : ''}
                />
              )}
              <CardTitle className="text-base sm:text-lg md:text-xl min-w-0">
                <span className="truncate">Candidates ({filteredCandidates.length}{filteredCandidates.length !== candidates.length && ` of ${candidates.length}`})</span>
                {selectedIds.size > 0 && (
                  <span className="ml-2 text-xs sm:text-sm font-normal text-muted-foreground whitespace-nowrap">
                    ({selectedIds.size} selected)
                  </span>
                )}
              </CardTitle>
              {connectionAttempted && (
                <>
                  {isConnected ? (
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-600 whitespace-nowrap">
                      <Wifi className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                      <WifiOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-[10px] sm:text-xs hidden sm:inline">Realtime off</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCommandPalette(true)}
                className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 hidden md:flex"
                title="Open command palette (Cmd+K)"
              >
                <CommandIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline text-xs sm:text-sm">Commands</span>
                <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                  ⌘K
                </kbd>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowShortcutsHelp(true)}
                title="Keyboard shortcuts (?)"
                className="h-8 sm:h-9 w-8 sm:w-9 p-0 hidden sm:flex"
              >
                <Keyboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              {!isConnected && connectionAttempted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title="Refresh to see updates (R)"
                  className="h-8 sm:h-9 w-8 sm:w-9 p-0"
                >
                  <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
              <Link href={`/jobs/${jobId}/candidates/new`}>
                <Button size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="space-y-3">
            <div className="flex gap-1.5 sm:gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 flex-shrink-0">
                    <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline text-sm">Filters</span>
                    {activeFiltersCount > 0 && (
                      <Badge variant="default" className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center rounded-full text-[10px] sm:text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Advanced Filters
                      </h4>
                    </div>

                    {/* Score Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        AI Score Range: {scoreRange[0]} - {scoreRange[1]}
                      </label>
                      <Slider
                        value={scoreRange}
                        onValueChange={(value) => setScoreRange(value as [number, number])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <Badge
                            key={key}
                            variant={statusFilter.includes(key) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleStatusFilter(key)}
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Applied Date Range
                      </label>
                      <div className="grid gap-2">
                        <Input
                          type="date"
                          value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              from: e.target.value ? new Date(e.target.value) : null,
                            }))
                          }
                          className="text-sm"
                        />
                        <Input
                          type="date"
                          value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              to: e.target.value ? new Date(e.target.value) : null,
                            }))
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>

                    {/* Tag Filter */}
                    {availableTags.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <TagIcon className="h-4 w-4" />
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map((tag) => (
                            <button
                              key={tag.name}
                              onClick={() => toggleTagFilter(tag.name)}
                              className={tagFilter.includes(tag.name) ? 'opacity-100' : 'opacity-50 hover:opacity-75'}
                            >
                              <TagBadge tag={tag} size="sm" />
                            </button>
                          ))}
                        </div>
                        {tagFilter.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Showing candidates with all selected tags
                          </p>
                        )}
                      </div>
                    )}

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="w-full"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearAllFilters}
                  title="Clear all filters"
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchQuery}"
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {(scoreRange[0] > 0 || scoreRange[1] < 100) && (
                  <Badge variant="secondary" className="gap-1">
                    Score: {scoreRange[0]}-{scoreRange[1]}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setScoreRange([0, 100])}
                    />
                  </Badge>
                )}
                {statusFilter.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {statusFilter.length} selected
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setStatusFilter([])}
                    />
                  </Badge>
                )}
                {(dateRange.from || dateRange.to) && (
                  <Badge variant="secondary" className="gap-1">
                    Date Range
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setDateRange({ from: null, to: null })}
                    />
                  </Badge>
                )}
                {tagFilter.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    Tags: {tagFilter.length} selected
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setTagFilter([])}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredCandidates.length === 0 && candidates.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No candidates yet. Add your first candidate to get started!
              </p>
              <Link href={`/jobs/${jobId}/candidates/new`}>
                <Button className="gradient-primary">Add Candidate</Button>
              </Link>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-8">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No candidates match your filters
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedIds.has(candidate.id)
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'hover:shadow-md'
                  }`}
                  onContextMenu={(e) => {
                    handleContextMenu(e)
                    setContextMenuCandidate(candidate.id)
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedIds.has(candidate.id)}
                        onCheckedChange={() => toggleSelectOne(candidate.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${candidate.name}`}
                      />
                    </div>
                    <Link
                      href={`/jobs/${jobId}/candidates/${candidate.id}`}
                      className="flex-1 flex items-start justify-between cursor-pointer"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">
                            {candidate.name}
                          </h3>
                          <Badge variant={statusColors[candidate.status as keyof typeof statusColors]}>
                            {candidate.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4" />
                            {candidate.email}
                          </div>
                          {candidate.phone && (
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4" />
                              {candidate.phone}
                            </div>
                          )}
                        </div>

                        {candidate.ai_summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {candidate.ai_summary}
                          </p>
                        )}

                        {/* Tags Section */}
                        <div onClick={(e) => {e.preventDefault(); e.stopPropagation();}}>
                          {editingTagsFor === candidate.id ? (
                            <div className="space-y-2">
                              <TagInput
                                tags={(candidate.tags as unknown as Tag[]) || []}
                                onChange={(tags) => handleUpdateTags(candidate.id, tags)}
                                availableTags={availableTags}
                                placeholder="Add tags..."
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingTagsFor(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {((candidate.tags as unknown as Tag[]) || []).map((tag) => (
                                <TagBadge key={tag.name} tag={tag} size="sm" />
                              ))}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => setEditingTagsFor(candidate.id)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                {(candidate.tags as unknown as Tag[])?.length > 0 ? 'Edit' : 'Add Tags'}
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground" suppressHydrationWarning>
                          Added{' '}
                          {formatDistanceToNow(new Date(candidate.created_at), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>

                      <div className="ml-4 text-right space-y-2">
                        {candidate.ai_score !== null ? (
                          <div>
                            <div className="text-3xl font-bold">
                              {candidate.ai_score}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              AI Score
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>
                              {candidate.status === 'PENDING_REVIEW'
                                ? 'Analyzing...'
                                : 'Not scored'}
                            </span>
                          </div>
                        )}

                        {candidate.resume_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (candidate.resume_url) {
                                window.open(candidate.resume_url, '_blank', 'noopener,noreferrer')
                              }
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render Bulk Action Toolbar via Portal */}
      <BulkActionToolbar />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} Candidate(s)?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the selected
              candidates and their resume files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isBulkDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <ComparisonDialog
        candidates={selectedCandidates}
        open={showComparisonDialog}
        onOpenChange={setShowComparisonDialog}
        onStatusChange={handleComparisonStatusChange}
      />

      {/* Bulk Re-analyze Dialog */}
      <BulkReAnalyzeDialog
        candidateIds={Array.from(selectedIds)}
        candidateNames={new Map(candidates.filter(c => selectedIds.has(c.id)).map(c => [c.id, c.name]))}
        open={showBulkReAnalyzeDialog}
        onOpenChange={setShowBulkReAnalyzeDialog}
      />

      {/* Bulk Tag Dialog */}
      <Dialog open={showBulkTagDialog} onOpenChange={setShowBulkTagDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Tags for {selectedIds.size} Candidate(s)</DialogTitle>
            <DialogDescription>
              Choose how to update tags for the selected candidates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Operation Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Operation</label>
              <div className="flex gap-2">
                <Button
                  variant={bulkTagOperation === 'add' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBulkTagOperation('add')}
                  className="flex-1"
                >
                  Add Tags
                </Button>
                <Button
                  variant={bulkTagOperation === 'remove' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBulkTagOperation('remove')}
                  className="flex-1"
                >
                  Remove Tags
                </Button>
                <Button
                  variant={bulkTagOperation === 'replace' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBulkTagOperation('replace')}
                  className="flex-1"
                >
                  Replace All
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {bulkTagOperation === 'add' && 'Add tags to candidates (existing tags kept)'}
                {bulkTagOperation === 'remove' && 'Remove matching tags from candidates'}
                {bulkTagOperation === 'replace' && 'Replace all tags with new ones'}
              </p>
            </div>

            {/* Tag Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {bulkTagOperation === 'remove' ? 'Tags to Remove' : 'Tags'}
              </label>
              <TagInput
                tags={bulkTags}
                onChange={setBulkTags}
                availableTags={availableTags}
                placeholder={`${bulkTagOperation === 'remove' ? 'Select tags to remove' : 'Add tags'}...`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkTagDialog(false)
                setBulkTags([])
              }}
              disabled={isBulkTagging}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkTag}
              disabled={isBulkTagging || bulkTags.length === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isBulkTagging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <TagIcon className="mr-2 h-4 w-4" />
                  {bulkTagOperation === 'add' && 'Add Tags'}
                  {bulkTagOperation === 'remove' && 'Remove Tags'}
                  {bulkTagOperation === 'replace' && 'Replace Tags'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        actions={commandActions}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        open={showShortcutsHelp}
        onOpenChange={setShowShortcutsHelp}
        shortcuts={shortcuts}
      />

      {/* Context Menu */}
      {contextMenu && contextMenuCandidate && (
        <ContextMenu
          position={contextMenu}
          items={getContextMenuItems(
            candidates.find(c => c.id === contextMenuCandidate)!
          )}
          onClose={() => {
            closeContextMenu()
            setContextMenuCandidate(null)
          }}
        />
      )}
    </>
  )
}

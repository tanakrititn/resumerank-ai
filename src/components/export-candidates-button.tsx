'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportCandidates, type ExportFormat } from '@/lib/utils/export'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Candidate = Database['public']['Tables']['candidates']['Row']

interface ExportCandidatesButtonProps {
  candidates: Candidate[]
  jobTitle?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
}

export default function ExportCandidatesButton({
  candidates,
  jobTitle,
  variant = 'outline',
  size = 'default',
  showText = true,
}: ExportCandidatesButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    if (candidates.length === 0) {
      toast.error('No candidates to export', {
        description: 'There are no candidates available for export.',
      })
      return
    }

    setIsExporting(true)

    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300))

      exportCandidates({ candidates, jobTitle }, format)

      toast.success('Export successful!', {
        description: `Downloaded ${candidates.length} candidate${
          candidates.length === 1 ? '' : 's'
        } as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'An error occurred during export',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isExporting || candidates.length === 0}
          className="gap-2 w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-full animate-spin" />
              {showText && <span>Exporting...</span>}
            </>
          ) : (
            <>
              <Download className="h-4 w-full" />
              {showText && <span>Export</span>}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Candidates
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport('xlsx')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          <div className="flex-1">
            <div className="font-medium">Excel File (.xlsx)</div>
            <div className="text-xs text-muted-foreground">
              Best for spreadsheet apps
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4 text-blue-600" />
          <div className="flex-1">
            <div className="font-medium">CSV File (.csv)</div>
            <div className="text-xs text-muted-foreground">
              Universal format
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          {candidates.length} candidate{candidates.length === 1 ? '' : 's'} ready
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

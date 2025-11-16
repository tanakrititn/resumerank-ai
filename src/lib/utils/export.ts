import * as XLSX from 'xlsx'
import type { Database } from '@/types/database'

type Candidate = Database['public']['Tables']['candidates']['Row']

export type ExportFormat = 'csv' | 'xlsx'

interface ExportData {
  candidates: Candidate[]
  jobTitle?: string
}

/**
 * Format candidate data for export
 */
function formatCandidateForExport(candidate: Candidate) {
  return {
    'Name': candidate.name,
    'Email': candidate.email,
    'Phone': candidate.phone || 'N/A',
    'AI Score': candidate.ai_score !== null ? candidate.ai_score : 'Not Scored',
    'Status': formatStatus(candidate.status),
    'AI Summary': candidate.ai_summary || 'N/A',
    'Notes': candidate.notes || 'N/A',
    'Applied Date': formatDate(candidate.created_at),
    'Last Updated': formatDate(candidate.updated_at),
  }
}

/**
 * Format status for display
 */
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Generate filename with timestamp
 */
function generateFilename(jobTitle?: string, format: ExportFormat = 'xlsx'): string {
  const timestamp = new Date().toISOString().split('T')[0]
  const jobPart = jobTitle ? `_${jobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}` : ''
  return `candidates${jobPart}_${timestamp}.${format}`
}

/**
 * Export candidates to CSV format
 */
export function exportToCSV(data: ExportData): void {
  try {
    const { candidates, jobTitle } = data

    if (candidates.length === 0) {
      throw new Error('No candidates to export')
    }

    // Format data
    const formattedData = candidates.map(formatCandidateForExport)

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData)

    // Auto-size columns
    const maxWidth = 50
    const colWidths = Object.keys(formattedData[0]).map(key => ({
      wch: Math.min(
        Math.max(
          key.length,
          ...formattedData.map(row => String(row[key as keyof typeof row]).length)
        ),
        maxWidth
      ),
    }))
    worksheet['!cols'] = colWidths

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates')

    // Generate filename and download
    const filename = generateFilename(jobTitle, 'csv')
    XLSX.writeFile(workbook, filename, { bookType: 'csv' })

    return
  } catch (error) {
    console.error('Export to CSV error:', error)
    throw error
  }
}

/**
 * Export candidates to Excel format
 */
export function exportToExcel(data: ExportData): void {
  try {
    const { candidates, jobTitle } = data

    if (candidates.length === 0) {
      throw new Error('No candidates to export')
    }

    // Format data
    const formattedData = candidates.map(formatCandidateForExport)

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData)

    // Style header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!worksheet[cellAddress]) continue

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: '000000' } },
        fill: { fgColor: { rgb: 'E9D5FF' } }, // Purple-200
        alignment: { horizontal: 'center', vertical: 'center' },
      }
    }

    // Auto-size columns
    const maxWidth = 50
    const colWidths = Object.keys(formattedData[0]).map(key => ({
      wch: Math.min(
        Math.max(
          key.length,
          ...formattedData.map(row => String(row[key as keyof typeof row]).length)
        ),
        maxWidth
      ),
    }))
    worksheet['!cols'] = colWidths

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates')

    // Add metadata
    workbook.Props = {
      Title: `Candidates${jobTitle ? ` - ${jobTitle}` : ''}`,
      Subject: 'Candidate Export',
      Author: 'ResumeRank AI',
      CreatedDate: new Date(),
    }

    // Generate filename and download
    const filename = generateFilename(jobTitle, 'xlsx')
    XLSX.writeFile(workbook, filename, { bookType: 'xlsx' })

    return
  } catch (error) {
    console.error('Export to Excel error:', error)
    throw error
  }
}

/**
 * Main export function that handles both formats
 */
export function exportCandidates(
  data: ExportData,
  format: ExportFormat = 'xlsx'
): void {
  if (format === 'csv') {
    exportToCSV(data)
  } else {
    exportToExcel(data)
  }
}

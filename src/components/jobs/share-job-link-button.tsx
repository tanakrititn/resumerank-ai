'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Share2, Copy, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { env } from '@/lib/env'
import { createClient } from '@/lib/supabase/client'

interface ShareJobLinkButtonProps {
  jobId: string
  jobTitle: string
  initialCandidatesCount?: number
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
}

export default function ShareJobLinkButton({
  jobId,
  jobTitle,
  initialCandidatesCount = 0,
  variant = 'outline',
  size = 'lg',
  showText = true,
}: ShareJobLinkButtonProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [candidatesCount, setCandidatesCount] = useState(initialCandidatesCount)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  const applicationUrl = `${env.NEXT_PUBLIC_APP_URL}/apply/${jobId}`

  // Fetch latest candidates count when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCandidatesCount()
    }
  }, [isOpen, jobId])

  async function fetchCandidatesCount() {
    setIsLoadingStats(true)
    try {
      const supabase = createClient()
      const { count, error } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', jobId)

      if (!error && count !== null) {
        setCandidatesCount(count)
      }
    } catch (error) {
      console.error('Failed to fetch candidates count:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(applicationUrl)
      setIsCopied(true)
      toast.success('Link Copied!', {
        description: 'Application link has been copied to clipboard.',
      })

      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy', {
        description: 'Please copy the link manually.',
      })
    }
  }

  function openInNewTab() {
    window.open(applicationUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2 w-full">
          <Share2 className="h-4 w-4" />
          {showText && <span>Share</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Share2 className="h-6 w-6 text-purple-600" />
            Share Job Application Link
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Share this link with candidates to receive applications directly.
            No login required for applicants!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Job Info */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-100">
            <p className="text-sm text-muted-foreground mb-1">Job Position</p>
            <p className="font-semibold text-lg">{jobTitle}</p>
          </div>

          {/* Application Link */}
          <div className="space-y-2">
            <Label htmlFor="applicationUrl" className="text-base">
              Public Application Link
            </Label>
            <div className="flex gap-2">
              <Input
                id="applicationUrl"
                value={applicationUrl}
                readOnly
                className="font-mono text-sm"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="icon"
                className="flex-shrink-0 w-12"
              >
                {isCopied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Candidates can apply directly through this link without creating an account.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={copyToClipboard}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-5 w-5" />
                  Copy Link
                </>
              )}
            </Button>
            <Button
              onClick={openInNewTab}
              variant="outline"
              size="lg"
              className="border-2"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Preview
            </Button>
          </div>

          {/* Sharing Tips */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              💡 Sharing Tips:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Share on social media (LinkedIn, Twitter, Facebook)</li>
              <li>• Add to job boards and career pages</li>
              <li>• Send directly via email or messaging apps</li>
              <li>• Embed in your website or blog</li>
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              {isLoadingStats ? (
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              ) : (
                <div className="text-4xl font-bold text-blue-600">{candidatesCount}</div>
              )}
              <div className="text-sm font-medium text-blue-800 mt-2">
                Total Applications
              </div>
              <div className="text-xs text-blue-600 mt-1">
                via public link
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="text-4xl font-bold text-green-600">∞</div>
              <div className="text-sm font-medium text-green-800 mt-2">
                Always Open
              </div>
              <div className="text-xs text-green-600 mt-1">
                accepting applications
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

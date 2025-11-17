'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { notificationService } from '@/lib/utils/notifications'
import { toast } from 'sonner'

export default function NotificationBanner() {
  const [show, setShow] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check if we should show the banner
    const checkPermission = () => {
      if (!notificationService.isSupported()) {
        return
      }

      const currentPermission = notificationService.getPermission()
      setPermission(currentPermission)

      // Show banner if permission is default and user hasn't dismissed it recently
      if (currentPermission === 'default') {
        const dismissed = localStorage.getItem('notification-banner-dismissed')
        if (!dismissed) {
          // Show banner after 3 seconds
          setTimeout(() => setShow(true), 3000)
        }
      }
    }

    checkPermission()
  }, [])

  const handleEnable = async () => {
    const result = await notificationService.requestPermission()
    setPermission(result)

    if (result === 'granted') {
      toast.success('Notifications Enabled!', {
        description: "You'll receive real-time updates about new candidates.",
        icon: <Bell className="h-4 w-4" />,
      })
      setShow(false)
    } else if (result === 'denied') {
      toast.error('Notifications Blocked', {
        description: 'You can enable them in your browser settings.',
      })
      setShow(false)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    // Remember dismissal for 7 days
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    localStorage.setItem('notification-banner-dismissed', expires.toISOString())
  }

  if (!show || permission !== 'default') {
    return null
  }

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 max-w-[calc(100vw-1.5rem)] sm:max-w-md animate-slide-up">
      <Card className="border-2 shadow-2xl bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="p-3 sm:p-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-foreground">Enable Notifications</h3>
                <p className="text-xs sm:text-sm text-foreground/70 mt-1">
                  Get instant alerts when new candidates apply or AI analysis completes
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={handleEnable}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Check className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Enable
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-foreground hover:text-foreground hover:bg-secondary/80 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <X className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Maybe Later
                </Button>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDismiss}
              className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 text-foreground hover:text-foreground hover:bg-secondary/80"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

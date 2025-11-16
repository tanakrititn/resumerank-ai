'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { notificationService } from '@/lib/utils/notifications'
import { toast } from 'sonner'

export default function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [enabled, setEnabled] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    setIsSupported(notificationService.isSupported())
    setPermission(notificationService.getPermission())
    setEnabled(notificationService.isEnabled())
  }, [])

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    const result = await notificationService.requestPermission()
    setPermission(result)
    setIsRequesting(false)

    if (result === 'granted') {
      setEnabled(true)
      toast.success('Notifications Enabled', {
        description: "You'll now receive real-time updates.",
      })

      // Send test notification
      setTimeout(() => {
        notificationService.show({
          title: '🎉 Notifications Working!',
          body: 'You will receive updates about new candidates and AI analysis.',
          tag: 'test-notification',
        })
      }, 1000)
    } else {
      toast.error('Permission Denied', {
        description: 'Please enable notifications in your browser settings.',
      })
    }
  }

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    notificationService.setEnabled(checked)

    if (checked) {
      toast.success('Notifications Enabled')
    } else {
      toast.info('Notifications Disabled')
    }
  }

  if (!isSupported) {
    return (
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <BellOff className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <CardTitle>Notifications Not Supported</CardTitle>
              <CardDescription>
                Your browser doesn't support notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              permission === 'granted'
                ? 'bg-green-100'
                : permission === 'denied'
                ? 'bg-red-100'
                : 'bg-gray-100'
            }`}>
              <Bell className={`h-5 w-5 ${
                permission === 'granted'
                  ? 'text-green-600'
                  : permission === 'denied'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`} />
            </div>
            <div>
              <CardTitle>Browser Notifications</CardTitle>
              <CardDescription>
                Get real-time alerts about candidates and AI analysis
              </CardDescription>
            </div>
          </div>
          {permission === 'granted' ? (
            <Badge variant="default" className="bg-green-500">
              <Check className="mr-1 h-3 w-3" />
              Enabled
            </Badge>
          ) : permission === 'denied' ? (
            <Badge variant="destructive">
              <X className="mr-1 h-3 w-3" />
              Blocked
            </Badge>
          ) : (
            <Badge variant="secondary">
              Not Set
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === 'default' && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900 mb-3">
              Enable notifications to receive instant alerts when:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 mb-4">
              <li>• New candidates apply to your jobs</li>
              <li>• AI analysis completes</li>
              <li>• Candidate status changes</li>
            </ul>
            <Button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isRequesting ? 'Requesting...' : 'Enable Notifications'}
            </Button>
          </div>
        )}

        {permission === 'granted' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-toggle" className="text-base">
                  Enable Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts in real-time
                </p>
              </div>
              <Switch
                id="notifications-toggle"
                checked={enabled}
                onCheckedChange={handleToggle}
              />
            </div>

            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-900 font-medium mb-2">
                ✅ Notifications are working!
              </p>
              <p className="text-xs text-green-700">
                You'll receive alerts even when this tab is not active.
              </p>
            </div>
          </div>
        )}

        {permission === 'denied' && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-900 font-medium mb-2">
              Notifications Blocked
            </p>
            <p className="text-xs text-red-700 mb-3">
              To enable notifications, please:
            </p>
            <ol className="text-xs text-red-700 space-y-1 list-decimal list-inside">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Find "Notifications" in the permissions list</li>
              <li>Change the setting to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

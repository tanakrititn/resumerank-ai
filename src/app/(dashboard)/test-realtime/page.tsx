'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function TestRealtimePage() {
  const [status, setStatus] = useState<string>('NOT_CONNECTED')
  const [logs, setLogs] = useState<string[]>([])
  const [messageCount, setMessageCount] = useState(0)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 20))
    console.log(message)
  }

  useEffect(() => {
    addLog('🔧 Initializing real-time test...')
    const supabase = createClient()

    addLog('📡 Creating test channel: test-channel')

    const channel = supabase
      .channel('test-channel')
      .on('broadcast', { event: 'test-event' }, (payload) => {
        addLog(`🔔 Received broadcast: ${JSON.stringify(payload)}`)
        setMessageCount((prev) => prev + 1)
        toast.success('Real-time message received!')
      })
      .subscribe((status) => {
        addLog(`📶 Channel status changed: ${status}`)
        setStatus(status)

        if (status === 'SUBSCRIBED') {
          addLog('✅ Successfully subscribed to real-time channel!')
          toast.success('Real-time connected!', {
            description: 'WebSocket connection established',
          })
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          addLog(`❌ Connection failed: ${status}`)
          toast.error('Real-time connection failed', {
            description: `Status: ${status}`,
          })
        } else if (status === 'CHANNEL_CONNECTING') {
          addLog('🔄 Connecting to real-time channel...')
        }
      })

    return () => {
      addLog('🔌 Cleaning up test channel')
      supabase.removeChannel(channel)
    }
  }, [])

  const sendTestMessage = async () => {
    addLog('📤 Sending test broadcast...')
    const supabase = createClient()
    const channel = supabase.channel('test-channel')

    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        addLog('📤 Channel subscribed, sending message...')
        await channel.send({
          type: 'broadcast',
          event: 'test-event',
          payload: { message: 'Hello from test!', timestamp: new Date().toISOString() },
        })
        addLog('✅ Test message sent')
        toast.info('Test message sent')
        await supabase.removeChannel(channel)
      }
    })
  }

  const getStatusColor = () => {
    switch (status) {
      case 'SUBSCRIBED':
        return 'bg-green-500'
      case 'CHANNEL_ERROR':
      case 'TIMED_OUT':
      case 'CLOSED':
        return 'bg-red-500'
      case 'CHANNEL_CONNECTING':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Real-time Connection Test</h1>
        <p className="text-muted-foreground">
          This page tests the Supabase real-time connection and helps diagnose issues.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full ${getStatusColor()}`} />
              <Badge variant={status === 'SUBSCRIBED' ? 'default' : 'secondary'}>
                {status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Environment:</span>{' '}
                {process.env.NODE_ENV}
              </div>
              <div className="text-sm">
                <span className="font-medium">Supabase URL:</span>{' '}
                {process.env.NEXT_PUBLIC_SUPABASE_URL}
              </div>
              <div className="text-sm">
                <span className="font-medium">Messages Received:</span> {messageCount}
              </div>
            </div>

            <Button onClick={sendTestMessage} disabled={status !== 'SUBSCRIBED'}>
              Send Test Message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto space-y-1 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">No logs yet...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-xs">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">If connection fails:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Check Supabase Dashboard → Project Settings → API → Enable Realtime</li>
              <li>Verify environment variables are correct (.env.local)</li>
              <li>Check browser console for WebSocket errors</li>
              <li>Check firewall/network settings blocking WebSocket connections</li>
              <li>Verify Supabase project is not paused</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Expected behavior:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Status should change from CHANNEL_CONNECTING to SUBSCRIBED</li>
              <li>Clicking "Send Test Message" should increment message count</li>
              <li>Toast notifications should appear for connection and messages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

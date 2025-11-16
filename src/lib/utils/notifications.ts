// Browser Notification Service

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
}

class NotificationService {
  private static instance: NotificationService
  private permission: NotificationPermission = 'default'
  private enabled: boolean = true

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission
      this.loadSettings()
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Load notification settings from localStorage
  private loadSettings(): void {
    try {
      const settings = localStorage.getItem('notification-settings')
      if (settings) {
        const parsed = JSON.parse(settings)
        this.enabled = parsed.enabled !== false
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error)
    }
  }

  // Save notification settings
  private saveSettings(): void {
    try {
      localStorage.setItem(
        'notification-settings',
        JSON.stringify({ enabled: this.enabled })
      )
    } catch (error) {
      console.error('Failed to save notification settings:', error)
    }
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    return this.permission
  }

  // Check if notifications are enabled by user
  isEnabled(): boolean {
    return this.enabled
  }

  // Toggle notifications on/off
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.saveSettings()
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported')
      return 'denied'
    }

    if (this.permission === 'granted') {
      return 'granted'
    }

    try {
      this.permission = await Notification.requestPermission()
      if (this.permission === 'granted') {
        this.enabled = true
        this.saveSettings()
      }
      return this.permission
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return 'denied'
    }
  }

  // Show a notification
  async show(options: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported')
      return
    }

    if (!this.enabled) {
      console.log('Notifications disabled by user')
      return
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    // Don't show notification if page is visible
    if (document.visibilityState === 'visible') {
      console.log('Page is visible, skipping notification')
      return
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        badge: options.badge || '/icon-72.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: false,
      })

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000)

      // Handle click
      notification.onclick = () => {
        window.focus()
        notification.close()
        if (options.data?.url) {
          window.location.href = options.data.url
        }
      }
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }

  // Show notification for new candidate
  async notifyNewCandidate(candidateName: string, jobTitle: string, jobId: string): Promise<void> {
    await this.show({
      title: '🎯 New Candidate Applied!',
      body: `${candidateName} applied for ${jobTitle}`,
      tag: `new-candidate-${Date.now()}`,
      data: {
        type: 'new-candidate',
        url: `/jobs/${jobId}`,
      },
      requireInteraction: true,
    })
  }

  // Show notification for completed AI analysis
  async notifyAnalysisComplete(candidateName: string, score: number, jobId: string): Promise<void> {
    const emoji = score >= 80 ? '🌟' : score >= 60 ? '✅' : '📊'
    await this.show({
      title: `${emoji} AI Analysis Complete`,
      body: `${candidateName} scored ${score}/100`,
      tag: `analysis-complete-${Date.now()}`,
      data: {
        type: 'analysis-complete',
        url: `/jobs/${jobId}`,
      },
    })
  }

  // Show notification for status change
  async notifyStatusChange(candidateName: string, newStatus: string, jobId: string): Promise<void> {
    await this.show({
      title: '🔄 Candidate Status Updated',
      body: `${candidateName} → ${newStatus}`,
      tag: `status-change-${Date.now()}`,
      data: {
        type: 'status-change',
        url: `/jobs/${jobId}`,
      },
    })
  }
}

export const notificationService = NotificationService.getInstance()

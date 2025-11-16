type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  userId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(entry: LogEntry): string {
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message} ${
      entry.context ? JSON.stringify(entry.context) : ''
    }`
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    if (this.isDevelopment) {
      // Console logging for development
      const formatted = this.formatLog(entry)
      switch (level) {
        case 'error':
          console.error(formatted)
          break
        case 'warn':
          console.warn(formatted)
          break
        case 'debug':
          console.debug(formatted)
          break
        default:
          console.log(formatted)
      }
    } else {
      // In production, send to logging service (e.g., Sentry, LogRocket)
      // Example: Sentry.captureMessage(message, { level, extra: context })
      // For now, we'll still console.log in production but in a production app
      // you would replace this with actual logging service integration
      console.log(JSON.stringify(entry))
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context)
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context)
  }
}

export const logger = new Logger()

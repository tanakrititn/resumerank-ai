import { env } from './env'

export const config = {
  app: {
    name: 'ResumeRank AI',
    url: env.NEXT_PUBLIC_APP_URL,
    environment: env.NODE_ENV,
  },

  features: {
    enableRealtime: true,
    enableAIAnalysis: true,
    enableAdminPanel: true,
  },

  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFilesPerUpload: 1,
    aiCreditsPerMonth: 100,
    maxJobsPerUser: env.NODE_ENV === 'production' ? 50 : 1000,
    maxCandidatesPerJob: env.NODE_ENV === 'production' ? 1000 : 10000,
  },

  rateLimit: {
    api: {
      requests: 10,
      window: '1m' as const,
    },
    upload: {
      requests: 5,
      window: '1m' as const,
    },
    ai: {
      requests: 3,
      window: '1m' as const,
    },
  },

  cache: {
    ttl: {
      short: 60, // 1 minute
      medium: 300, // 5 minutes
      long: 3600, // 1 hour
    },
  },
} as const

export type AppConfig = typeof config

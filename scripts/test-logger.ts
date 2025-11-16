/**
 * Test script for logging utility
 *
 * Run with: npx tsx scripts/test-logger.ts
 */

import { logger } from '../src/lib/logger'

console.log('Testing Logger Utility\n')
console.log('='.repeat(50))

// Test Info Logging
console.log('\n1. Testing INFO level:')
logger.info('Application started successfully', {
  environment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString(),
})

// Test Warn Logging
console.log('\n2. Testing WARN level:')
logger.warn('API rate limit approaching threshold', {
  currentRequests: 45,
  limit: 50,
  userId: 'user_123',
})

// Test Error Logging
console.log('\n3. Testing ERROR level:')
logger.error('Database connection failed', {
  error: 'Connection timeout',
  host: 'localhost',
  port: 5432,
  retryAttempt: 3,
})

// Test Debug Logging
console.log('\n4. Testing DEBUG level:')
logger.debug('Cache hit for user profile', {
  userId: 'user_123',
  cacheKey: 'profile:user_123',
  ttl: 3600,
})

// Test with user context
console.log('\n5. Testing with user context:')
logger.info('Job created successfully', {
  jobId: 'job_abc123',
  userId: 'user_456',
  jobTitle: 'Senior Software Engineer',
})

logger.info('Candidate analyzed', {
  candidateId: 'candidate_xyz',
  jobId: 'job_abc123',
  userId: 'user_456',
  score: 85,
})

logger.error('AI analysis failed', {
  error: 'API timeout',
  candidateId: 'candidate_xyz',
  userId: 'user_456',
  isTemporary: true,
})

console.log('\n' + '='.repeat(50))
console.log('\nAll logger tests completed!')
console.log('\nNote: In development, logs appear in console.')
console.log('In production, logs should be sent to a logging service (e.g., Sentry).')

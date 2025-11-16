/**
 * Strip all HTML tags to prevent XSS attacks
 * Using regex-based approach to avoid jsdom dependency issues on Vercel
 */
export function sanitizeHtml(dirty: string): string {
  // Strip all HTML tags
  let clean = dirty.replace(/<[^>]*>/g, '')

  // Decode HTML entities
  clean = clean
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')

  // Remove any remaining script-like content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  return clean.trim()
}

/**
 * Sanitize user input for display (allows basic formatting)
 */
export function sanitizeUserInput(dirty: string): string {
  // Strip all HTML except allowed tags
  let clean = dirty.replace(/<(?!\/?(?:b|i|em|strong|u|br|p)\b)[^>]*>/gi, '')

  // Remove any script content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')

  return clean.trim()
}

/**
 * Escape special characters for SQL LIKE queries
 */
export function escapeLikeQuery(query: string): string {
  return query.replace(/[%_\\]/g, '\\$&')
}

/**
 * Validate and sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  const name = fileName.replace(/^.*[\\\/]/, '')

  // Replace unsafe characters
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

/**
 * Validate email format (stricter than basic regex)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Remove null bytes and control characters
 */
export function removeControlCharacters(input: string): string {
  return input.replace(/[\x00-\x1F\x7F]/g, '')
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObjectKeys<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T

  for (const key in obj) {
    // Skip dangerous keys
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }

    sanitized[key] = obj[key]
  }

  return sanitized
}

/**
 * Validate phone number format (international)
 */
export function isValidPhone(phone: string): boolean {
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')

  // Check if it's a valid international format
  const phoneRegex = /^\+?[1-9]\d{6,14}$/
  return phoneRegex.test(cleaned)
}

/**
 * Sanitize search query to prevent injection
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove control characters
  let sanitized = removeControlCharacters(query)

  // Strip HTML tags
  sanitized = sanitizeHtml(sanitized)

  // Trim and limit length
  return sanitized.trim().slice(0, 500)
}

/**
 * Validate and sanitize JSON input
 */
export function sanitizeJsonInput(input: string): string | null {
  try {
    // Parse to validate
    const parsed = JSON.parse(input)

    // Sanitize object keys
    const sanitized = sanitizeObjectKeys(parsed)

    // Return stringified version
    return JSON.stringify(sanitized)
  } catch {
    return null
  }
}

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Sanitize SQL identifier (table/column names)
 */
export function sanitizeSqlIdentifier(identifier: string): string {
  // Only allow alphanumeric and underscores
  return identifier.replace(/[^a-zA-Z0-9_]/g, '')
}

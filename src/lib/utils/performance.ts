import React from 'react'

/**
 * Debounce function to limit function calls
 * Useful for search inputs, window resize handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit function execution rate
 * Useful for scroll handlers, mousemove handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Lazy load component
 * Improves initial bundle size by code splitting
 *
 * Usage:
 * const LazyComponent = lazyLoad(() => import('./Component'))
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): React.ComponentType<React.ComponentPropsWithoutRef<T>> {
  const LazyComponent = React.lazy(importFunc)

  const LazyWrapper: React.ComponentType<React.ComponentPropsWithoutRef<T>> = (props) => {
    return React.createElement(
      React.Suspense,
      { fallback: fallback || React.createElement('div', null, 'Loading...') },
      React.createElement(LazyComponent, props as any)
    )
  }

  return LazyWrapper
}

/**
 * Measure component render time (development only)
 */
export function measurePerformance(componentName: string) {
  if (process.env.NODE_ENV !== 'development') return

  return {
    start: () => {
      performance.mark(`${componentName}-start`)
    },
    end: () => {
      performance.mark(`${componentName}-end`)
      performance.measure(
        `${componentName}`,
        `${componentName}-start`,
        `${componentName}-end`
      )
      const measure = performance.getEntriesByName(`${componentName}`)[0]
      console.log(`⏱️ ${componentName} rendered in ${measure.duration.toFixed(2)}ms`)
    },
  }
}

/**
 * Cache function results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>()

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }
}

/**
 * Batch multiple state updates
 */
export function batchUpdates<T>(
  updates: Array<() => void>,
  callback?: () => void
) {
  React.startTransition(() => {
    updates.forEach((update) => update())
    callback?.()
  })
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [ref, options])

  return isIntersecting
}

/**
 * Preload image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Batch image preloading
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(preloadImage))
}

/**
 * Virtual scrolling helper
 * Calculate visible items in a list
 */
export function calculateVisibleItems(
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  overscan: number = 3
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const endIndex = startIndex + visibleCount + overscan * 2

  return { startIndex, endIndex, visibleCount }
}

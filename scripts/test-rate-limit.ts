/**
 * Test script to verify rate limiting is working
 * Run with: npx tsx scripts/test-rate-limit.ts
 */

async function testRateLimit() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const testEndpoint = `${baseUrl}/api/test-gemini`

  console.log('🧪 Testing Rate Limiting...')
  console.log(`Target: ${testEndpoint}`)
  console.log('Making 12 rapid requests (limit is 10/minute)...\n')

  const results: { status: number; headers: Record<string, string> }[] = []

  for (let i = 1; i <= 12; i++) {
    try {
      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers: {
          'x-forwarded-for': '127.0.0.1', // Simulate IP
        },
      })

      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        if (key.toLowerCase().includes('ratelimit') || key.toLowerCase().includes('retry')) {
          headers[key] = value
        }
      })

      results.push({
        status: response.status,
        headers,
      })

      const status = response.status === 429 ? '❌ Rate Limited' : '✅ Success'
      console.log(`Request ${i.toString().padStart(2)}: ${status} (${response.status})`)

      if (headers['x-ratelimit-remaining']) {
        console.log(`   Remaining: ${headers['x-ratelimit-remaining']} / ${headers['x-ratelimit-limit']}`)
      }

      if (response.status === 429 && headers['retry-after']) {
        console.log(`   Retry After: ${headers['retry-after']} seconds`)
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Request ${i}: Error -`, error)
    }
  }

  console.log('\n📊 Summary:')
  const successCount = results.filter((r) => r.status === 200).length
  const rateLimitedCount = results.filter((r) => r.status === 429).length

  console.log(`✅ Successful requests: ${successCount}`)
  console.log(`❌ Rate limited requests: ${rateLimitedCount}`)

  if (rateLimitedCount > 0) {
    console.log('\n✅ Rate limiting is working correctly!')
  } else {
    console.log('\n⚠️  No rate limiting detected. Make sure the server is running and rate limiting is enabled.')
  }
}

testRateLimit()

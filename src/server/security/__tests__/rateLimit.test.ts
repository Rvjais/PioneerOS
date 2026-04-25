import { checkRateLimitSync } from '../rateLimit'

// ============================================
// checkRateLimitSync — basic functionality
// ============================================
describe('checkRateLimitSync', () => {
  it('should allow the first request', () => {
    const id = `test-basic-${Date.now()}`
    const result = checkRateLimitSync(id, { maxRequests: 5, windowMs: 60_000 })

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.retryAfter).toBeUndefined()
  })

  it('should decrement remaining count with each request', () => {
    const id = `test-decrement-${Date.now()}`
    const config = { maxRequests: 5, windowMs: 60_000 }

    const r1 = checkRateLimitSync(id, config)
    expect(r1.remaining).toBe(4)

    const r2 = checkRateLimitSync(id, config)
    expect(r2.remaining).toBe(3)

    const r3 = checkRateLimitSync(id, config)
    expect(r3.remaining).toBe(2)
  })

  // ============================================
  // Blocking after max requests
  // ============================================
  it('should block after max requests are exhausted', () => {
    const id = `test-block-${Date.now()}`
    const config = { maxRequests: 3, windowMs: 60_000 }

    // Use all 3 allowed requests
    checkRateLimitSync(id, config)
    checkRateLimitSync(id, config)
    checkRateLimitSync(id, config)

    // 4th request should be blocked
    const blocked = checkRateLimitSync(id, config)
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })

  // ============================================
  // Reset after window expires
  // ============================================
  it('should reset after the time window expires', () => {
    const id = `test-reset-${Date.now()}`
    // Use a very short window (1 ms) so it expires immediately
    const config = { maxRequests: 1, windowMs: 1 }

    const first = checkRateLimitSync(id, config)
    expect(first.success).toBe(true)

    // The 1ms window should have expired by now (or will after a trivial delay)
    // We add a tiny busy-wait to ensure at least 1ms has passed
    const start = Date.now()
    while (Date.now() - start < 2) {
      // busy-wait
    }

    const afterReset = checkRateLimitSync(id, config)
    expect(afterReset.success).toBe(true)
    expect(afterReset.remaining).toBe(0) // maxRequests(1) - 1 = 0
  })

  it('should use different buckets for different identifiers', () => {
    const idA = `test-bucket-a-${Date.now()}`
    const idB = `test-bucket-b-${Date.now()}`
    const config = { maxRequests: 1, windowMs: 60_000 }

    checkRateLimitSync(idA, config)
    // idA is exhausted, but idB should still be available
    const resultB = checkRateLimitSync(idB, config)
    expect(resultB.success).toBe(true)
  })
})

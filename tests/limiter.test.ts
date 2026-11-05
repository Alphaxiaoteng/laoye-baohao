import { describe, expect, it } from 'vitest'
import { createLimiter, createRateLimiter } from '../server/ask'

describe('并发队列', () => {
  it('并发 2，第三个排队，释放后自动补位', async () => {
    const limiter = createLimiter({ concurrency: 2, maxQueue: 2 })
    const r1 = await limiter.acquire()
    const r2 = await limiter.acquire()
    expect(r1).not.toBeNull()
    expect(r2).not.toBeNull()
    expect(limiter.stats()).toEqual({ running: 2, queued: 0 })

    let thirdRelease: (() => void) | null = null
    const third = limiter.acquire().then((release) => {
      thirdRelease = release
      return release
    })
    await Promise.resolve()
    expect(limiter.stats()).toEqual({ running: 2, queued: 1 })

    r1!()
    expect(limiter.stats().running).toBe(2)
    const release3 = await third
    expect(typeof thirdRelease).toBe('function')
    expect(release3).not.toBeNull()

    release3!()
    r2!()
    expect(limiter.stats().running).toBe(0)
  })

  it('排队超过上限时返回 null（路由据此回 503）', async () => {
    const limiter = createLimiter({ concurrency: 1, maxQueue: 1 })
    const held = await limiter.acquire()
    const queued = limiter.acquire()
    const rejected = await limiter.acquire()
    expect(rejected).toBeNull()
    held!()
    const promoted = await queued
    expect(promoted).not.toBeNull()
    promoted!()
  })

  it('release 幂等', async () => {
    const limiter = createLimiter({ concurrency: 1, maxQueue: 0 })
    const release = await limiter.acquire()
    release!()
    release!()
    expect(limiter.stats().running).toBe(0)
  })
})

describe('按 IP 限流', () => {
  it('每分钟 6 次，第 7 次拒绝，窗口过后恢复', () => {
    let now = 1_000_000
    const limiter = createRateLimiter({ limit: 6, windowMs: 60_000, now: () => now })

    for (let i = 0; i < 6; i += 1) {
      expect(limiter.check('1.1.1.1')).toBe(true)
    }
    expect(limiter.check('1.1.1.1')).toBe(false)
    expect(limiter.check('2.2.2.2')).toBe(true)

    now += 60_001
    expect(limiter.check('1.1.1.1')).toBe(true)
  })
})

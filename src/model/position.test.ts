import { describe, expect, it } from 'vitest'
import {
  POSITION_GAP,
  after,
  before,
  between,
  needsRebalance,
  rebalance,
} from './position'

describe('position helpers', () => {
  it('after appends by the default gap', () => {
    expect(after(null)).toBe(POSITION_GAP)
    expect(after(100)).toBe(100 + POSITION_GAP)
  })

  it('before places an item ahead of the neighbour', () => {
    expect(before(null)).toBe(POSITION_GAP)
    expect(before(100)).toBe(50)
  })

  it('between returns the midpoint', () => {
    expect(between(0, 10)).toBe(5)
    expect(between(null, 10)).toBe(5)
    expect(between(10, null)).toBe(10 + POSITION_GAP)
    expect(between(null, null)).toBe(POSITION_GAP)
  })

  it('between rejects inverted bounds', () => {
    expect(() => between(10, 5)).toThrow(/a < b/)
  })

  it('needsRebalance detects tight gaps', () => {
    expect(needsRebalance(1, 1 + 1e-9)).toBe(true)
    expect(needsRebalance(1, 2)).toBe(false)
    expect(needsRebalance(null, 2)).toBe(false)
  })

  it('rebalance spaces siblings evenly without mutating input', () => {
    const siblings = [
      { id: 'a', position: 0.000001 },
      { id: 'b', position: 0.000002 },
      { id: 'c', position: 0.000003 },
    ]
    const next = rebalance(siblings)
    expect(next).toEqual([
      { id: 'a', position: POSITION_GAP },
      { id: 'b', position: POSITION_GAP * 2 },
      { id: 'c', position: POSITION_GAP * 3 },
    ])
    expect(siblings[0]?.position).toBe(0.000001)
  })

  it('supports a chain of mid-inserts without colliding', () => {
    let left = 0
    let right = POSITION_GAP
    const seen = new Set<number>()

    for (let i = 0; i < 20; i += 1) {
      const mid = between(left, right)
      expect(seen.has(mid)).toBe(false)
      expect(mid).toBeGreaterThan(left)
      expect(mid).toBeLessThan(right)
      seen.add(mid)
      right = mid
    }
  })
})

import { describe, expect, it } from 'vitest'
import {
  LIST_PAGE_SIZE,
  hasMore,
  nextVisibleCount,
  pageSlice,
} from './list-pagination'

describe('list pagination', () => {
  it('slices by visible offset count', () => {
    const items = [1, 2, 3, 4, 5]
    expect(pageSlice(items, 3)).toEqual([1, 2, 3])
    expect(pageSlice(items, 10)).toEqual(items)
  })

  it('advances visible count by page size until total', () => {
    expect(nextVisibleCount(10, 55)).toBe(20)
    expect(nextVisibleCount(50, 55)).toBe(55)
    expect(nextVisibleCount(0, 10, LIST_PAGE_SIZE)).toBe(10)
  })

  it('reports remaining pages', () => {
    expect(hasMore(10, 25)).toBe(true)
    expect(hasMore(25, 25)).toBe(false)
  })
})

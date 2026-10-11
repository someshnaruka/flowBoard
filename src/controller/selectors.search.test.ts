import { describe, expect, it } from 'vitest'
import { createSeed } from '@/model/seed'
import {
  selectTasksForListQuery,
  taskMatchesQuery,
} from './selectors'

describe('list search selectors', () => {
  it('matches title and description case-insensitively', () => {
    const state = createSeed()
    const task = state.tasks['task-backlog-1']
    expect(task).toBeDefined()
    if (!task) {
      return
    }

    expect(taskMatchesQuery(task, task.title.slice(0, 4))).toBe(true)
    expect(taskMatchesQuery(task, 'zzzz-no-match')).toBe(false)

    const withDescription = {
      ...task,
      description: 'UniqueNeedle in the haystack',
    }
    expect(taskMatchesQuery(withDescription, 'uniqueneedle')).toBe(true)
  })

  it('filters the selected list by query', () => {
    const state = createSeed()
    const all = selectTasksForListQuery(state, 'list-backlog', '')
    expect(all.length).toBeGreaterThan(0)

    const needle = all[0]!.title.slice(0, 5)
    const filtered = selectTasksForListQuery(state, 'list-backlog', needle)
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((task) => taskMatchesQuery(task, needle))).toBe(true)
  })
})

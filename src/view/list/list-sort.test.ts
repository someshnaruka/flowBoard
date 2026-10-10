import { describe, expect, it } from 'vitest'
import type { Task } from '@/model/types'
import { compareTasks, sortTasks } from './list-sort'

function task(partial: Partial<Task> & Pick<Task, 'id' | 'priority'>): Task {
  return {
    listId: 'list-backlog',
    title: partial.id,
    description: '',
    statusId: 'status-backlog-todo',
    assigneeIds: [],
    dueDate: null,
    position: 0,
    parentTaskId: null,
    archivedAt: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...partial,
  }
}

describe('list-sort', () => {
  it('sorts priority descending with urgent first', () => {
    const tasks = [
      task({ id: 'a', priority: 'low', position: 1 }),
      task({ id: 'b', priority: 'urgent', position: 2 }),
      task({ id: 'c', priority: 'normal', position: 3 }),
    ]
    const sorted = sortTasks(tasks, 'priority', 'desc')
    expect(sorted.map((item) => item.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts due date ascending and keeps nulls last', () => {
    const tasks = [
      task({ id: 'a', priority: 'none', dueDate: '2026-10-20', position: 1 }),
      task({ id: 'b', priority: 'none', dueDate: null, position: 2 }),
      task({ id: 'c', priority: 'none', dueDate: '2026-10-05', position: 3 }),
    ]
    const sorted = sortTasks(tasks, 'dueDate', 'asc')
    expect(sorted.map((item) => item.id)).toEqual(['c', 'a', 'b'])
  })

  it('compares both directions for due date', () => {
    const earlier = task({
      id: 'earlier',
      priority: 'none',
      dueDate: '2026-10-01',
      position: 1,
    })
    const later = task({
      id: 'later',
      priority: 'none',
      dueDate: '2026-10-10',
      position: 2,
    })
    expect(compareTasks(earlier, later, 'dueDate', 'asc')).toBeLessThan(0)
    expect(compareTasks(earlier, later, 'dueDate', 'desc')).toBeGreaterThan(0)
  })
})

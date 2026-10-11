import { describe, expect, it } from 'vitest'
import { createSeed } from './seed'

describe('createSeed', () => {
  it('returns a valid AppState shape with expected counts', () => {
    const seed = createSeed()

    expect(Object.keys(seed.users)).toHaveLength(3)
    expect(seed.users['user-alice']?.role).toBe('admin')
    expect(seed.currentUserId).toBe('user-alice')

    const kinds = Object.values(seed.nodes).reduce(
      (acc, node) => {
        acc[node.kind] = (acc[node.kind] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    expect(kinds.workspace).toBe(1)
    expect(kinds.space).toBe(2)
    expect(kinds.folder).toBe(2)
    expect(kinds.list).toBe(3)

    expect(Object.keys(seed.tasks).length).toBeGreaterThanOrEqual(18)
    expect(Object.keys(seed.grants)).toHaveLength(4)
  })

  it('mixes priorities, assignees and overdue dates', () => {
    const seed = createSeed()
    const tasks = Object.values(seed.tasks)

    const priorities = new Set(tasks.map((task) => task.priority))
    expect(priorities.size).toBeGreaterThanOrEqual(4)

    expect(tasks.some((task) => task.assigneeIds.length > 0)).toBe(true)
    expect(tasks.some((task) => task.assigneeIds.length === 0)).toBe(true)

    const overdue = tasks.filter(
      (task) => task.dueDate != null && task.dueDate < '2026-10-10',
    )
    expect(overdue.length).toBeGreaterThan(0)
  })

  it('wires Bob and Carol grants for the Alice vs Bob demo', () => {
    const seed = createSeed()
    const grants = Object.values(seed.grants)

    expect(
      grants.some(
        (grant) =>
          grant.userId === 'user-bob' &&
          grant.nodeId === 'space-leadership' &&
          grant.effect === 'deny',
      ),
    ).toBe(true)
    expect(
      grants.some(
        (grant) =>
          grant.userId === 'user-bob' &&
          grant.nodeId === 'list-sprint' &&
          grant.effect === 'deny',
      ),
    ).toBe(true)
    expect(
      grants.some(
        (grant) =>
          grant.userId === 'user-carol' &&
          grant.nodeId === 'space-leadership' &&
          grant.effect === 'allow',
      ),
    ).toBe(true)
    expect(
      grants.some(
        (grant) =>
          grant.userId === 'user-carol' &&
          grant.nodeId === 'list-backlog' &&
          grant.effect === 'view',
      ),
    ).toBe(true)
  })

  it('keeps every task status on its list', () => {
    const seed = createSeed()
    for (const task of Object.values(seed.tasks)) {
      const status = seed.statuses[task.statusId]
      expect(status).toBeDefined()
      expect(status?.listId).toBe(task.listId)
    }
  })
})

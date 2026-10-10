import { describe, expect, it } from 'vitest'
import { isErr, isOk } from '@/model/errors'
import { createSeed } from '@/model/seed'
import type { VisibleTreeNode } from '@/model/services/permission.service'
import { selectVisibleTree } from './selectors'
import { createFlowStore } from './store'

function collectTreeIds(nodes: VisibleTreeNode[]): string[] {
  return nodes.flatMap((node) => [node.id, ...collectTreeIds(node.children)])
}

describe('flow store', () => {
  it('blocks Bob from creating on a denied list', async () => {
    const store = createFlowStore(createSeed())
    store.getState().switchUser('user-bob')

    const result = await store.getState().createTask({
      listId: 'list-sprint',
      title: 'Should fail',
      statusId: 'status-sprint-todo',
    })

    expect(isErr(result)).toBe(true)
    if (isErr(result)) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(store.getState().tasks['task-should-not-exist']).toBeUndefined()
  })

  it('changes visible tree when switching users', () => {
    const store = createFlowStore(createSeed())

    const aliceIds = collectTreeIds(selectVisibleTree(store.getState()))
    expect(aliceIds).toContain('list-sprint')
    expect(aliceIds).toContain('list-okrs')

    store.getState().openDrawer('task-sprint-1')
    store.getState().setSelectedListId('list-sprint')
    store.getState().switchUser('user-bob')

    const bobState = store.getState()
    expect(bobState.currentUserId).toBe('user-bob')
    expect(bobState.drawerTaskId).toBeNull()
    expect(bobState.selectedListId).not.toBe('list-sprint')

    const bobIds = collectTreeIds(selectVisibleTree(bobState))
    expect(bobIds).toContain('list-backlog')
    expect(bobIds).not.toContain('list-sprint')
    expect(bobIds).not.toContain('space-leadership')
  })

  it('surfaces NETWORK_ERROR when failNext is set', async () => {
    const store = createFlowStore(createSeed())
    store.getState().setFailNext(true)

    const beforeCount = Object.keys(store.getState().tasks).length
    const result = await store.getState().createTask({
      listId: 'list-backlog',
      title: 'Network fail',
      statusId: 'status-backlog-todo',
    })

    expect(isErr(result)).toBe(true)
    if (isErr(result)) {
      expect(result.error.code).toBe('NETWORK_ERROR')
    }
    expect(Object.keys(store.getState().tasks)).toHaveLength(beforeCount)
    expect(store.getState().network.failNext).toBe(false)
  })

  it('creates a task when permitted', async () => {
    const store = createFlowStore(createSeed())
    const result = await store.getState().createTask({
      listId: 'list-backlog',
      title: 'Store task',
      statusId: 'status-backlog-todo',
    })

    expect(isOk(result)).toBe(true)
    if (isOk(result)) {
      expect(store.getState().tasks[result.data.id]?.title).toBe('Store task')
    }
  })
})

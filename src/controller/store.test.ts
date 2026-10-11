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

  it('places a task into another status with neighbors', async () => {
    const store = createFlowStore(createSeed())
    const before = store.getState().tasks['task-backlog-1']
    expect(before?.statusId).toBe('status-backlog-todo')

    const result = await store.getState().placeTask({
      taskId: 'task-backlog-1',
      statusId: 'status-backlog-active',
      afterId: 'task-backlog-3',
      beforeId: null,
    })

    expect(isOk(result)).toBe(true)
    const placed = store.getState().tasks['task-backlog-1']
    expect(placed?.statusId).toBe('status-backlog-active')
    expect(placed?.position).toBeGreaterThan(
      store.getState().tasks['task-backlog-3']!.position,
    )
  })

  it('blocks Bob from placing on a denied list', async () => {
    const store = createFlowStore(createSeed())
    store.getState().switchUser('user-bob')

    const result = await store.getState().placeTask({
      taskId: 'task-sprint-1',
      statusId: 'status-sprint-done',
      afterId: null,
      beforeId: null,
    })

    expect(isErr(result)).toBe(true)
    if (isErr(result)) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('rolls back optimistic placeTask on network failure and shakes', async () => {
    const store = createFlowStore(createSeed())
    const before = store.getState().tasks['task-backlog-1']!
    expect(before.statusId).toBe('status-backlog-todo')

    store.getState().setFailNext(true)
    store.getState().setNetworkConfig({ latencyMs: 0 })

    const placePromise = store.getState().placeTask({
      taskId: 'task-backlog-1',
      statusId: 'status-backlog-active',
      afterId: null,
      beforeId: null,
    })

    // Optimistic apply happens before the simulated network settles.
    expect(store.getState().tasks['task-backlog-1']?.statusId).toBe(
      'status-backlog-active',
    )

    const result = await placePromise
    expect(isErr(result)).toBe(true)
    if (isErr(result)) {
      expect(result.error.code).toBe('NETWORK_ERROR')
    }

    const after = store.getState().tasks['task-backlog-1']!
    expect(after.statusId).toBe(before.statusId)
    expect(after.position).toBe(before.position)
    expect(store.getState().shakeTaskId).toBe('task-backlog-1')
  })

  it('rolls back optimistic status update on network failure', async () => {
    const store = createFlowStore(createSeed())
    store.getState().setFailNext(true)
    store.getState().setNetworkConfig({ latencyMs: 0 })

    const updatePromise = store.getState().updateTask({
      taskId: 'task-backlog-1',
      statusId: 'status-backlog-done',
    })

    expect(store.getState().tasks['task-backlog-1']?.statusId).toBe(
      'status-backlog-done',
    )

    const result = await updatePromise
    expect(isErr(result)).toBe(true)
    expect(store.getState().tasks['task-backlog-1']?.statusId).toBe(
      'status-backlog-todo',
    )
    expect(store.getState().shakeTaskId).toBe('task-backlog-1')
  })

  it('updates task fields when permitted', async () => {
    const store = createFlowStore(createSeed())
    const result = await store.getState().updateTask({
      taskId: 'task-backlog-1',
      title: 'Renamed in drawer',
      priority: 'urgent',
      statusId: 'status-backlog-active',
    })

    expect(isOk(result)).toBe(true)
    const task = store.getState().tasks['task-backlog-1']
    expect(task?.title).toBe('Renamed in drawer')
    expect(task?.priority).toBe('urgent')
    expect(task?.statusId).toBe('status-backlog-active')
  })

  it('creates a list with default statuses and archives with restore', async () => {
    const store = createFlowStore(createSeed())
    const created = await store.getState().createContainer({
      kind: 'list',
      name: 'New backlog list',
      parentId: 'folder-platform',
    })
    expect(isOk(created)).toBe(true)
    if (!isOk(created)) {
      return
    }

    const statuses = Object.values(store.getState().statuses).filter(
      (status) => status.listId === created.data.id,
    )
    expect(statuses).toHaveLength(3)

    const archived = await store.getState().archiveContainer(created.data.id)
    expect(isOk(archived)).toBe(true)
    expect(store.getState().nodes[created.data.id]?.archivedAt).not.toBeNull()

    const restored = await store.getState().restoreContainer(created.data.id)
    expect(isOk(restored)).toBe(true)
    expect(store.getState().nodes[created.data.id]?.archivedAt).toBeNull()
  })

  it('duplicates and deletes a task', async () => {
    const store = createFlowStore(createSeed())
    const duplicated = await store.getState().duplicateTask('task-backlog-2')
    expect(isOk(duplicated)).toBe(true)
    if (!isOk(duplicated)) {
      return
    }
    expect(duplicated.data.title).toContain('(copy)')

    store.getState().openDrawer(duplicated.data.id)
    const deleted = await store.getState().deleteTask(duplicated.data.id)
    expect(isOk(deleted)).toBe(true)
    expect(store.getState().tasks[duplicated.data.id]).toBeUndefined()
    expect(store.getState().drawerTaskId).toBeNull()
  })

  it('archives and restores a task', async () => {
    const store = createFlowStore(createSeed())
    store.getState().openDrawer('task-backlog-1')

    const archived = await store.getState().archiveTask('task-backlog-1')
    expect(isOk(archived)).toBe(true)
    expect(store.getState().tasks['task-backlog-1']?.archivedAt).not.toBeNull()
    expect(store.getState().drawerTaskId).toBeNull()

    const restored = await store.getState().restoreTask('task-backlog-1')
    expect(isOk(restored)).toBe(true)
    expect(store.getState().tasks['task-backlog-1']?.archivedAt).toBeNull()
  })

  it('createDefaultTask uses the selected list', async () => {
    const store = createFlowStore(createSeed())
    store.getState().setSelectedListId('list-backlog')
    const result = await store.getState().createDefaultTask()
    expect(isOk(result)).toBe(true)
    if (isOk(result)) {
      expect(result.data.listId).toBe('list-backlog')
      expect(result.data.title).toBe('New task')
    }
  })
})

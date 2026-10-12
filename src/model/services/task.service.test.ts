import { describe, expect, it } from 'vitest'
import { isErr, isOk } from '../errors'
import { createSeed } from '../seed'
import {
  archiveTask,
  changeStatus,
  createTask,
  deleteTask,
  moveTaskToList,
  reorderTask,
  restoreTask,
  updateTask,
} from './task.service'
import { addStatus, deleteStatus, renameStatus } from './status.service'

describe('task service', () => {
  it('creates, updates and deletes tasks with validation', () => {
    const state = createSeed()

    const badTitle = createTask(state, 'user-alice', {
      listId: 'list-backlog',
      title: '   ',
      statusId: 'status-backlog-todo',
    })
    expect(isErr(badTitle)).toBe(true)

    const wrongStatus = createTask(state, 'user-alice', {
      listId: 'list-backlog',
      title: 'Cross list status',
      statusId: 'status-sprint-todo',
    })
    expect(isErr(wrongStatus)).toBe(true)
    if (isErr(wrongStatus)) {
      expect(wrongStatus.error.code).toBe('INVALID_STATUS')
    }

    const created = createTask(state, 'user-alice', {
      listId: 'list-backlog',
      title: ' New task ',
      statusId: 'status-backlog-todo',
      priority: 'high',
      assigneeIds: ['user-bob'],
    })
    expect(isOk(created)).toBe(true)
    if (!isOk(created)) {
      return
    }
    expect(created.data.task.title).toBe('New task')

    const updated = updateTask(created.data.state, 'user-alice', {
      taskId: created.data.task.id,
      title: 'Renamed task',
      priority: 'urgent',
    })
    expect(isOk(updated)).toBe(true)

    const deleted = deleteTask(created.data.state, 'user-alice', {
      taskId: created.data.task.id,
    })
    expect(isOk(deleted)).toBe(true)
    if (isOk(deleted)) {
      expect(deleted.data.state.tasks[created.data.task.id]).toBeUndefined()
    }
  })

  it('rejects depth-2 subtasks', () => {
    const state = createSeed()
    const parent = createTask(state, 'user-alice', {
      listId: 'list-backlog',
      title: 'Parent',
      statusId: 'status-backlog-todo',
    })
    expect(isOk(parent)).toBe(true)
    if (!isOk(parent)) {
      return
    }

    const child = createTask(parent.data.state, 'user-alice', {
      listId: 'list-backlog',
      title: 'Child',
      statusId: 'status-backlog-todo',
      parentTaskId: parent.data.task.id,
    })
    expect(isOk(child)).toBe(true)
    if (!isOk(child)) {
      return
    }

    const grandchild = createTask(child.data.state, 'user-alice', {
      listId: 'list-backlog',
      title: 'Grandchild',
      statusId: 'status-backlog-todo',
      parentTaskId: child.data.task.id,
    })
    expect(isErr(grandchild)).toBe(true)
  })

  it('changes status, reorders, and remaps on list move', () => {
    const state = createSeed()
    const changed = changeStatus(state, 'user-alice', {
      taskId: 'task-backlog-1',
      statusId: 'status-backlog-done',
    })
    expect(isOk(changed)).toBe(true)

    const reordered = reorderTask(state, 'user-alice', {
      taskId: 'task-backlog-2',
      beforeId: 'task-backlog-1',
    })
    expect(isOk(reordered)).toBe(true)
    if (isOk(reordered)) {
      const first = reordered.data.state.tasks['task-backlog-2']
      const second = reordered.data.state.tasks['task-backlog-1']
      expect((first?.position ?? 0) < (second?.position ?? 0)).toBe(true)
    }

    // Active backlog task should map to active sprint status
    const moved = moveTaskToList(state, 'user-alice', {
      taskId: 'task-backlog-3',
      targetListId: 'list-sprint',
    })
    expect(isOk(moved)).toBe(true)
    if (isOk(moved)) {
      expect(moved.data.task.listId).toBe('list-sprint')
      expect(moved.data.task.statusId).toBe('status-sprint-active')
    }
  })
})

describe('status service', () => {
  it('adds and renames statuses', () => {
    const state = createSeed()
    const added = addStatus(state, 'user-alice', {
      listId: 'list-backlog',
      name: 'Blocked',
      category: 'in_progress',
    })
    expect(isOk(added)).toBe(true)
    if (!isOk(added)) {
      return
    }

    const renamed = renameStatus(added.data.state, 'user-alice', {
      statusId: added.data.status.id,
      name: 'Waiting',
    })
    expect(isOk(renamed)).toBe(true)
  })

  it('archives and restores a task with subtasks', () => {
    const state = createSeed()
    const parent = createTask(state, 'user-alice', {
      listId: 'list-backlog',
      title: 'Parent',
      statusId: 'status-backlog-todo',
    })
    expect(isOk(parent)).toBe(true)
    if (!isOk(parent)) {
      return
    }

    const child = createTask(parent.data.state, 'user-alice', {
      listId: 'list-backlog',
      title: 'Child',
      statusId: 'status-backlog-todo',
      parentTaskId: parent.data.task.id,
    })
    expect(isOk(child)).toBe(true)
    if (!isOk(child)) {
      return
    }

    const archived = archiveTask(child.data.state, 'user-alice', {
      taskId: parent.data.task.id,
    })
    expect(isOk(archived)).toBe(true)
    if (!isOk(archived)) {
      return
    }
    expect(
      archived.data.state.tasks[parent.data.task.id]?.archivedAt,
    ).not.toBeNull()
    expect(
      archived.data.state.tasks[child.data.task.id]?.archivedAt,
    ).not.toBeNull()

    const restored = restoreTask(archived.data.state, 'user-alice', {
      taskId: parent.data.task.id,
    })
    expect(isOk(restored)).toBe(true)
    if (!isOk(restored)) {
      return
    }
    expect(
      restored.data.state.tasks[parent.data.task.id]?.archivedAt,
    ).toBeNull()
    expect(restored.data.state.tasks[child.data.task.id]?.archivedAt).toBeNull()
  })

  it('blocks deleting a status that is in use', () => {
    const state = createSeed()
    const result = deleteStatus(state, 'user-alice', {
      statusId: 'status-backlog-todo',
    })
    expect(isErr(result)).toBe(true)
    if (isErr(result)) {
      expect(result.error.code).toBe('CONFLICT')
    }
  })

  it('deletes an unused status', () => {
    const state = createSeed()
    const added = addStatus(state, 'user-alice', {
      listId: 'list-backlog',
      name: 'Parked',
      category: 'todo',
    })
    expect(isOk(added)).toBe(true)
    if (!isOk(added)) {
      return
    }

    const deleted = deleteStatus(added.data.state, 'user-alice', {
      statusId: added.data.status.id,
    })
    expect(isOk(deleted)).toBe(true)
  })
})

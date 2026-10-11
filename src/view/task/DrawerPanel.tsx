import { useEffect, useMemo, useState } from 'react'
import {
  selectBreadcrumb,
  selectCanEditTask,
  selectEditableLists,
  selectStatusesForList,
  selectSubtasks,
  selectTaskById,
} from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { Priority } from '@/model/types'
import { notifyMutationError, toastSuccess } from '@/view/feedback/toasts'
import { DrawerActivity } from './DrawerActivity'
import { DrawerDescription } from './DrawerDescription'
import { DrawerHeader } from './DrawerHeader'
import { DrawerProperties } from './DrawerProperties'
import { DrawerSubtasks } from './DrawerSubtasks'
import { DrawerTitleField } from './DrawerTitleField'
import { useDebouncedAutosave } from './useDebouncedAutosave'

type DrawerPanelProps = {
  taskId: string
  onClose: () => void
}

export function DrawerPanel({ taskId, onClose }: DrawerPanelProps) {
  const currentUserId = useFlowStore((state) => state.currentUserId)
  const updateTask = useFlowStore((state) => state.updateTask)
  const createTask = useFlowStore((state) => state.createTask)
  const deleteTask = useFlowStore((state) => state.deleteTask)
  const moveTaskToList = useFlowStore((state) => state.moveTaskToList)
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const taskStamp = useFlowStore((state) => {
    const task = state.tasks[taskId]
    if (!task) {
      return ''
    }
    return `${task.title}:${task.description}:${task.statusId}:${task.priority}:${task.dueDate ?? ''}:${task.assigneeIds.join(',')}:${task.activity.length}:${task.updatedAt}`
  })
  const subtasksStamp = useFlowStore((state) =>
    Object.values(state.tasks)
      .filter((task) => task.parentTaskId === taskId)
      .map(
        (task) =>
          `${task.id}:${task.title}:${task.statusId}:${task.archivedAt ?? ''}:${task.updatedAt}`,
      )
      .sort()
      .join('\0'),
  )
  const usersStamp = useFlowStore((state) =>
    Object.values(state.users)
      .map((user) => `${user.id}:${user.name}`)
      .join('\0'),
  )

  const {
    task,
    statuses,
    subtasks,
    breadcrumb,
    listName,
    lists,
    canEdit,
    users,
  } = useMemo(() => {
    void currentUserId
    void taskStamp
    void subtasksStamp
    void usersStamp
    const state = getDefaultFlowStore().getState()
    const found = selectTaskById(state, taskId)
    if (!found) {
      return {
        task: null,
        statuses: [],
        subtasks: [],
        breadcrumb: '',
        listName: '',
        lists: [],
        canEdit: false,
        users: [],
      }
    }
    return {
      task: found,
      statuses: selectStatusesForList(state, found.listId),
      subtasks: selectSubtasks(state, taskId),
      breadcrumb: selectBreadcrumb(state, found.listId)
        .filter((node) => node.kind !== 'workspace')
        .map((node) => node.name)
        .join(' / '),
      listName: state.nodes[found.listId]?.name ?? 'List',
      lists: selectEditableLists(state),
      canEdit: selectCanEditTask(state, taskId),
      users: Object.values(state.users),
    }
  }, [currentUserId, taskId, taskStamp, subtasksStamp, usersStamp])

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')

  useEffect(() => {
    if (!task) {
      return
    }
    setTitle(task.title)
    setDescription(task.description)
  }, [task?.id, task?.updatedAt, task?.title, task?.description])

  const saveTitle = useDebouncedAutosave({
    value: title,
    enabled: Boolean(task) && canEdit,
    save: async (nextTitle) => {
      if (!task || nextTitle.trim() === task.title) {
        return true
      }
      const result = await updateTask({ taskId, title: nextTitle })
      if ('error' in result) {
        notifyMutationError(result.error)
        return false
      }
      return true
    },
  })

  const saveDescription = useDebouncedAutosave({
    value: description,
    enabled: Boolean(task) && canEdit,
    save: async (nextDescription) => {
      if (!task || nextDescription === task.description) {
        return true
      }
      const result = await updateTask({ taskId, description: nextDescription })
      if ('error' in result) {
        notifyMutationError(result.error)
        return false
      }
      return true
    },
  })

  const saveStatus =
    saveTitle === 'error' || saveDescription === 'error'
      ? 'error'
      : saveTitle === 'saving' || saveDescription === 'saving'
        ? 'saving'
        : saveTitle === 'saved' || saveDescription === 'saved'
          ? 'saved'
          : 'idle'

  if (!task) {
    return (
      <div className="flex h-full flex-col">
        <DrawerHeader
          breadcrumb="Task unavailable"
          taskId={taskId}
          taskTitle="Unavailable"
          saveStatus="idle"
          readOnly
          onClose={onClose}
        />
        <p className="p-4 text-body text-muted-foreground">
          This task is no longer visible.
        </p>
      </div>
    )
  }

  const assignees = task.assigneeIds
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is (typeof users)[number] => Boolean(user))
    .map((user) => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    }))

  const persist = async (
    patch: Parameters<typeof updateTask>[0],
  ): Promise<void> => {
    const result = await updateTask(patch)
    if ('error' in result) {
      notifyMutationError(result.error, {
        onRetry: () => {
          void persist(patch)
        },
      })
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <DrawerHeader
        breadcrumb={breadcrumb}
        taskId={task.id}
        taskTitle={task.title}
        saveStatus={saveStatus}
        readOnly={!canEdit}
        onClose={onClose}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DrawerTitleField
          value={title}
          disabled={!canEdit}
          onChange={setTitle}
        />
        <DrawerProperties
          statusId={task.statusId}
          statuses={statuses}
          priority={task.priority}
          dueDate={task.dueDate}
          listId={task.listId}
          listName={listName}
          lists={lists}
          assignees={assignees}
          users={users}
          disabled={!canEdit}
          onStatusChange={(statusId) => {
            void (async () => {
              const previous = task.statusId
              await persist({ taskId, statusId })
              if (statusId === previous) {
                return
              }
              const next = getDefaultFlowStore().getState().tasks[taskId]
              if (!next || next.statusId !== statusId) {
                return
              }
              const name =
                statuses.find((item) => item.id === statusId)?.name ?? 'status'
              toastSuccess(`Moved to ${name}`)
            })()
          }}
          onPriorityChange={(priority: Priority) => {
            void persist({ taskId, priority })
          }}
          onDueDateChange={(dueDate) => {
            void persist({ taskId, dueDate })
          }}
          onAssigneesChange={(assigneeIds) => {
            void persist({ taskId, assigneeIds })
          }}
          onListChange={(targetListId) => {
            void (async () => {
              const result = await moveTaskToList({ taskId, targetListId })
              if ('error' in result) {
                notifyMutationError(result.error)
                return
              }
              const name =
                getDefaultFlowStore().getState().nodes[targetListId]?.name ??
                'list'
              toastSuccess(`Moved to ${name}`)
            })()
          }}
        />
        <DrawerDescription
          value={description}
          disabled={!canEdit}
          onChange={setDescription}
        />
        {task.parentTaskId == null ? (
          <DrawerSubtasks
            subtasks={subtasks}
            statuses={statuses}
            disabled={!canEdit}
            onOpen={openDrawer}
            onAdd={async (subTitle) => {
              const todoStatus =
                statuses.find((item) => item.category === 'todo') ?? statuses[0]
              if (!todoStatus) {
                notifyMutationError({
                  code: 'INVALID_STATUS',
                  message: 'This list has no statuses',
                })
                return
              }
              const result = await createTask({
                listId: task.listId,
                title: subTitle,
                statusId: todoStatus.id,
                parentTaskId: task.id,
              })
              if ('error' in result) {
                notifyMutationError(result.error)
              }
            }}
            onToggleDone={async (subtaskId, done) => {
              const target = done
                ? statuses.find((item) => item.category === 'done')
                : (statuses.find((item) => item.category === 'todo') ??
                  statuses[0])
              if (!target) {
                return
              }
              const result = await updateTask({
                taskId: subtaskId,
                statusId: target.id,
              })
              if ('error' in result) {
                notifyMutationError(result.error)
              }
            }}
            onDelete={async (subtaskId) => {
              const result = await deleteTask(subtaskId)
              if ('error' in result) {
                notifyMutationError(result.error)
                return
              }
              toastSuccess('Subtask deleted')
            }}
          />
        ) : null}
        <DrawerActivity
          activity={task.activity}
          users={users}
          createdAt={task.createdAt}
          createdById={task.createdById}
        />
      </div>
    </div>
  )
}

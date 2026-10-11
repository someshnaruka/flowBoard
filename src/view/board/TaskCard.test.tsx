import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDefaultFlowStore } from '@/tests/reset-store'
import { TooltipProvider } from '@/view/ui/tooltip'
import { TaskCard } from './TaskCard'

function renderCard(taskId = 'task-backlog-1', onOpen = vi.fn()) {
  return {
    onOpen,
    ...render(
      <TooltipProvider>
        <TaskCard taskId={taskId} onOpen={onOpen} />
      </TooltipProvider>,
    ),
  }
}

describe('TaskCard', () => {
  beforeEach(() => {
    resetDefaultFlowStore()
  })

  it('renders title, priority, and assignees from seed', () => {
    renderCard('task-backlog-1')

    expect(
      screen.getByText('Audit tree permission edges'),
    ).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByLabelText('Alice Admin')).toBeInTheDocument()
  })

  it('calls onOpen when activated', async () => {
    const user = userEvent.setup()
    const { onOpen } = renderCard('task-backlog-2')

    await user.click(screen.getByText('Design empty states for board'))
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('shows Unassigned when there are no assignees', () => {
    renderCard('task-backlog-5')

    expect(screen.getByText('Unassigned')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders title, description, and action', () => {
    render(
      <EmptyState
        title="No tasks here"
        description="Drop a task or add one."
        action={<button type="button">Add task</button>}
      />,
    )

    expect(screen.getByText('No tasks here')).toBeInTheDocument()
    expect(screen.getByText('Drop a task or add one.')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add task' }),
    ).toBeInTheDocument()
  })

  it('renders an optional icon', () => {
    render(
      <EmptyState
        title="Empty"
        icon={<span data-testid="empty-icon">📋</span>}
      />,
    )

    expect(screen.getByTestId('empty-icon')).toBeInTheDocument()
  })
})

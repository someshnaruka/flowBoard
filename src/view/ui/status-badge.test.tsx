import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PriorityBadge } from './priority-badge'
import { StatusBadge } from './status-badge'

describe('StatusBadge', () => {
  it('renders status variants from theme tokens', () => {
    const { rerender } = render(<StatusBadge status="todo" />)
    expect(screen.getByText('To do').className).toContain('bg-status-todo-muted')

    rerender(<StatusBadge status="active" label="In progress" />)
    expect(screen.getByText('In progress').className).toContain(
      'text-status-active',
    )

    rerender(<StatusBadge status="done" />)
    expect(screen.getByText('Done').className).toContain('bg-status-done-muted')
  })
})

describe('PriorityBadge', () => {
  it('renders priority variants from theme tokens', () => {
    render(<PriorityBadge priority="urgent" />)
    expect(screen.getByText('Urgent').className).toContain(
      'bg-priority-urgent-muted',
    )
  })
})

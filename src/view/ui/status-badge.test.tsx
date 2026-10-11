import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PriorityBadge } from './priority-badge'
import { StatusBadge } from './status-badge'

describe('StatusBadge', () => {
  it('renders status variants from theme tokens', () => {
    const { rerender } = render(<StatusBadge status="todo" />)
    expect(screen.getByText('TODO').parentElement?.className).toContain(
      'bg-status-todo-muted',
    )
    expect(screen.getByText('TODO').parentElement?.className).not.toMatch(
      /border-status/,
    )

    rerender(<StatusBadge status="active" label="In Progress" />)
    expect(screen.getByText('In Progress').parentElement?.className).toContain(
      'text-status-active',
    )

    rerender(<StatusBadge status="done" />)
    expect(screen.getByText('Done').parentElement?.className).toContain(
      'bg-status-done-muted',
    )

    rerender(
      <StatusBadge status="todo" color="#2563EB" label="Custom blue" />,
    )
    expect(screen.getByText('Custom blue').parentElement?.className).toContain(
      'bg-status-active-muted',
    )
  })
})

describe('PriorityBadge', () => {
  it('renders priority variants from theme tokens', () => {
    render(<PriorityBadge priority="urgent" />)
    expect(screen.getByText('Urgent').parentElement?.className).toContain(
      'bg-priority-urgent-muted',
    )
    expect(screen.getByText('Urgent').parentElement?.className).not.toMatch(
      /border-priority/,
    )
  })
})

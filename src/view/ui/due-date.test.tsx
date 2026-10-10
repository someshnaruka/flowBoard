import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DueDate, resolveTone } from './due-date'

describe('DueDate', () => {
  it('marks past dates overdue', () => {
    expect(resolveTone('2026-10-01', '2026-10-10')).toBe('overdue')
    render(<DueDate dueDate="2026-10-01" today="2026-10-10" />)
    expect(screen.getByText(/Oct/).getAttribute('data-tone')).toBe('overdue')
  })

  it('shows empty label when missing', () => {
    render(<DueDate dueDate={null} />)
    expect(screen.getByText('No date')).toBeInTheDocument()
  })
})

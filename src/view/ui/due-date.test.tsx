import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DueDate, resolveTone } from './due-date'

describe('DueDate', () => {
  it('marks past dates overdue with Figma compact label', () => {
    expect(resolveTone('2026-10-01', '2026-10-10')).toBe('overdue')
    render(<DueDate dueDate="2026-10-01" today="2026-10-10" />)
    const el = screen.getByText(/overdue/)
    expect(el.getAttribute('data-tone')).toBe('overdue')
    expect(el.textContent).toMatch(/· overdue/)
  })

  it('uses detail overdue copy in the drawer', () => {
    render(
      <DueDate dueDate="2026-10-01" today="2026-10-10" variant="detail" />,
    )
    expect(screen.getByText(/days overdue/)).toBeInTheDocument()
  })

  it('shows empty label when missing', () => {
    render(<DueDate dueDate={null} />)
    expect(screen.getByText('No date')).toBeInTheDocument()
  })
})

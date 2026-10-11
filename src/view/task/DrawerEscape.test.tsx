import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { getDefaultFlowStore } from '@/controller/store'
import { resetDefaultFlowStore } from '@/tests/reset-store'
import { KeyboardShortcuts } from '@/view/shortcuts/KeyboardShortcuts'
import { ThemeProvider } from '@/view/theme/ThemeProvider'
import { TooltipProvider } from '@/view/ui/tooltip'
import { TaskDrawer } from './TaskDrawer'

describe('Drawer Escape', () => {
  beforeEach(() => {
    resetDefaultFlowStore()
  })

  it('closes the open task drawer when Escape is pressed', async () => {
    const user = userEvent.setup()
    getDefaultFlowStore().getState().openDrawer('task-backlog-1')

    render(
      <ThemeProvider>
        <TooltipProvider>
          <TaskDrawer />
          <KeyboardShortcuts />
        </TooltipProvider>
      </ThemeProvider>,
    )

    expect(
      await screen.findByDisplayValue('Audit tree permission edges'),
    ).toBeInTheDocument()
    expect(getDefaultFlowStore().getState().drawerTaskId).toBe(
      'task-backlog-1',
    )

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(getDefaultFlowStore().getState().drawerTaskId).toBeNull()
    })
  })
})

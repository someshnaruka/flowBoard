import { beforeEach, describe, expect, it, vi } from 'vitest'

const toastMock = vi.hoisted(() => vi.fn())

vi.mock('sonner', () => ({
  toast: Object.assign(toastMock, {
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

import { notifyMutationError } from './toasts'

describe('notifyMutationError', () => {
  beforeEach(() => {
    toastMock.mockClear()
  })

  it('maps FORBIDDEN to the permission-denied toast title', () => {
    notifyMutationError({
      code: 'FORBIDDEN',
      message: '403 Forbidden: edit on list-sprint',
    })

    expect(toastMock).toHaveBeenCalled()
    expect(toastMock.mock.calls[0]?.[0]).toBe('403 Forbidden')
  })
})

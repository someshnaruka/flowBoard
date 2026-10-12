import { describe, expect, it } from 'vitest'
import { isErr, isOk } from '../errors'
import { createSeed } from '../seed'
import type { AppState, ContainerNode, Grant, User } from '../types'
import {
  assertCan,
  canEdit,
  canView,
  filterTree,
  findNearestGrant,
} from './permission.service'

function collectIds(
  nodes: ReturnType<typeof filterTree>,
): { id: string; isShell: boolean }[] {
  const out: { id: string; isShell: boolean }[] = []
  const walk = (list: typeof nodes) => {
    for (const item of list) {
      out.push({ id: item.id, isShell: item.isShell })
      walk(item.children)
    }
  }
  walk(nodes)
  return out
}

function miniState(overrides?: {
  grants?: Record<string, Grant>
  nodes?: Record<string, ContainerNode>
}): AppState {
  const seed = createSeed()
  return {
    ...seed,
    nodes: overrides?.nodes ?? seed.nodes,
    grants: overrides?.grants ?? {},
    users: {
      'user-alice': seed.users['user-alice'] as User,
      'user-bob': seed.users['user-bob'] as User,
      'user-member': {
        id: 'user-member',
        name: 'Member',
        email: 'member@flowboard.dev',
        role: 'member',
        color: '#64748b',
        avatarUrl: '',
      },
    },
  }
}

describe('permission service', () => {
  describe('admin', () => {
    it('bypasses private and denied nodes', () => {
      const state = createSeed()
      expect(canView(state, 'user-alice', 'space-leadership')).toBe(true)
      expect(canView(state, 'user-alice', 'list-sprint')).toBe(true)
      expect(canEdit(state, 'user-alice', 'list-okrs')).toBe(true)
      expect(isOk(assertCan(state, 'user-alice', 'list-okrs', 'edit'))).toBe(
        true,
      )
    })
  })

  describe('public and private defaults', () => {
    it('allows members on public nodes with no grants', () => {
      const state = miniState()
      expect(canView(state, 'user-member', 'space-engineering')).toBe(true)
      expect(canView(state, 'user-member', 'list-backlog')).toBe(true)
    })

    it('hides private ancestors without an allow grant', () => {
      const state = miniState()
      expect(canView(state, 'user-member', 'space-leadership')).toBe(false)
      expect(canView(state, 'user-member', 'list-okrs')).toBe(false)
    })
  })

  describe('grants', () => {
    it('allow overrides private', () => {
      const state = miniState({
        grants: {
          'g-allow': {
            id: 'g-allow',
            userId: 'user-member',
            nodeId: 'space-leadership',
            effect: 'allow',
          },
        },
      })
      expect(canView(state, 'user-member', 'space-leadership')).toBe(true)
      expect(canView(state, 'user-member', 'list-okrs')).toBe(true)
    })

    it('deny blocks an otherwise public node', () => {
      const state = miniState({
        grants: {
          'g-deny': {
            id: 'g-deny',
            userId: 'user-member',
            nodeId: 'list-sprint',
            effect: 'deny',
          },
        },
      })
      expect(canView(state, 'user-member', 'list-sprint')).toBe(false)
      expect(canView(state, 'user-member', 'list-backlog')).toBe(true)
    })

    it('view grant is read-only', () => {
      const state = miniState({
        grants: {
          'g-view': {
            id: 'g-view',
            userId: 'user-member',
            nodeId: 'list-backlog',
            effect: 'view',
          },
        },
      })
      expect(canView(state, 'user-member', 'list-backlog')).toBe(true)
      expect(canEdit(state, 'user-member', 'list-backlog')).toBe(false)
      const forbidden = assertCan(state, 'user-member', 'list-backlog', 'edit')
      expect(isErr(forbidden)).toBe(true)
      if (isErr(forbidden)) {
        expect(forbidden.error.message).toMatch(/Forbidden/)
        expect(forbidden.error.message).not.toMatch(/403/)
      }
    })

    it('nearest grant wins over farther ancestors', () => {
      const state = miniState({
        grants: {
          'g-space-allow': {
            id: 'g-space-allow',
            userId: 'user-member',
            nodeId: 'space-engineering',
            effect: 'allow',
          },
          'g-list-deny': {
            id: 'g-list-deny',
            userId: 'user-member',
            nodeId: 'list-sprint',
            effect: 'deny',
          },
        },
      })
      expect(findNearestGrant(state, 'user-member', 'list-sprint')).toBe(
        'deny',
      )
      expect(canView(state, 'user-member', 'list-sprint')).toBe(false)
      expect(canView(state, 'user-member', 'list-backlog')).toBe(true)
    })
  })

  describe('assertCan', () => {
    it('returns FORBIDDEN and NOT_FOUND appropriately', () => {
      const state = createSeed()
      const forbidden = assertCan(state, 'user-bob', 'list-sprint', 'view')
      expect(isErr(forbidden)).toBe(true)
      if (isErr(forbidden)) {
        expect(forbidden.error.code).toBe('FORBIDDEN')
      }

      const missing = assertCan(state, 'user-bob', 'list-missing', 'view')
      expect(isErr(missing)).toBe(true)
      if (isErr(missing)) {
        expect(missing.error.code).toBe('NOT_FOUND')
      }
    })
  })

  describe('filterTree shells', () => {
    it('includes private ancestors as shells when a deep allow grants access', () => {
      const state = miniState({
        grants: {
          'g-list-allow': {
            id: 'g-list-allow',
            userId: 'user-member',
            nodeId: 'list-okrs',
            effect: 'allow',
          },
        },
      })

      expect(canView(state, 'user-member', 'list-okrs')).toBe(true)
      expect(canView(state, 'user-member', 'space-leadership')).toBe(false)

      const flat = collectIds(filterTree(state, 'user-member'))
      const leadership = flat.find((n) => n.id === 'space-leadership')
      const okrs = flat.find((n) => n.id === 'list-okrs')
      expect(leadership).toEqual({ id: 'space-leadership', isShell: true })
      expect(okrs).toEqual({ id: 'list-okrs', isShell: false })
    })
  })

  describe('Alice / Bob / Carol on seed', () => {
    it('matches the documented grants matrix', () => {
      const state = createSeed()

      // Alice admin
      for (const id of [
        'space-engineering',
        'list-backlog',
        'list-sprint',
        'space-leadership',
        'list-okrs',
      ]) {
        expect(canView(state, 'user-alice', id)).toBe(true)
      }

      // Bob
      expect(canView(state, 'user-bob', 'space-engineering')).toBe(true)
      expect(canView(state, 'user-bob', 'list-backlog')).toBe(true)
      expect(canView(state, 'user-bob', 'list-sprint')).toBe(false)
      expect(canView(state, 'user-bob', 'space-leadership')).toBe(false)
      expect(canView(state, 'user-bob', 'list-okrs')).toBe(false)

      // Carol — Backlog is view (read-only), Leadership allow
      expect(canView(state, 'user-carol', 'space-engineering')).toBe(true)
      expect(canView(state, 'user-carol', 'list-backlog')).toBe(true)
      expect(canEdit(state, 'user-carol', 'list-backlog')).toBe(false)
      expect(canView(state, 'user-carol', 'list-sprint')).toBe(true)
      expect(canEdit(state, 'user-carol', 'list-sprint')).toBe(true)
      expect(canView(state, 'user-carol', 'space-leadership')).toBe(true)
      expect(canView(state, 'user-carol', 'list-okrs')).toBe(true)

      const bobTree = collectIds(filterTree(state, 'user-bob')).map((n) => n.id)
      expect(bobTree).toContain('list-backlog')
      expect(bobTree).not.toContain('list-sprint')
      expect(bobTree).not.toContain('space-leadership')

      const carolTree = collectIds(filterTree(state, 'user-carol')).map(
        (n) => n.id,
      )
      expect(carolTree).toContain('list-sprint')
      expect(carolTree).toContain('list-backlog')
      expect(carolTree).toContain('list-okrs')
      expect(
        collectIds(filterTree(state, 'user-carol')).find(
          (n) => n.id === 'space-leadership',
        )?.isShell,
      ).toBe(false)
    })
  })
})

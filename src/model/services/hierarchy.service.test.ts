import { describe, expect, it } from 'vitest'
import { isErr, isOk } from '../errors'
import { createSeed } from '../seed'
import {
  archiveNode,
  createNode,
  moveNode,
  renameNode,
  reorderNode,
  restoreNode,
  validateParent,
} from './hierarchy.service'

describe('hierarchy service', () => {
  it('accepts valid parents and rejects invalid ones', () => {
    const state = createSeed()
    expect(isOk(validateParent(state, 'space', 'workspace-acme'))).toBe(true)
    expect(isOk(validateParent(state, 'folder', 'space-engineering'))).toBe(
      true,
    )
    expect(isOk(validateParent(state, 'list', 'folder-platform'))).toBe(true)

    const underList = validateParent(state, 'folder', 'list-backlog')
    expect(isErr(underList)).toBe(true)
    if (isErr(underList)) {
      expect(underList.error.code).toBe('INVALID_PARENT')
    }

    const spaceUnderFolder = validateParent(state, 'space', 'folder-platform')
    expect(isErr(spaceUnderFolder)).toBe(true)
  })

  it('creates and renames nodes', () => {
    const state = createSeed()
    const created = createNode(state, 'user-alice', {
      kind: 'list',
      name: ' Bugs ',
      parentId: 'folder-platform',
    })
    expect(isOk(created)).toBe(true)
    if (!isOk(created)) {
      return
    }
    expect(created.data.node.name).toBe('Bugs')
    expect(created.data.state.nodes[created.data.node.id]).toBeDefined()

    const renamed = renameNode(created.data.state, 'user-alice', {
      nodeId: created.data.node.id,
      name: 'Quality',
    })
    expect(isOk(renamed)).toBe(true)
    if (isOk(renamed)) {
      expect(renamed.data.node.name).toBe('Quality')
    }
  })

  it('prevents cycles on move', () => {
    const state = createSeed()
    const cyclic = moveNode(state, 'user-alice', {
      nodeId: 'space-engineering',
      newParentId: 'folder-platform',
    })
    expect(isErr(cyclic)).toBe(true)
    if (isErr(cyclic)) {
      expect(cyclic.error.code).toBe('INVALID_PARENT')
    }
  })

  it('reorders a node between siblings', () => {
    const state = createSeed()
    const result = reorderNode(state, 'user-alice', {
      nodeId: 'list-sprint',
      beforeId: 'list-backlog',
    })
    expect(isOk(result)).toBe(true)
    if (!isOk(result)) {
      return
    }
    const backlog = result.data.state.nodes['list-backlog']
    const sprint = result.data.state.nodes['list-sprint']
    expect(sprint?.position).toBeLessThan(backlog?.position ?? 0)
  })

  it('archives with cascade and restores matching stamp', () => {
    const state = createSeed()
    const archived = archiveNode(state, 'user-alice', {
      nodeId: 'folder-platform',
    })
    expect(isOk(archived)).toBe(true)
    if (!isOk(archived)) {
      return
    }

    expect(archived.data.archivedIds).toEqual(
      expect.arrayContaining([
        'folder-platform',
        'list-backlog',
        'list-sprint',
      ]),
    )
    expect(
      archived.data.state.nodes['list-backlog']?.archivedAt,
    ).not.toBeNull()

    const restored = restoreNode(archived.data.state, 'user-alice', {
      nodeId: 'folder-platform',
    })
    expect(isOk(restored)).toBe(true)
    if (!isOk(restored)) {
      return
    }
    expect(restored.data.state.nodes['folder-platform']?.archivedAt).toBeNull()
    expect(restored.data.state.nodes['list-sprint']?.archivedAt).toBeNull()
  })

  it('blocks restore while parent remains archived', () => {
    const state = createSeed()
    const archived = archiveNode(state, 'user-alice', {
      nodeId: 'folder-platform',
    })
    expect(isOk(archived)).toBe(true)
    if (!isOk(archived)) {
      return
    }

    const childOnly = restoreNode(archived.data.state, 'user-alice', {
      nodeId: 'list-backlog',
    })
    expect(isErr(childOnly)).toBe(true)
    if (isErr(childOnly)) {
      expect(childOnly.error.code).toBe('INVALID_PARENT')
    }
  })
})

import { describe, expect, it } from 'vitest'
import { isTypingTarget, SHORTCUT_BINDINGS } from './shortcut-bindings'

describe('shortcut bindings', () => {
  it('lists the required cheatsheet entries', () => {
    const keys = SHORTCUT_BINDINGS.map((item) => item.keys)
    expect(keys).toEqual(
      expect.arrayContaining(['/', 'C', '?', '1', '2', '[', '⌘D', '⌘E']),
    )
  })

  it('treats form fields as typing targets', () => {
    const input = document.createElement('input')
    expect(isTypingTarget(input)).toBe(true)
    const div = document.createElement('div')
    expect(isTypingTarget(div)).toBe(false)
  })
})

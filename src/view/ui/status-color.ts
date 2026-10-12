import type { StatusCategory } from '@/model/types'

/** Tailwind classes for column status dots keyed by Status.color hex. */
const DOT_BY_COLOR: Record<string, string> = {
  '#64748B': 'bg-status-todo',
  '#2563EB': 'bg-status-active',
  '#16A34A': 'bg-status-done',
  '#047857': 'bg-status-done',
}

/** Badge chrome keyed by Status.color hex (Figma 05). */
const DONE_BADGE =
  'bg-status-done-muted text-status-done dark:bg-emerald-500/20 dark:text-emerald-300'

const BADGE_BY_COLOR: Record<string, string> = {
  '#64748B':
    'bg-status-todo-muted text-status-todo dark:bg-slate-800/80 dark:text-slate-300',
  '#2563EB':
    'bg-status-active-muted text-status-active dark:bg-blue-950/50 dark:text-blue-300',
  '#16A34A': DONE_BADGE,
  '#047857': DONE_BADGE,
}

const DOT_BY_CATEGORY: Record<StatusCategory, string> = {
  todo: 'bg-status-todo',
  active: 'bg-status-active',
  done: 'bg-status-done',
}

const BADGE_BY_CATEGORY: Record<StatusCategory, string> = {
  todo: 'bg-status-todo-muted text-status-todo dark:bg-slate-800/80 dark:text-slate-300',
  active:
    'bg-status-active-muted text-status-active dark:bg-blue-950/50 dark:text-blue-300',
  done: DONE_BADGE,
}

function normalizeHex(color: string): string {
  return color.trim().toUpperCase()
}

const DOT_LOOKUP = Object.fromEntries(
  Object.entries(DOT_BY_COLOR).map(([hex, cls]) => [normalizeHex(hex), cls]),
)

const BADGE_LOOKUP = Object.fromEntries(
  Object.entries(BADGE_BY_COLOR).map(([hex, cls]) => [normalizeHex(hex), cls]),
)

export function statusDotClass(
  color: string | undefined,
  category: StatusCategory,
): string {
  if (color) {
    const hit = DOT_LOOKUP[normalizeHex(color)]
    if (hit) {
      return hit
    }
  }
  return DOT_BY_CATEGORY[category]
}

export function statusBadgeClass(
  color: string | undefined,
  category: StatusCategory,
): string {
  if (color) {
    const hit = BADGE_LOOKUP[normalizeHex(color)]
    if (hit) {
      return hit
    }
  }
  return BADGE_BY_CATEGORY[category]
}

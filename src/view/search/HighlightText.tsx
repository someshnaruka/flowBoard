type HighlightTextProps = {
  text: string
  query: string
  className?: string
}

/**
 * Splits `text` on case-insensitive matches of `query` and wraps hits in <mark>.
 */
export function HighlightText({ text, query, className }: HighlightTextProps) {
  const normalized = query.trim()
  if (!normalized) {
    return <span className={className}>{text}</span>
  }

  const lowerText = text.toLowerCase()
  const lowerQuery = normalized.toLowerCase()
  const parts: Array<{ value: string; hit: boolean }> = []
  let cursor = 0

  while (cursor < text.length) {
    const index = lowerText.indexOf(lowerQuery, cursor)
    if (index < 0) {
      parts.push({ value: text.slice(cursor), hit: false })
      break
    }
    if (index > cursor) {
      parts.push({ value: text.slice(cursor, index), hit: false })
    }
    parts.push({
      value: text.slice(index, index + normalized.length),
      hit: true,
    })
    cursor = index + normalized.length
  }

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.hit ? (
          <mark
            key={`${index}-${part.value}`}
            className="rounded-badge bg-brand/20 px-0.5 text-inherit"
          >
            {part.value}
          </mark>
        ) : (
          <span key={`${index}-${part.value}`}>{part.value}</span>
        ),
      )}
    </span>
  )
}

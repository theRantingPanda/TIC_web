/**
 * Shared conversion from captured Wix blocks to Markdown.
 *
 * Used by both `port:blog` and `port:page` — the Wix quirks below are properties of the
 * source site, not of any one page type, so the handling belongs in one place.
 */

export type Block = {
  type: string
  level?: number
  text?: string
  items?: string[]
  ordered?: boolean
  src?: string
  localPath?: string | null
  alt?: string
}

/**
 * Wix emits every bulleted list twice: once as a <ul>/<ol>, then again as loose <p>
 * elements carrying the same strings. The page shows one list, so the duplicates go.
 *
 * The echo is NOT always a contiguous run after its list. Where a list is nested, the
 * child list and its own echo are interleaved into the parent's — on /privacy the
 * sequence is: parent list, echo 1, echo 2, CHILD LIST, child echo x3, echo 3. So
 * matching is by text rather than by position.
 */
export function dropListEchoes(blocks: Block[]): Block[] {
  // Where each item's text first appears as a list item. A paragraph is only treated as
  // an echo if it comes AFTER the list that contains it — a paragraph before the list is
  // lead-in copy, not a duplicate.
  const firstListIndex = new Map<string, number>()
  blocks.forEach((block, i) => {
    if (block.type !== 'list' || !block.items) return
    for (const item of block.items) {
      const key = firstLine(item)
      if (key && !firstListIndex.has(key)) firstListIndex.set(key, i)
    }
  })

  if (firstListIndex.size === 0) return blocks

  return blocks.filter((block, i) => {
    if (block.type !== 'paragraph') return true
    const at = firstListIndex.get((block.text ?? '').trim())
    return at === undefined || i < at
  })
}

/**
 * An item that carries a nested list has the child bullets appended to its own text,
 * but the echo paragraph Wix emits alongside carries only the parent line. Comparing on
 * the first line matches both that case and the ordinary one, where the item is a single
 * line and this is an exact comparison.
 */
function firstLine(item: string): string {
  return item.split('\n')[0].trim()
}

/**
 * Flattens a list item that has a nested list baked into its own text.
 *
 * Wix can serialise a nested list twice: the parent item's text contains the child
 * bullets separated by newlines, AND the children appear again as the next list block.
 * Left alone that publishes the same bullets twice.
 *
 * The parent item is truncated to its first line ONLY when the remaining lines are
 * exactly the following list's items — i.e. only when the duplicate is proven, never on
 * a hunch. Anything else is left untouched, since dropping unverified text from a
 * privacy policy would be a genuine loss.
 */
export function unnestListItems(blocks: Block[]): Block[] {
  return blocks.map((block, i) => {
    if (block.type !== 'list' || !block.items) return block

    const nextList = blocks.slice(i + 1).find((b) => b.type === 'list')
    if (!nextList?.items) return block

    const items = block.items.map((item) => {
      const lines = item
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      if (lines.length < 2) return item

      const [head, ...tail] = lines
      const duplicated =
        tail.length === nextList.items!.length &&
        tail.every((line, k) => line === nextList.items![k].trim())

      return duplicated ? head : lines.join(' ')
    })

    return { ...block, items }
  })
}

/** Markdown special characters that would otherwise change how the text renders. */
export function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_{}[\]<>])/g, '\\$1')
}

/**
 * Wix pads layout with paragraphs holding nothing but a zero-width space (U+200B).
 * They carry no meaning and would render as stray blank paragraphs.
 */
export function isBlankBlock(block: Block): boolean {
  return (
    (block.type === 'paragraph' || block.type === 'heading') &&
    (block.text ?? '').replace(/[​\s]/g, '') === ''
  )
}

export function blocksToMarkdown(blocks: Block[], minHeadingLevel = 2): string {
  const parts: string[] = []

  for (const block of blocks) {
    if (isBlankBlock(block)) continue

    switch (block.type) {
      case 'heading': {
        const level = Math.min(Math.max(block.level ?? minHeadingLevel, minHeadingLevel), 6)
        parts.push(`${'#'.repeat(level)} ${escapeMarkdown(block.text ?? '')}`)
        break
      }
      case 'paragraph':
        parts.push(escapeMarkdown(block.text ?? ''))
        break
      case 'list': {
        const marker = (i: number) => (block.ordered ? `${i + 1}.` : '-')
        parts.push(
          (block.items ?? [])
            .map((item, i) => `${marker(i)} ${escapeMarkdown(item.replace(/\s+/g, ' ').trim())}`)
            .join('\n'),
        )
        break
      }
      case 'image': {
        // localPath is written by capture:assets. Without it there is no local copy to
        // reference, and hotlinking Wix is explicitly out.
        if (!block.localPath) break
        parts.push(`![${(block.alt ?? '').replace(/[[\]]/g, '')}](${block.localPath})`)
        break
      }
      default:
        break
    }
  }

  return parts.join('\n\n')
}

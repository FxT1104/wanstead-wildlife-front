import { describe, expect, it } from 'vitest'
import { readingMinutes, splitLongParagraph } from './split'

const sentence = (n: number, i: number) => `Sentence ${i} ${'word '.repeat(n - 3).trim()}.`
const text = (runs: { text: string }[]) => runs.map((r) => r.text).join('')

describe('splitLongParagraph', () => {
  it('leaves short paragraphs alone', () => {
    const runs = [{ text: 'A short paragraph. With two sentences.' }]
    expect(splitLongParagraph(runs)).toEqual([runs])
  })

  it('splits long paragraphs only at sentence ends, without changing the text', () => {
    const original = Array.from({ length: 8 }, (_, i) => sentence(20, i)).join(' ')
    const chunks = splitLongParagraph([{ text: original }])
    expect(chunks.length).toBeGreaterThan(1)
    chunks.forEach((c) => expect(text(c).trim().endsWith('.')).toBe(true))
    expect(chunks.map(text).join(' ')).toBe(original)
  })

  it('does not split after common abbreviations', () => {
    const original = `${'word '.repeat(75)}near St. Mary's church. ${'word '.repeat(40).trim()}.`
    const chunks = splitLongParagraph([{ text: original }])
    expect(chunks.map(text).some((t) => t.endsWith('St.'))).toBe(false)
  })

  it('never cuts inside a link', () => {
    const runs = [
      { text: `${sentence(40, 1)} ${sentence(40, 2)} ` },
      { text: 'A linked sentence. That continues here.', href: '/archive/x' },
      { text: ` ${sentence(40, 3)}` },
    ]
    const chunks = splitLongParagraph(runs)
    const link = chunks.flat().filter((r) => 'href' in r && r.href)
    expect(link).toEqual([{ text: 'A linked sentence. That continues here.', href: '/archive/x' }])
  })
})

describe('readingMinutes', () => {
  it('rounds to whole minutes, at least one', () => {
    expect(readingMinutes('a few words')).toBe(1)
    expect(readingMinutes('word '.repeat(1000))).toBe(5)
  })
})

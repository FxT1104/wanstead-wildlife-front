import { describe, expect, it } from 'vitest'
import { excerptOf, toBlocks } from './officialArticles'

describe('toBlocks', () => {
  it('splits paragraphs on empty lines and reads "## " headings', () => {
    expect(toBlocks('First line\nsame paragraph\r\n\r\n## Where to look\n\nSecond')).toEqual([
      { kind: 'paragraph', text: 'First line\nsame paragraph' },
      { kind: 'heading', text: 'Where to look', id: 'section-where-to-look' },
      { kind: 'paragraph', text: 'Second' },
    ])
  })

  it('keeps heading ids unique and never interprets HTML', () => {
    const blocks = toBlocks('## Birds\n\n## Birds\n\n<img src=x onerror=alert(1)>')
    expect(blocks.map((b) => ('id' in b ? b.id : b.text))).toEqual([
      'section-birds',
      'section-birds-2',
      '<img src=x onerror=alert(1)>',
    ])
  })
})

describe('excerptOf', () => {
  it('prefers the summary, otherwise cuts the text on a word', () => {
    expect(excerptOf({ summary: ' Short. ', content: 'Long text' })).toBe('Short.')
    expect(excerptOf({ summary: null, content: '## Title\n\nOne two three four', }, 12)).toBe('One two…')
  })
})

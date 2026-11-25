import { describe, expect, it } from 'vitest'
import { excerpt, parseCategories, validatePost } from './validation'
import type { CommunityPostInput } from './types'

const valid: CommunityPostInput = {
  title: 'A heron at the pond',
  category: 'Birds',
  authorName: '',
  place: 'Wanstead Park',
  body: 'It stood still for ten minutes.',
  photo: null,
  photoAlt: '',
}

const file = (type: string, size: number) => new File([new Uint8Array(size)], 'photo', { type })
const fields = (input: CommunityPostInput) => validatePost(input).map((e) => e.field)

describe('validatePost', () => {
  it('accepts a complete post without photo', () => {
    expect(validatePost(valid)).toEqual([])
  })

  it('requires a title, a category and a body', () => {
    expect(fields({ ...valid, title: '  ', category: '', body: '' })).toEqual(['title', 'category', 'body'])
  })

  it('rejects text over the limits', () => {
    expect(fields({ ...valid, title: 'x'.repeat(141), authorName: 'x'.repeat(81), place: 'x'.repeat(121) })).toEqual([
      'title',
      'authorName',
      'place',
    ])
  })

  it('requires a description when a photo is added', () => {
    expect(fields({ ...valid, photo: file('image/jpeg', 10) })).toEqual(['photoAlt'])
    expect(fields({ ...valid, photo: file('image/jpeg', 10), photoAlt: 'A heron' })).toEqual([])
  })

  it('rejects other file types and photos over 5 MB', () => {
    expect(fields({ ...valid, photo: file('image/gif', 10), photoAlt: 'x' })).toEqual(['photo'])
    expect(fields({ ...valid, photo: file('image/png', 5 * 1024 * 1024 + 1), photoAlt: 'x' })).toEqual(['photo'])
  })
})

describe('parseCategories', () => {
  it('keeps only known categories, single or repeated', () => {
    expect(parseCategories('Birds')).toEqual(['Birds'])
    expect(parseCategories(['Birds', 'Dragons', 'Pond life'])).toEqual(['Birds', 'Pond life'])
    expect(parseCategories(undefined)).toEqual([])
  })
})

describe('excerpt', () => {
  it('normalises spaces and shortens long text', () => {
    expect(excerpt('a\n\n b')).toBe('a b')
    expect(excerpt('word '.repeat(50), 20)).toBe('word word word wo…')
  })
})

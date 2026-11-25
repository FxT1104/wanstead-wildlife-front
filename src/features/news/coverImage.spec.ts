import { describe, expect, it } from 'vitest'
import { coverFor, topicOf } from './coverImage'

describe('coverFor', () => {
  it('uses the article photo when there is one', () => {
    expect(coverFor({ title: 'Moths', excerpt: '', image: 'https://x/y.jpg' })).toEqual({ src: 'https://x/y.jpg', illustration: false })
  })

  it('otherwise picks an illustration matching the subject', () => {
    expect(topicOf('Invertebrates in August 2012')).toBe('insects')
    expect(topicOf('Protecting the Skylarks')).toBe('birds')
    expect(topicOf('More Mink sightings in Wanstead Park')).toBe('mammals')
    expect(topicOf('Loss of Creeping Willow on Wanstead Flats')).toBe('plants')
    expect(topicOf('WansteadWildlife in 2019')).toBeNull()
    expect(coverFor({ title: 'Bees and Honey', excerpt: '', image: null })).toEqual({
      src: '/assets/groups/insects.webp',
      illustration: true,
    })
  })

  it('uses a site landscape, stable for a given title, when the subject is unknown', () => {
    const a = coverFor({ title: 'WansteadWildlife in 2019', excerpt: '', image: null })
    expect(a.illustration).toBe(false)
    expect(['/assets/parkland-atlas.webp', '/assets/wanstead-fieldbook.webp']).toContain(a.src)
    expect(coverFor({ title: 'WansteadWildlife in 2019', excerpt: '', image: null })).toEqual(a)
  })
})

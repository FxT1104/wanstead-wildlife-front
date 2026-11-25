import { describe, expect, it } from 'vitest'
import { applyPreferences, cleanPreferences, DEFAULT_PREFERENCES } from './preferences'

describe('cleanPreferences', () => {
  it('returns defaults for missing or invalid input', () => {
    expect(cleanPreferences(undefined)).toEqual(DEFAULT_PREFERENCES)
    expect(cleanPreferences('corrupt')).toEqual(DEFAULT_PREFERENCES)
    expect(cleanPreferences({ scale: 999, contrast: 'neon', spacing: 'yes' })).toEqual(DEFAULT_PREFERENCES)
  })

  it('keeps valid values', () => {
    const prefs = { scale: 130, contrast: 'high', colours: 'neutral', spacing: true, font: true, motion: true }
    expect(cleanPreferences(prefs)).toEqual(prefs)
  })

  it('accepts the low-brightness mode', () => {
    expect(cleanPreferences({ contrast: 'low' }).contrast).toBe('low')
  })

  it('accepts the scale as a string (form values)', () => {
    expect(cleanPreferences({ scale: '115' }).scale).toBe(115)
  })
})

describe('applyPreferences', () => {
  it('sets the attributes and classes the stylesheets rely on', () => {
    const root = document.createElement('html')
    applyPreferences({ scale: 115, contrast: 'high', colours: 'neutral', spacing: true, font: false, motion: true }, root)

    expect(root.style.fontSize).toBe('115%')
    expect(root.dataset.contrast).toBe('high')
    expect(root.dataset.colours).toBe('neutral')
    expect(root.classList.contains('reading-space')).toBe(true)
    expect(root.classList.contains('simple-headings')).toBe(false)
    expect(root.classList.contains('reduce-motion')).toBe(true)
  })
})

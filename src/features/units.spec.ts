import { describe, expect, it } from 'vitest'
import { search, searchCatalogue } from './search/search'
import { slugify } from '@/lib/slug'
import { decodeJwt } from './auth/useAuth'
import { validateSupport } from './support/support'
import { fakeJwt } from '@/test/jwt'

describe('search', () => {
  it('finds a group by its example species, ignoring case and accents', () => {
    expect(search(searchCatalogue, 'FRÔG').map((r) => r.title)).toEqual(['Fish, Amphibians, Reptiles'])
  })

  it('requires every word and can filter by kind', () => {
    expect(search(searchCatalogue, 'wanstead park', 'places').map((r) => r.title)).toEqual(['Wanstead Park'])
    expect(search(searchCatalogue, 'wanstead park', 'wildlife')).toEqual([])
  })

  it('returns everything for an empty query', () => {
    expect(search(searchCatalogue, '  ')).toHaveLength(searchCatalogue.length)
  })
})

describe('slugify', () => {
  it('produces the format required by the API', () => {
    expect(slugify("Gilbert's Slade – été 2026!")).toBe('gilberts-slade-ete-2026')
    expect(slugify('  --Hello   World--  ')).toBe('hello-world')
  })
})

describe('decodeJwt', () => {
  it('reads the email, roles and expiry', () => {
    const claims = decodeJwt(fakeJwt({ username: 'admin@example.test', roles: ['ROLE_ADMIN'], exp: 2_000_000_000 }))
    expect(claims).toEqual({ username: 'admin@example.test', roles: ['ROLE_ADMIN'], exp: 2_000_000_000 })
  })

  it('returns null for malformed tokens', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull()
    expect(decodeJwt(fakeJwt({ roles: [] }))).toBeNull()
    expect(decodeJwt(null)).toBeNull()
  })
})

describe('validateSupport', () => {
  const base = { topic: 'support' as const, subject: 'Broken link', description: 'On the birds page.', email: '', page: '' }

  it('accepts a request without email', () => {
    expect(validateSupport(base)).toEqual([])
  })

  it('checks required fields and the email format', () => {
    const fields = validateSupport({ ...base, subject: '', description: ' ', email: 'nope' }).map((e) => e.field)
    expect(fields).toEqual(['subject', 'description', 'email'])
  })
})


describe('reference', () => {
  it('uses the random end of a UUID v7, not its time-based start', async () => {
    const { reference } = await import('./support/support')
    const a = reference('01a208a4-7219-7f7f-b482-735e7ab1f3c4')
    const b = reference('01a208a4-7219-7f80-9c11-0d2f44e8aa07')
    expect(a).toBe('7AB1F3C4')
    expect(a).not.toBe(b)
  })
})
